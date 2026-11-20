const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const prisma = require('../../src/db/prisma');

// Postulacion -> Oferta y Postulacion -> Estudiante no tienen borrado en cascada,
// así que las postulaciones se borran primero
const limpiarBase = async () => {
  await prisma.postulacion.deleteMany();
  await prisma.oferta.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.institucionEducativa.deleteMany();
};

const conToken = (token) => ({ Authorization: `Bearer ${token}` });
const dias = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

let tokenVerificada;
let tokenSinVerificar;
let tokenEmpresa;
let empresaId;
let idAna;
let ofertas = {};

const iniciarSesion = async (correo, contrasena) => {
  const respuesta = await request(app).post('/api/auth/login').send({ correo, contrasena });
  return respuesta.body.token;
};

const registrarEstudiante = (nombres, correo) =>
  request(app).post('/api/auth/registro').send({
    nombres,
    apellidos: 'Pérez',
    carrera: 'Ingeniería en Informática',
    correo,
    contrasena: 'Clave1234',
  });

const crearOferta = (datos) =>
  prisma.oferta.create({
    data: {
      empresaId,
      titulo: 'Oferta de prueba',
      descripcion: 'Descripción de la oferta de prueba para postulaciones.',
      tipo: 'PRACTICA',
      modalidad: 'HIBRIDA',
      area: 'Tecnología',
      ubicacion: 'Santiago',
      estado: 'PUBLICADA',
      fechaPublicacion: new Date(),
      fechaLimite: dias(30),
      ...datos,
    },
  });

const postular = (token, ofertaId) =>
  request(app).post('/api/postulaciones').set(conToken(token)).send({ ofertaId });

beforeAll(async () => {
  await limpiarBase();

  await prisma.institucionEducativa.create({ data: { nombre: 'INACAP', dominioCorreo: 'inacapmail.cl' } });

  const empresa = await prisma.usuario.create({
    data: {
      correo: 'contacto@andes.cl',
      contrasenaHash: await bcrypt.hash('Empresa1234', 4),
      rol: 'EMPRESA',
      estadoCuenta: 'ACTIVA',
      empresa: {
        create: { razonSocial: 'Andes SpA', rut: '12345678-5', rubro: 'Tecnología', estadoAprobacion: 'APROBADA' },
      },
    },
    include: { empresa: true },
  });
  empresaId = empresa.empresa.id;

  await registrarEstudiante('Ana', 'ana@inacapmail.cl');
  await registrarEstudiante('Luis', 'luis@inacapmail.cl');

  // Solo Ana queda verificada; Luis sigue sin verificar
  const ana = await prisma.usuario.findUnique({ where: { correo: 'ana@inacapmail.cl' } });
  idAna = ana.id;
  await prisma.estudiante.update({ where: { usuarioId: ana.id }, data: { verificado: true } });

  ofertas.vigente = await crearOferta({ titulo: 'Práctica vigente' });
  ofertas.capacitacion = await crearOferta({ titulo: 'Curso vigente', tipo: 'CAPACITACION' });
  ofertas.fechaVencida = await crearOferta({ titulo: 'Publicada con fecha vencida', fechaLimite: dias(-1) });
  ofertas.cerrada = await crearOferta({ titulo: 'Oferta cerrada', estado: 'CERRADA' });
  ofertas.vencida = await crearOferta({ titulo: 'Oferta vencida', estado: 'VENCIDA' });
  ofertas.oculta = await crearOferta({ titulo: 'Oferta oculta', estado: 'OCULTA' });
  ofertas.borrador = await crearOferta({ titulo: 'Oferta en borrador', estado: 'BORRADOR', fechaPublicacion: null });
  ofertas.eliminada = await crearOferta({ titulo: 'Oferta eliminada', estado: 'ELIMINADA' });

  tokenVerificada = await iniciarSesion('ana@inacapmail.cl', 'Clave1234');
  tokenSinVerificar = await iniciarSesion('luis@inacapmail.cl', 'Clave1234');
  tokenEmpresa = await iniciarSesion('contacto@andes.cl', 'Empresa1234');
});

afterAll(async () => {
  await limpiarBase();
  await prisma.$disconnect();
});

describe('POST /api/postulaciones', () => {
  test('exige iniciar sesión', async () => {
    const respuesta = await request(app).post('/api/postulaciones').send({ ofertaId: ofertas.vigente.id });

    expect(respuesta.statusCode).toBe(401);
  });

  test('rechaza a una empresa', async () => {
    const respuesta = await postular(tokenEmpresa, ofertas.vigente.id);

    expect(respuesta.statusCode).toBe(403);
  });

  test('rechaza un cuerpo sin ofertaId', async () => {
    const respuesta = await request(app).post('/api/postulaciones').set(conToken(tokenVerificada)).send({});

    expect(respuesta.statusCode).toBe(400);
  });

  test('rechaza un ofertaId que no es número', async () => {
    const respuesta = await postular(tokenVerificada, 'abc');

    expect(respuesta.statusCode).toBe(400);
  });

  test('rechaza a un estudiante no verificado', async () => {
    const respuesta = await postular(tokenSinVerificar, ofertas.vigente.id);

    expect(respuesta.statusCode).toBe(403);
    expect(await prisma.postulacion.count({ where: { ofertaId: ofertas.vigente.id } })).toBe(0);
  });

  test('un estudiante verificado postula a una oferta vigente', async () => {
    const respuesta = await postular(tokenVerificada, ofertas.vigente.id);

    expect(respuesta.statusCode).toBe(201);
    expect(respuesta.body.postulacion.ofertaId).toBe(ofertas.vigente.id);
    expect(respuesta.body.postulacion.tipo).toBe('POSTULACION');
    expect(respuesta.body.postulacion.estado).toBe('ENVIADA');
  });

  test('una capacitación se registra como inscripción', async () => {
    const respuesta = await postular(tokenVerificada, ofertas.capacitacion.id);

    expect(respuesta.statusCode).toBe(201);
    expect(respuesta.body.postulacion.tipo).toBe('INSCRIPCION');
  });

  test('no permite postular dos veces a la misma oferta', async () => {
    const respuesta = await postular(tokenVerificada, ofertas.vigente.id);

    expect(respuesta.statusCode).toBe(409);

    const total = await prisma.postulacion.count({ where: { ofertaId: ofertas.vigente.id } });
    expect(total).toBe(1);
  });

  test('otro estudiante verificado sí puede postular a la misma oferta', async () => {
    const luis = await prisma.usuario.findUnique({ where: { correo: 'luis@inacapmail.cl' } });
    await prisma.estudiante.update({ where: { usuarioId: luis.id }, data: { verificado: true } });

    const respuesta = await postular(tokenSinVerificar, ofertas.vigente.id);

    expect(respuesta.statusCode).toBe(201);
  });

  test('no permite postular a una oferta con la fecha límite vencida', async () => {
    const respuesta = await postular(tokenVerificada, ofertas.fechaVencida.id);

    expect(respuesta.statusCode).toBe(409);
  });

  test('no permite postular a una oferta cerrada o vencida', async () => {
    expect((await postular(tokenVerificada, ofertas.cerrada.id)).statusCode).toBe(409);
    expect((await postular(tokenVerificada, ofertas.vencida.id)).statusCode).toBe(409);
  });

  test('responde 404 si la oferta no existe', async () => {
    const respuesta = await postular(tokenVerificada, 999999);

    expect(respuesta.statusCode).toBe(404);
  });

  test('responde 404 para ofertas ocultas, en borrador o eliminadas', async () => {
    expect((await postular(tokenVerificada, ofertas.oculta.id)).statusCode).toBe(404);
    expect((await postular(tokenVerificada, ofertas.borrador.id)).statusCode).toBe(404);
    expect((await postular(tokenVerificada, ofertas.eliminada.id)).statusCode).toBe(404);
  });

  test('las postulaciones rechazadas no se guardan', async () => {
    const estudiante = await prisma.estudiante.findUnique({ where: { usuarioId: idAna } });
    const total = await prisma.postulacion.count({ where: { estudianteId: estudiante.id } });

    expect(total).toBe(2);
  });
});