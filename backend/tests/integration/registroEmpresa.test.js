const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/db/prisma');

const datosEmpresa = {
  razonSocial: 'Tecnologías Andes SpA',
  rut: '12.345.678-5',
  rubro: 'Tecnología',
  descripcion: 'Empresa de desarrollo de software',
  correo: 'contacto@andes.cl',
  contrasena: 'Empresa1234',
};

const limpiarBase = async () => {
  await prisma.usuario.deleteMany();
  await prisma.institucionEducativa.deleteMany();
};

beforeAll(limpiarBase);

afterAll(async () => {
  await limpiarBase();
  await prisma.$disconnect();
});

describe('POST /api/auth/registro-empresa', () => {
  test('registra una empresa con datos válidos', async () => {
    const respuesta = await request(app).post('/api/auth/registro-empresa').send(datosEmpresa);

    expect(respuesta.statusCode).toBe(201);
    expect(respuesta.body.usuario.rol).toBe('EMPRESA');
    expect(respuesta.body.usuario.contrasenaHash).toBeUndefined();
  });

  test('la empresa queda pendiente de aprobación y con el RUT normalizado', async () => {
    const empresa = await prisma.empresa.findFirst({ where: { razonSocial: datosEmpresa.razonSocial } });

    expect(empresa.estadoAprobacion).toBe('PENDIENTE');
    expect(empresa.rut).toBe('12345678-5');
  });

  test('rechaza un RUT con dígito verificador incorrecto', async () => {
    const respuesta = await request(app)
      .post('/api/auth/registro-empresa')
      .send({ ...datosEmpresa, rut: '12.345.678-9', correo: 'otra@andes.cl' });

    expect(respuesta.statusCode).toBe(400);
  });

  test('rechaza un RUT ya registrado', async () => {
    const respuesta = await request(app)
      .post('/api/auth/registro-empresa')
      .send({ ...datosEmpresa, correo: 'otra@andes.cl' });

    expect(respuesta.statusCode).toBe(409);
  });

  test('rechaza un correo ya registrado', async () => {
    const respuesta = await request(app)
      .post('/api/auth/registro-empresa')
      .send({ ...datosEmpresa, rut: '11.111.111-1' });

    expect(respuesta.statusCode).toBe(409);
  });
});