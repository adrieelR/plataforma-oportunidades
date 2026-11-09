const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/db/prisma');

const datosEstudiante = {
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

let token;

beforeAll(async () => {
  await limpiarBase();
  await prisma.institucionEducativa.create({
    data: { nombre: 'INACAP', dominioCorreo: 'inacapmail.cl' },
  });
  await request(app).post('/api/auth/registro').send(datosEstudiante);
});

afterAll(async () => {
  await limpiarBase();
  await prisma.$disconnect();
});

describe('POST /api/auth/login', () => {
  test('inicia sesión con credenciales correctas y entrega un token', async () => {
    const respuesta = await request(app)
      .post('/api/auth/login')
      .send({ correo: datosEstudiante.correo, contrasena: datosEstudiante.contrasena });

    expect(respuesta.statusCode).toBe(200);
    expect(typeof respuesta.body.token).toBe('string');
    expect(respuesta.body.usuario.rol).toBe('ESTUDIANTE');
    expect(respuesta.body.usuario.contrasenaHash).toBeUndefined();

    token = respuesta.body.token;
  });

  test('rechaza una contraseña incorrecta', async () => {
    const respuesta = await request(app)
      .post('/api/auth/login')
      .send({ correo: datosEstudiante.correo, contrasena: 'otra1234' });

    expect(respuesta.statusCode).toBe(401);
  });

  test('responde igual si el correo no existe, para no revelar qué correos están registrados', async () => {
    const claveIncorrecta = await request(app)
      .post('/api/auth/login')
      .send({ correo: datosEstudiante.correo, contrasena: 'otra1234' });

    const correoInexistente = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'nadie@inacapmail.cl', contrasena: 'Clave1234' });

    expect(correoInexistente.statusCode).toBe(401);
    expect(correoInexistente.body).toEqual(claveIncorrecta.body);
  });

  test('rechaza datos inválidos', async () => {
    const respuesta = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'hola' });

    expect(respuesta.statusCode).toBe(400);
  });
});

describe('GET /api/auth/perfil', () => {
  test('exige iniciar sesión', async () => {
    const respuesta = await request(app).get('/api/auth/perfil');

    expect(respuesta.statusCode).toBe(401);
  });

  test('entrega el perfil con un token válido', async () => {
    const respuesta = await request(app)
      .get('/api/auth/perfil')
      .set('Authorization', `Bearer ${token}`);

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.usuario.correo).toBe(datosEstudiante.correo);
    expect(respuesta.body.perfil.carrera).toBe('Ingeniería en Informática');
  });

  test('rechaza un token con la firma alterada', async () => {
    const [cabecera, contenido] = token.split('.');
    const alterado = `${cabecera}.${contenido}.firmafalsa`;

    const respuesta = await request(app)
      .get('/api/auth/perfil')
      .set('Authorization', `Bearer ${alterado}`);

    expect(respuesta.statusCode).toBe(401);
  });
});