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

let tokenEmpresaA;
let tokenEmpresaB;
let tokenPendiente;
let tokenEstudiante;
let ofertas = {};
let post = {};

const iniciarSesion = async (correo, contrasena) => {
  const respuesta = await request(app).post('/api/auth/login').send({ correo, contrasena });
  return respuesta.body.token;
};

const crearEmpresa = async (correo, rut, estadoAprobacion) => {
  const usuario = await prisma.usuario.create({
    data: {
      correo,
      contrasenaHash: await bcrypt.hash('Empresa1234', 4),
      rol: 'EMPRESA',
      estadoCuenta: 'ACTIVA',
      empresa: { create: { razonSocial: `Empresa ${rut}`, rut, rubro: 'Tecnología', estadoAprobacion } },
    },
    include: { empresa: true },
  });
  return usuario.empresa.id;
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
      descripcion: 'Descripción de la oferta de prueba para gestionar postulaciones.',
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

const crearPostulacion = (estudianteId, ofertaId, estado) =>
  prisma.postulacion.create({ data: { estudianteId, ofertaId, ...(estado && { estado }) } });

const cambiarEstado = (token, id, estado) =>
  request(app).patch(`/api/postulaciones/${id}/estado`).set(conToken(token)).send({ estado });

beforeAll(async () => {
  await limpiarBase();

  await prisma.institucionEducativa.create({ data: { nombre: 'INACAP', dominioCorreo: 'inacapmail.cl' } });

  const empresaA = await crearEmpresa('a@empresa.cl', '12345678-5', 'APROBADA');
  const empresaB = await crearEmpresa('b@empresa.cl', '11111111-1', 'APROBADA');
  await crearEmpresa('c@empresa.cl', '22222222-2', 'PENDIENTE');

  const ana = await registrarEstudiante('Ana', 'ana@inacapmail.cl');
  const luis = await registrarEstudiante('Luis', 'luis@inacapmail.cl');

  ofertas.o1 = await crearOferta(empresaA, { titulo: 'Oferta uno' });
  ofertas.o2 = await crearOferta(empresaA, { titulo: 'Oferta cerrada', estado: 'CERRADA' });
  ofertas.o4 = await crearOferta(empresaA, { titulo: 'Oferta cuatro' });
  ofertas.oB = await crearOferta(empresaB, { titulo: 'Oferta de otra empresa' });

  post.p1 = await crearPostulacion(ana.id, ofertas.o1.id);
  post.p2 = await crearPostulacion(luis.id, ofertas.o1.id);
  post.p3 = await crearPostulacion(ana.id, ofertas.o2.id);
  post.p4 = await crearPostulacion(luis.id, ofertas.o2.id, 'CANCELADA');
  post.p5 = await crearPostulacion(ana.id, ofertas.oB.id);
  post.p6 = await crearPostulacion(luis.id, ofertas.o4.id);

  tokenEmpresaA = await iniciarSesion('a@empresa.cl', 'Empresa1234');
  tokenEmpresaB = await iniciarSesion('b@empresa.cl', 'Empresa1234');
  tokenPendiente = await iniciarSesion('c@empresa.cl', 'Empresa1234');
  tokenEstudiante = await iniciarSesion('ana@inacapmail.cl', 'Clave1234');
});

afterAll(async () => {
  await limpiarBase();
  await prisma.$disconnect();
});

describe('GET /api/ofertas/:id/postulaciones', () => {
  const listar = (token, id, consulta = '') =>
    request(app).get(`/api/ofertas/${id}/postulaciones${consulta}`).set(conToken(token));

  test('exige iniciar sesión', async () => {
    const respuesta = await request(app).get(`/api/ofertas/${ofertas.o1.id}/postulaciones`);

    expect(respuesta.statusCode).toBe(401);
  });

  test('rechaza a un estudiante', async () => {
    const respuesta = await listar(tokenEstudiante, ofertas.o1.id);

    expect(respuesta.statusCode).toBe(403);
  });

  test('rechaza a otra empresa', async () => {
    const respuesta = await listar(tokenEmpresaB, ofertas.o1.id);

    expect(respuesta.statusCode).toBe(403);
  });

  test('responde 404 si la oferta no existe', async () => {
    const respuesta = await listar(tokenEmpresaA, 999999);

    expect(respuesta.statusCode).toBe(404);
  });

  test('la empresa dueña ve las postulaciones de su oferta', async () => {
    const respuesta = await listar(tokenEmpresaA, ofertas.o1.id);

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.postulaciones).toHaveLength(2);
    expect(respuesta.body.postulaciones[0].estudiante.nombres).toBeDefined();
    expect(respuesta.body.postulaciones[0].estudiante.institucion.nombre).toBe('INACAP');
  });

  test('no expone el correo del estudiante', async () => {
    const respuesta = await listar(tokenEmpresaA, ofertas.o1.id);
    const { estudiante } = respuesta.body.postulaciones[0];

    expect(estudiante.correo).toBeUndefined();
    expect(estudiante.contrasenaHash).toBeUndefined();
  });

  test('filtra por estado', async () => {
    expect((await listar(tokenEmpresaA, ofertas.o1.id, '?estado=ENVIADA')).body.postulaciones).toHaveLength(2);
    expect((await listar(tokenEmpresaA, ofertas.o1.id, '?estado=ACEPTADA')).body.postulaciones).toHaveLength(0);
  });

  test('rechaza un estado de filtro inválido', async () => {
    const respuesta = await listar(tokenEmpresaA, ofertas.o1.id, '?estado=XYZ');

    expect(respuesta.statusCode).toBe(400);
  });

  test('también lista las postulaciones de una oferta cerrada', async () => {
    const respuesta = await listar(tokenEmpresaA, ofertas.o2.id);

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.postulaciones).toHaveLength(2);
  });
});

describe('PATCH /api/postulaciones/:id/estado', () => {
  test('exige iniciar sesión', async () => {
    const respuesta = await request(app).patch(`/api/postulaciones/${post.p1.id}/estado`).send({ estado: 'ACEPTADA' });

    expect(respuesta.statusCode).toBe(401);
  });

  test('rechaza a un estudiante', async () => {
    const respuesta = await cambiarEstado(tokenEstudiante, post.p1.id, 'ACEPTADA');

    expect(respuesta.statusCode).toBe(403);
  });

  test('rechaza a una empresa pendiente de aprobación', async () => {
    const respuesta = await cambiarEstado(tokenPendiente, post.p1.id, 'ACEPTADA');

    expect(respuesta.statusCode).toBe(403);
  });

  test('rechaza estados que la empresa no puede asignar', async () => {
    expect((await cambiarEstado(tokenEmpresaA, post.p1.id, 'ENVIADA')).statusCode).toBe(400);
    expect((await cambiarEstado(tokenEmpresaA, post.p1.id, 'CANCELADA')).statusCode).toBe(400);
  });

  test('responde 400 si el identificador no es válido', async () => {
    const respuesta = await cambiarEstado(tokenEmpresaA, 'abc', 'ACEPTADA');

    expect(respuesta.statusCode).toBe(400);
  });

  test('responde 404 si la postulación no existe', async () => {
    const respuesta = await cambiarEstado(tokenEmpresaA, 999999, 'ACEPTADA');

    expect(respuesta.statusCode).toBe(404);
  });

  test('rechaza cambiar la postulación a la oferta de otra empresa', async () => {
    const respuesta = await cambiarEstado(tokenEmpresaA, post.p5.id, 'ACEPTADA');

    expect(respuesta.statusCode).toBe(403);

    const enBase = await prisma.postulacion.findUnique({ where: { id: post.p5.id } });
    expect(enBase.estado).toBe('ENVIADA');
  });

  test('la empresa preselecciona una postulación', async () => {
    const respuesta = await cambiarEstado(tokenEmpresaA, post.p1.id, 'PRESELECCIONADA');

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.postulacion.estado).toBe('PRESELECCIONADA');

    const enBase = await prisma.postulacion.findUnique({ where: { id: post.p1.id } });
    expect(enBase.estado).toBe('PRESELECCIONADA');
  });

  test('la empresa acepta una postulación preseleccionada', async () => {
    const respuesta = await cambiarEstado(tokenEmpresaA, post.p1.id, 'ACEPTADA');

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.postulacion.estado).toBe('ACEPTADA');
  });

  test('una postulación aceptada ya no se puede cambiar', async () => {
    const respuesta = await cambiarEstado(tokenEmpresaA, post.p1.id, 'RECHAZADA');

    expect(respuesta.statusCode).toBe(409);

    const enBase = await prisma.postulacion.findUnique({ where: { id: post.p1.id } });
    expect(enBase.estado).toBe('ACEPTADA');
  });

  test('la empresa rechaza una postulación enviada', async () => {
    const respuesta = await cambiarEstado(tokenEmpresaA, post.p2.id, 'RECHAZADA');

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.postulacion.estado).toBe('RECHAZADA');
  });

  test('la empresa puede resolver postulaciones de una oferta cerrada', async () => {
    const respuesta = await cambiarEstado(tokenEmpresaA, post.p3.id, 'ACEPTADA');

    expect(respuesta.statusCode).toBe(200);
  });

  test('no permite cambiar una postulación cancelada por el estudiante', async () => {
    const respuesta = await cambiarEstado(tokenEmpresaA, post.p4.id, 'ACEPTADA');

    expect(respuesta.statusCode).toBe(409);
  });

  test('no permite repetir el mismo estado', async () => {
    await cambiarEstado(tokenEmpresaA, post.p6.id, 'PRESELECCIONADA');
    const respuesta = await cambiarEstado(tokenEmpresaA, post.p6.id, 'PRESELECCIONADA');

    expect(respuesta.statusCode).toBe(409);
  });
});