const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const prisma = require('../../src/db/prisma');

const limpiarBase = async () => {
  await prisma.moderacion.deleteMany();
  await prisma.reporte.deleteMany();
  await prisma.oferta.deleteMany();
  await prisma.empresa.deleteMany();
  await prisma.administrador.deleteMany();
  await prisma.usuario.deleteMany();
};

const conToken = (token) => ({ Authorization: `Bearer ${token}` });

let tokenEstudiante;
let tokenEmpresa;
let tokenAdmin;
let ofertaId;

beforeAll(async () => {
  await limpiarBase();

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
        },
      },
    },
    include: { empresa: true },
  });

  await prisma.usuario.create({
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
        },
      },
    },
  });

  await prisma.usuario.create({
    data: {
      correo: 'admin@plataforma.cl',
      contrasenaHash: await bcrypt.hash('Admin1234', 4),
      rol: 'ADMINISTRADOR',
      estadoCuenta: 'ACTIVA',
      administrador: { create: { nombre: 'Admin' } },
    },
  });

  const oferta = await prisma.oferta.create({
    data: {
      empresaId: usuarioEmpresa.empresa.id,
      titulo: 'Oferta sospechosa',
      descripcion: 'Descripción de prueba para reporte.',
      tipo: 'PRACTICA',
      modalidad: 'REMOTA',
      area: 'Tecnología',
      ubicacion: 'Santiago',
      estado: 'PUBLICADA',
      fechaPublicacion: new Date(),
      fechaLimite: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
  });
  ofertaId = oferta.id;

  tokenEstudiante = (
    await request(app).post('/api/auth/login').send({
      correo: 'ana@inacapmail.cl',
      contrasena: 'Estudiante1234',
    })
  ).body.token;

  tokenEmpresa = (
    await request(app).post('/api/auth/login').send({
      correo: 'rrhh@andes.cl',
      contrasena: 'Empresa1234',
    })
  ).body.token;

  tokenAdmin = (
    await request(app).post('/api/auth/login').send({
      correo: 'admin@plataforma.cl',
      contrasena: 'Admin1234',
    })
  ).body.token;
});

afterAll(async () => {
  await limpiarBase();
  await prisma.$disconnect();
});

describe('SCRUM-22 / RF-13 / CU-13: Reporte de publicaciones', () => {
  test('un estudiante puede reportar una publicación y queda PENDIENTE', async () => {
    const res = await request(app)
      .post('/api/reportes')
      .set(conToken(tokenEstudiante))
      .send({
        ofertaId,
        motivo: 'Información engañosa sobre el horario y remuneración',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.reporte.estado).toBe('PENDIENTE');
    expect(res.body.reporte.ofertaId).toBe(ofertaId);
  });

  test('evita duplicar un reporte PENDIENTE del mismo usuario en la misma oferta', async () => {
    const res = await request(app)
      .post('/api/reportes')
      .set(conToken(tokenEstudiante))
      .send({
        ofertaId,
        motivo: 'Segundo reporte duplicado',
      });

    expect(res.statusCode).toBe(409);
  });

  test('la empresa dueña no puede reportar su propia oferta', async () => {
    const res = await request(app)
      .post('/api/reportes')
      .set(conToken(tokenEmpresa))
      .send({
        ofertaId,
        motivo: 'Intento de autoreporte',
      });

    expect(res.statusCode).toBe(400);
  });

  test('el administrador ve el reporte en la lista de pendientes', async () => {
    const res = await request(app)
      .get('/api/reportes')
      .set(conToken(tokenAdmin));

    expect(res.statusCode).toBe(200);
    expect(res.body.reportes).toHaveLength(1);
    expect(res.body.reportes[0].estado).toBe('PENDIENTE');
    expect(res.body.reportes[0].ofertaId).toBe(ofertaId);
  });

  test('un usuario no administrador no puede listar los reportes', async () => {
    const res = await request(app)
      .get('/api/reportes')
      .set(conToken(tokenEstudiante));

    expect(res.statusCode).toBe(403);
  });
});