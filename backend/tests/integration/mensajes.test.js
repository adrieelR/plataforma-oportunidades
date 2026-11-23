const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const prisma = require('../../src/db/prisma');

const limpiarBase = async () => {
  await prisma.mensaje.deleteMany();
  await prisma.documento.deleteMany();
  await prisma.postulacion.deleteMany();
  await prisma.oferta.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.institucionEducativa.deleteMany();
};

const conToken = (token) => ({ Authorization: `Bearer ${token}` });

let tokenEmpresa;
let tokenEstudiante1;
let tokenEstudiante2;

let usuarioEmpresaId;
let usuarioEstudiante1Id;
let usuarioEstudiante2Id;

let ofertaId;
let mensajeId;

beforeAll(async () => {
  await limpiarBase();

  // 1. Crear institución educativa
  const institucion = await prisma.institucionEducativa.create({
    data: {
      nombre: 'INACAP',
      dominioCorreo: 'inacapmail.cl',
    },
  });

  // 2. Crear usuario Empresa (APROBADA y ACTIVA)
  const usuarioEmpresa = await prisma.usuario.create({
    data: {
      correo: 'rrhh@andes.cl',
      contrasenaHash: await bcrypt.hash('Empresa1234', 4),
      rol: 'EMPRESA',
      estadoCuenta: 'ACTIVA',
      empresa: {
        create: {
          razonSocial: 'Andes SpA',
          rut: '12.345.678-5',
          rubro: 'Tecnología',
          estadoAprobacion: 'APROBADA',
          fechaAprobacion: new Date(),
        },
      },
    },
    include: { empresa: true },
  });
  usuarioEmpresaId = usuarioEmpresa.id;

  // 3. Crear Estudiante 1 (postulado a la oferta)
  const usuarioEst1 = await prisma.usuario.create({
    data: {
      correo: 'ana@inacapmail.cl',
      contrasenaHash: await bcrypt.hash('Estudiante1234', 4),
      rol: 'ESTUDIANTE',
      estadoCuenta: 'ACTIVA',
      estudiante: {
        create: {
          nombres: 'Ana',
          apellidos: 'Pérez',
          carrera: 'Ingeniería en Informática',
          verificado: true,
          institucionId: institucion.id,
        },
      },
    },
    include: { estudiante: true },
  });
  usuarioEstudiante1Id = usuarioEst1.id;

  // 4. Crear Estudiante 2 (NO postulado a la oferta)
  const usuarioEst2 = await prisma.usuario.create({
    data: {
      correo: 'luis@inacapmail.cl',
      contrasenaHash: await bcrypt.hash('Estudiante1234', 4),
      rol: 'ESTUDIANTE',
      estadoCuenta: 'ACTIVA',
      estudiante: {
        create: {
          nombres: 'Luis',
          apellidos: 'Soto',
          carrera: 'Analista Programador',
          verificado: true,
          institucionId: institucion.id,
        },
      },
    },
    include: { estudiante: true },
  });
  usuarioEstudiante2Id = usuarioEst2.id;

  // 5. Crear oferta publicada y postulación del Estudiante 1
  const oferta = await prisma.oferta.create({
    data: {
      empresaId: usuarioEmpresa.empresa.id,
      titulo: 'Práctica Desarrollador Backend Node.js',
      descripcion: 'Apoyo en desarrollo de APIs REST con Express y PostgreSQL.',
      tipo: 'PRACTICA',
      modalidad: 'HIBRIDA',
      area: 'Tecnología',
      ubicacion: 'Santiago',
      estado: 'PUBLICADA',
      fechaPublicacion: new Date(),
      fechaLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  ofertaId = oferta.id;

  await prisma.postulacion.create({
    data: {
      estudianteId: usuarioEst1.estudiante.id,
      ofertaId: oferta.id,
      estado: 'ENVIADA',
    },
  });

  // 6. Obtener tokens JWT de los 3 usuarios
  const loginEmpresa = await request(app)
    .post('/api/auth/login')
    .send({ correo: 'rrhh@andes.cl', contrasena: 'Empresa1234' });
  tokenEmpresa = loginEmpresa.body.token;

  const loginEst1 = await request(app)
    .post('/api/auth/login')
    .send({ correo: 'ana@inacapmail.cl', contrasena: 'Estudiante1234' });
  tokenEstudiante1 = loginEst1.body.token;

  const loginEst2 = await request(app)
    .post('/api/auth/login')
    .send({ correo: 'luis@inacapmail.cl', contrasena: 'Estudiante1234' });
  tokenEstudiante2 = loginEst2.body.token;
});

afterAll(async () => {
  await limpiarBase();
  await prisma.$disconnect();
});

describe('Módulo de Mensajería (HU-08 / CU-08)', () => {
  test('exige iniciar sesión para enviar o listar mensajes', async () => {
    const resPost = await request(app).post('/api/mensajes').send({
      ofertaId,
      destinatarioId: usuarioEmpresaId,
      contenido: 'Hola',
    });
    const resGet = await request(app).get('/api/mensajes');

    expect(resPost.statusCode).toBe(401);
    expect(resGet.statusCode).toBe(401);
  });

  test('rechaza un mensaje vacío o sin ofertaId', async () => {
    const respuesta = await request(app)
      .post('/api/mensajes')
      .set(conToken(tokenEstudiante1))
      .send({
        destinatarioId: usuarioEmpresaId,
        contenido: '   ',
      });

    expect(respuesta.statusCode).toBe(400);
  });

  test('no permite que un estudiante no postulado envíe mensajes en la oferta', async () => {
    const respuesta = await request(app)
      .post('/api/mensajes')
      .set(conToken(tokenEstudiante2))
      .send({
        ofertaId,
        destinatarioId: usuarioEmpresaId,
        contenido: 'Hola, no he postulado pero quiero consultar.',
      });

    expect(respuesta.statusCode).toBe(403);
  });

  test('el estudiante postulado envía un mensaje a la empresa de la oferta', async () => {
    const respuesta = await request(app)
      .post('/api/mensajes')
      .set(conToken(tokenEstudiante1))
      .send({
        ofertaId,
        destinatarioId: usuarioEmpresaId,
        contenido: 'Hola, ya adjunté mi CV. ¿Cuándo comienzan las entrevistas?',
      });

    expect(respuesta.statusCode).toBe(201);
    expect(respuesta.body.mensaje).toBeDefined();
    expect(respuesta.body.mensaje.contenido).toContain('entrevistas');
    expect(respuesta.body.mensaje.leido).toBe(false);

    mensajeId = respuesta.body.mensaje.id;
  });

  test('la empresa responde al estudiante postulado', async () => {
    const respuesta = await request(app)
      .post('/api/mensajes')
      .set(conToken(tokenEmpresa))
      .send({
        ofertaId,
        destinatarioId: usuarioEstudiante1Id,
        contenido: 'Hola Ana, revisaremos tu perfil esta semana.',
      });

    expect(respuesta.statusCode).toBe(201);
    expect(respuesta.body.mensaje.remitenteId).toBe(usuarioEmpresaId);
    expect(respuesta.body.mensaje.destinatarioId).toBe(usuarioEstudiante1Id);
  });

  test('la empresa no puede enviar mensaje en esa oferta a un estudiante no postulado', async () => {
    const respuesta = await request(app)
      .post('/api/mensajes')
      .set(conToken(tokenEmpresa))
      .send({
        ofertaId,
        destinatarioId: usuarioEstudiante2Id,
        contenido: 'Hola Luis',
      });

    expect(respuesta.statusCode).toBe(400);
  });

  test('lista la conversación filtrada por ofertaId en orden cronológico', async () => {
    const respuesta = await request(app)
      .get(`/api/mensajes?ofertaId=${ofertaId}`)
      .set(conToken(tokenEstudiante1));

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.mensajes).toHaveLength(2);
    expect(respuesta.body.mensajes[0].remitenteId).toBe(usuarioEstudiante1Id);
    expect(respuesta.body.mensajes[1].remitenteId).toBe(usuarioEmpresaId);
  });

  test('solo el destinatario puede marcar el mensaje como leído', async () => {
    // El remitente (estudiante 1) intenta marcar su propio mensaje como leído -> 403
    const fallo = await request(app)
      .patch(`/api/mensajes/${mensajeId}/leer`)
      .set(conToken(tokenEstudiante1));

    expect(fallo.statusCode).toBe(403);

    // El destinatario (empresa) marca el mensaje como leído -> 200
    const exito = await request(app)
      .patch(`/api/mensajes/${mensajeId}/leer`)
      .set(conToken(tokenEmpresa));

    expect(exito.statusCode).toBe(200);
    expect(exito.body.mensaje.leido).toBe(true);
  });
});