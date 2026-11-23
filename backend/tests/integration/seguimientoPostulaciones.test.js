const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const prisma = require('../../src/db/prisma');

const limpiarBase = async () => {
  await prisma.postulacion.deleteMany();
  await prisma.oferta.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.institucionEducativa.deleteMany();
};

const conToken = (token) => ({ Authorization: `Bearer ${token}` });
const dias = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

let tokenAna;
let tokenLuis;
let tokenSinPostulaciones;
let tokenEmpresa;
let post = {};

const iniciarSesion = async (correo, contrasena) => {
  const respuesta = await request(app).post('/api/auth/login').send({ correo, contrasena });
  return respuesta.body.token;
};

const registrarEstudiante = async (nombres, correo) => {
  await request(app).post('/api/auth/registro').send({
    nombres,
    apellidos: 'Pérez',
    carrera: 'Ingeniería en Informática',
    correo,
    contrasena: 'Clave1234',
  });
  const usuario = await prisma.usuario.findUnique({ where: { correo } });
  return prisma.estudiante.findUnique({ where: { usuarioId: usuario.id } });
};

const crearOferta = (empresaId, datos) =>
  prisma.oferta.create({
    data: {
      empresaId,
      titulo: 'Oferta de prueba',
      descripcion: 'Descripción de la oferta de prueba para el seguimiento.',
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

const misPostulaciones = (token, consulta = '') =>
  request(app).get(`/api/postulaciones/mias${consulta}`).set(conToken(token));

beforeAll(async () => {
  await limpiarBase();

  await prisma.institucionEducativa.create({ data: { nombre: 'INACAP', dominioCorreo: 'inacapmail.cl' } });

  const usuarioEmpresa = await prisma.usuario.create({
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
  const empresaId = usuarioEmpresa.empresa.id;

  const ana = await registrarEstudiante('Ana', 'ana@inacapmail.cl');
  const luis = await registrarEstudiante('Luis', 'luis@inacapmail.cl');
  await registrarEstudiante('Carla', 'carla@inacapmail.cl');

  const o1 = await crearOferta(empresaId, { titulo: 'Práctica vigente' });
  const o2 = await crearOferta(empresaId, { titulo: 'Oferta cerrada', estado: 'CERRADA' });
  const o3 = await crearOferta(empresaId, { titulo: 'Oferta eliminada', estado: 'ELIMINADA' });

  // Ana tiene tres postulaciones con fechas distintas; Luis solo una
  post.antigua = await prisma.postulacion.create({
    data: { estudianteId: ana.id, ofertaId: o2.id, estado: 'ACEPTADA', fechaPostulacion: dias(-3) },
  });
  post.media = await prisma.postulacion.create({
    data: { estudianteId: ana.id, ofertaId: o3.id, estado: 'RECHAZADA', fechaPostulacion: dias(-2) },
  });
  post.reciente = await prisma.postulacion.create({
    data: { estudianteId: ana.id, ofertaId: o1.id, fechaPostulacion: dias(-1) },
  });
  await prisma.postulacion.create({ data: { estudianteId: luis.id, ofertaId: o1.id } });

  tokenAna = await iniciarSesion('ana@inacapmail.cl', 'Clave1234');
  tokenLuis = await iniciarSesion('luis@inacapmail.cl', 'Clave1234');
  tokenSinPostulaciones = await iniciarSesion('carla@inacapmail.cl', 'Clave1234');
  tokenEmpresa = await iniciarSesion('contacto@andes.cl', 'Empresa1234');
});

afterAll(async () => {
  await limpiarBase();
  await prisma.$disconnect();
});

describe('GET /api/postulaciones/mias', () => {
  test('exige iniciar sesión', async () => {
    const respuesta = await request(app).get('/api/postulaciones/mias');

    expect(respuesta.statusCode).toBe(401);
  });

  test('rechaza a una empresa', async () => {
    const respuesta = await misPostulaciones(tokenEmpresa);

    expect(respuesta.statusCode).toBe(403);
  });

  test('el estudiante ve todas sus postulaciones', async () => {
    const respuesta = await misPostulaciones(tokenAna);

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.postulaciones).toHaveLength(3);
  });

  test('solo ve las suyas, no las de otros estudiantes', async () => {
    const respuesta = await misPostulaciones(tokenLuis);

    expect(respuesta.body.postulaciones).toHaveLength(1);
    expect(respuesta.body.postulaciones[0].oferta.titulo).toBe('Práctica vigente');
  });

  test('un estudiante sin postulaciones recibe una lista vacía', async () => {
    const respuesta = await misPostulaciones(tokenSinPostulaciones);

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.postulaciones).toHaveLength(0);
  });

  test('muestra la oferta, la empresa y el estado de cada postulación', async () => {
    const respuesta = await misPostulaciones(tokenAna);
    const porTitulo = Object.fromEntries(respuesta.body.postulaciones.map((p) => [p.oferta.titulo, p]));

    expect(porTitulo['Práctica vigente'].estado).toBe('ENVIADA');
    expect(porTitulo['Oferta cerrada'].estado).toBe('ACEPTADA');
    expect(porTitulo['Oferta eliminada'].estado).toBe('RECHAZADA');
    expect(porTitulo['Práctica vigente'].oferta.empresa.razonSocial).toBe('Andes SpA');
    expect(porTitulo['Práctica vigente'].tipo).toBe('POSTULACION');
  });

  test('incluye ofertas cerradas o eliminadas e indica su estado', async () => {
    const respuesta = await misPostulaciones(tokenAna);
    const estados = respuesta.body.postulaciones.map((p) => p.oferta.estado);

    expect(estados).toContain('CERRADA');
    expect(estados).toContain('ELIMINADA');
  });

  test('ordena de la más reciente a la más antigua', async () => {
    const respuesta = await misPostulaciones(tokenAna);
    const ids = respuesta.body.postulaciones.map((p) => p.id);

    expect(ids[0]).toBe(post.reciente.id);
    expect(ids[1]).toBe(post.media.id);
    expect(ids[2]).toBe(post.antigua.id);
  });

  test('no expone datos sensibles de la empresa', async () => {
    const respuesta = await misPostulaciones(tokenAna);
    const { empresa } = respuesta.body.postulaciones[0].oferta;

    expect(empresa.razonSocial).toBe('Andes SpA');
    expect(empresa.rut).toBeUndefined();
    expect(empresa.correo).toBeUndefined();
  });

  test('filtra por estado', async () => {
    const respuesta = await misPostulaciones(tokenAna, '?estado=ACEPTADA');

    expect(respuesta.body.postulaciones).toHaveLength(1);
    expect(respuesta.body.postulaciones[0].oferta.titulo).toBe('Oferta cerrada');
  });

  test('rechaza un estado de filtro inválido', async () => {
    const respuesta = await misPostulaciones(tokenAna, '?estado=XYZ');

    expect(respuesta.statusCode).toBe(400);
  });

  test('refleja el cambio de estado que hace la empresa (HU-07)', async () => {
    const cambio = await request(app)
      .patch(`/api/postulaciones/${post.reciente.id}/estado`)
      .set(conToken(tokenEmpresa))
      .send({ estado: 'PRESELECCIONADA' });
    expect(cambio.statusCode).toBe(200);

    const respuesta = await misPostulaciones(tokenAna);
    const actualizada = respuesta.body.postulaciones.find((p) => p.id === post.reciente.id);

    expect(actualizada.estado).toBe('PRESELECCIONADA');
  });
});