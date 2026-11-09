const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/db/prisma');

const datosValidos = {
  nombres: 'Ana',
  apellidos: 'Pérez',
  carrera: 'Ingeniería en Informática',
  correo: 'ana.perez@inacapmail.cl',
  contrasena: 'Clave1234',
};

const limpiarBase = async () => {
  await prisma.usuario.deleteMany();
  await prisma.institucionEducativa.deleteMany();
};

beforeAll(async () => {
  await limpiarBase();
  await prisma.institucionEducativa.create({
    data: { nombre: 'INACAP', dominioCorreo: 'inacapmail.cl' },
  });
});

afterAll(async () => {
  await limpiarBase();
  await prisma.$disconnect();
});

describe('POST /api/auth/registro', () => {
  test('registra a un estudiante con datos válidos', async () => {
    const respuesta = await request(app).post('/api/auth/registro').send(datosValidos);

    expect(respuesta.statusCode).toBe(201);
    expect(respuesta.body.usuario.correo).toBe('ana.perez@inacapmail.cl');
    expect(respuesta.body.usuario.rol).toBe('ESTUDIANTE');
    expect(respuesta.body.usuario.contrasenaHash).toBeUndefined();
  });

  test('guarda la contraseña cifrada, no en texto claro', async () => {
    const usuario = await prisma.usuario.findUnique({
      where: { correo: 'ana.perez@inacapmail.cl' },
    });

    expect(usuario.contrasenaHash).not.toBe('Clave1234');
    expect(usuario.contrasenaHash.startsWith('$2')).toBe(true);
  });

  test('rechaza un correo ya registrado', async () => {
    const respuesta = await request(app).post('/api/auth/registro').send(datosValidos);

    expect(respuesta.statusCode).toBe(409);
  });

  test('rechaza un correo de una institución no registrada', async () => {
    const respuesta = await request(app)
      .post('/api/auth/registro')
      .send({ ...datosValidos, correo: 'luis.soto@gmail.com' });

    expect(respuesta.statusCode).toBe(400);
  });

  test('rechaza datos inválidos', async () => {
    const respuesta = await request(app)
      .post('/api/auth/registro')
      .send({ ...datosValidos, correo: 'hola', contrasena: '123' });

    expect(respuesta.statusCode).toBe(400);
    expect(respuesta.body.errores.length).toBeGreaterThan(0);
  });
});