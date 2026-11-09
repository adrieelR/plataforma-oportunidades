const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const prisma = require('../../src/db/prisma');

const limpiarBase = async () => {
  await prisma.usuario.deleteMany();
  await prisma.institucionEducativa.deleteMany();
};

const baseEmpresa = { rubro: 'Tecnología', contrasena: 'Empresa1234' };

let tokenAdmin;
let tokenEmpresa;
let idEmpresa1;
let idEmpresa2;

const conToken = (token) => ({ Authorization: `Bearer ${token}` });

beforeAll(async () => {
  await limpiarBase();

  await prisma.usuario.create({
    data: {
      correo: 'admin@plataforma.cl',
      contrasenaHash: await bcrypt.hash('Admin1234', 4),
      rol: 'ADMINISTRADOR',
      estadoCuenta: 'ACTIVA',
      administrador: { create: { nombre: 'Administrador' } },
    },
  });

  await request(app)
    .post('/api/auth/registro-empresa')
    .send({ ...baseEmpresa, razonSocial: 'Andes SpA', rut: '12.345.678-5', correo: 'contacto@andes.cl' });
  await request(app)
    .post('/api/auth/registro-empresa')
    .send({ ...baseEmpresa, razonSocial: 'Boreal Ltda', rut: '11.111.111-1', correo: 'contacto@boreal.cl' });

  const loginAdmin = await request(app)
    .post('/api/auth/login')
    .send({ correo: 'admin@plataforma.cl', contrasena: 'Admin1234' });
  tokenAdmin = loginAdmin.body.token;

  const loginEmpresa = await request(app)
    .post('/api/auth/login')
    .send({ correo: 'contacto@andes.cl', contrasena: 'Empresa1234' });
  tokenEmpresa = loginEmpresa.body.token;
});

afterAll(async () => {
  await limpiarBase();
  await prisma.$disconnect();
});

describe('Rutas de administración', () => {
  test('exigen iniciar sesión', async () => {
    const respuesta = await request(app).get('/api/admin/empresas');

    expect(respuesta.statusCode).toBe(401);
  });

  test('rechazan a un usuario que no es administrador', async () => {
    const respuesta = await request(app).get('/api/admin/empresas').set(conToken(tokenEmpresa));

    expect(respuesta.statusCode).toBe(403);
  });

  test('el administrador lista las empresas pendientes', async () => {
    const respuesta = await request(app).get('/api/admin/empresas').set(conToken(tokenAdmin));

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.empresas).toHaveLength(2);
    expect(respuesta.body.empresas[0].correo).toBeDefined();
    expect(respuesta.body.empresas[0].contrasenaHash).toBeUndefined();

    idEmpresa1 = respuesta.body.empresas[0].id;
    idEmpresa2 = respuesta.body.empresas[1].id;
  });

  test('el administrador aprueba una empresa', async () => {
    const respuesta = await request(app)
      .patch(`/api/admin/empresas/${idEmpresa1}/aprobacion`)
      .set(conToken(tokenAdmin))
      .send({ decision: 'APROBAR' });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.empresa.estadoAprobacion).toBe('APROBADA');

    const empresa = await prisma.empresa.findUnique({ where: { id: idEmpresa1 } });
    expect(empresa.fechaAprobacion).not.toBeNull();
  });

  test('el administrador rechaza una empresa', async () => {
    const respuesta = await request(app)
      .patch(`/api/admin/empresas/${idEmpresa2}/aprobacion`)
      .set(conToken(tokenAdmin))
      .send({ decision: 'RECHAZAR' });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.empresa.estadoAprobacion).toBe('RECHAZADA');
  });

  test('no permite resolver dos veces la misma solicitud', async () => {
    const respuesta = await request(app)
      .patch(`/api/admin/empresas/${idEmpresa1}/aprobacion`)
      .set(conToken(tokenAdmin))
      .send({ decision: 'RECHAZAR' });

    expect(respuesta.statusCode).toBe(409);
  });

  test('rechaza una decisión inválida', async () => {
    const respuesta = await request(app)
      .patch(`/api/admin/empresas/${idEmpresa1}/aprobacion`)
      .set(conToken(tokenAdmin))
      .send({ decision: 'TAL VEZ' });

    expect(respuesta.statusCode).toBe(400);
  });

  test('responde 404 si la empresa no existe', async () => {
    const respuesta = await request(app)
      .patch('/api/admin/empresas/999999/aprobacion')
      .set(conToken(tokenAdmin))
      .send({ decision: 'APROBAR' });

    expect(respuesta.statusCode).toBe(404);
  });

  test('ya no quedan empresas pendientes', async () => {
    const respuesta = await request(app).get('/api/admin/empresas').set(conToken(tokenAdmin));

    expect(respuesta.body.empresas).toHaveLength(0);
  });
});