const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const prisma = require('../../src/db/prisma');

// Oferta -> Empresa no tiene borrado en cascada, así que las ofertas se borran primero
const limpiarBase = async () => {
  await prisma.oferta.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.institucionEducativa.deleteMany();
};

const conToken = (token) => ({ Authorization: `Bearer ${token}` });
const enUnMes = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

const datosOferta = {
  titulo: 'Práctica de desarrollo web',
  descripcion: 'Apoyo al equipo de desarrollo en proyectos web con Node.js.',
  tipo: 'PRACTICA',
  modalidad: 'HIBRIDA',
  area: 'Tecnología',
  ubicacion: 'Santiago',
  cupos: 2,
  fechaLimite: enUnMes(),
};

let tokenAprobada;
let tokenOtraAprobada;
let tokenPendiente;
let tokenEstudiante;
let tokenAdmin;
let idOferta;

const registrarEmpresa = (razonSocial, rut, correo) =>
  request(app)
    .post('/api/auth/registro-empresa')
    .send({ razonSocial, rut, rubro: 'Tecnología', correo, contrasena: 'Empresa1234' });

const iniciarSesion = async (correo, contrasena) => {
  const respuesta = await request(app).post('/api/auth/login').send({ correo, contrasena });
  return respuesta.body.token;
};

beforeAll(async () => {
  await limpiarBase();

  await prisma.institucionEducativa.create({ data: { nombre: 'INACAP', dominioCorreo: 'inacapmail.cl' } });

  await prisma.usuario.create({
    data: {
      correo: 'admin@plataforma.cl',
      contrasenaHash: await bcrypt.hash('Admin1234', 4),
      rol: 'ADMINISTRADOR',
      estadoCuenta: 'ACTIVA',
      administrador: { create: { nombre: 'Administrador' } },
    },
  });

  await registrarEmpresa('Andes SpA', '12.345.678-5', 'contacto@andes.cl');
  await registrarEmpresa('Boreal Ltda', '11.111.111-1', 'contacto@boreal.cl');
  await registrarEmpresa('Cumbre SA', '22.222.222-2', 'contacto@cumbre.cl');

  // Se aprueban dos empresas directamente en la base; la tercera queda PENDIENTE
  await prisma.empresa.updateMany({
    where: { rut: { in: ['12345678-5', '11111111-1'] } },
    data: { estadoAprobacion: 'APROBADA', fechaAprobacion: new Date() },
  });

  await request(app).post('/api/auth/registro').send({
    nombres: 'Ana',
    apellidos: 'Pérez',
    carrera: 'Ingeniería en Informática',
    correo: 'ana@inacapmail.cl',
    contrasena: 'Clave1234',
  });

  tokenAprobada = await iniciarSesion('contacto@andes.cl', 'Empresa1234');
  tokenOtraAprobada = await iniciarSesion('contacto@boreal.cl', 'Empresa1234');
  tokenPendiente = await iniciarSesion('contacto@cumbre.cl', 'Empresa1234');
  tokenEstudiante = await iniciarSesion('ana@inacapmail.cl', 'Clave1234');
  tokenAdmin = await iniciarSesion('admin@plataforma.cl', 'Admin1234');
});

afterAll(async () => {
  await limpiarBase();
  await prisma.$disconnect();
});

describe('POST /api/ofertas', () => {
  test('exige iniciar sesión', async () => {
    const respuesta = await request(app).post('/api/ofertas').send(datosOferta);

    expect(respuesta.statusCode).toBe(401);
  });

  test('rechaza a un estudiante', async () => {
    const respuesta = await request(app).post('/api/ofertas').set(conToken(tokenEstudiante)).send(datosOferta);

    expect(respuesta.statusCode).toBe(403);
  });

  test('rechaza a un administrador', async () => {
    const respuesta = await request(app).post('/api/ofertas').set(conToken(tokenAdmin)).send(datosOferta);

    expect(respuesta.statusCode).toBe(403);
  });

  test('rechaza a una empresa pendiente de aprobación', async () => {
    const respuesta = await request(app).post('/api/ofertas').set(conToken(tokenPendiente)).send(datosOferta);

    expect(respuesta.statusCode).toBe(403);
  });

  test('rechaza datos inválidos', async () => {
    const respuesta = await request(app)
      .post('/api/ofertas')
      .set(conToken(tokenAprobada))
      .send({ ...datosOferta, tipo: 'PASANTIA', titulo: '' });

    expect(respuesta.statusCode).toBe(400);
    expect(respuesta.body.errores.length).toBeGreaterThan(0);
  });

  test('rechaza una fecha límite pasada', async () => {
    const respuesta = await request(app)
      .post('/api/ofertas')
      .set(conToken(tokenAprobada))
      .send({ ...datosOferta, fechaLimite: '2020-01-01' });

    expect(respuesta.statusCode).toBe(400);
  });

  test('una empresa aprobada publica una oferta', async () => {
    const respuesta = await request(app).post('/api/ofertas').set(conToken(tokenAprobada)).send(datosOferta);

    expect(respuesta.statusCode).toBe(201);
    expect(respuesta.body.oferta.estado).toBe('PUBLICADA');
    expect(respuesta.body.oferta.fechaPublicacion).not.toBeNull();

    idOferta = respuesta.body.oferta.id;
  });

  test('ignora el estado enviado por el cliente', async () => {
    const respuesta = await request(app)
      .post('/api/ofertas')
      .set(conToken(tokenAprobada))
      .send({ ...datosOferta, titulo: 'Oferta con estado forzado', estado: 'OCULTA' });

    expect(respuesta.statusCode).toBe(201);
    expect(respuesta.body.oferta.estado).toBe('PUBLICADA');
  });
});

describe('GET /api/ofertas/mias', () => {
  test('la empresa ve solo sus ofertas', async () => {
    const respuesta = await request(app).get('/api/ofertas/mias').set(conToken(tokenAprobada));

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.ofertas).toHaveLength(2);
    expect(respuesta.body.ofertas[0]._count.postulaciones).toBe(0);
  });

  test('otra empresa no ve ofertas ajenas', async () => {
    const respuesta = await request(app).get('/api/ofertas/mias').set(conToken(tokenOtraAprobada));

    expect(respuesta.body.ofertas).toHaveLength(0);
  });

  test('rechaza un estado de filtro inválido', async () => {
    const respuesta = await request(app).get('/api/ofertas/mias?estado=XYZ').set(conToken(tokenAprobada));

    expect(respuesta.statusCode).toBe(400);
  });
});

describe('PATCH /api/ofertas/:id', () => {
  test('la empresa dueña edita su oferta', async () => {
    const respuesta = await request(app)
      .patch(`/api/ofertas/${idOferta}`)
      .set(conToken(tokenAprobada))
      .send({ titulo: 'Práctica de desarrollo backend' });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.oferta.titulo).toBe('Práctica de desarrollo backend');
  });

  test('rechaza un cuerpo vacío', async () => {
    const respuesta = await request(app).patch(`/api/ofertas/${idOferta}`).set(conToken(tokenAprobada)).send({});

    expect(respuesta.statusCode).toBe(400);
  });

  test('rechaza editar una oferta de otra empresa', async () => {
    const respuesta = await request(app)
      .patch(`/api/ofertas/${idOferta}`)
      .set(conToken(tokenOtraAprobada))
      .send({ titulo: 'Intento de edición ajena' });

    expect(respuesta.statusCode).toBe(403);
  });

  test('responde 404 si la oferta no existe', async () => {
    const respuesta = await request(app)
      .patch('/api/ofertas/999999')
      .set(conToken(tokenAprobada))
      .send({ titulo: 'Oferta inexistente' });

    expect(respuesta.statusCode).toBe(404);
  });

  test('responde 400 si el identificador no es válido', async () => {
    const respuesta = await request(app)
      .patch('/api/ofertas/abc')
      .set(conToken(tokenAprobada))
      .send({ titulo: 'Identificador inválido' });

    expect(respuesta.statusCode).toBe(400);
  });
});

describe('PATCH /api/ofertas/:id/estado', () => {
  test('la empresa cierra su oferta', async () => {
    const respuesta = await request(app)
      .patch(`/api/ofertas/${idOferta}/estado`)
      .set(conToken(tokenAprobada))
      .send({ estado: 'CERRADA' });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.oferta.estado).toBe('CERRADA');
  });

  test('no permite editar una oferta cerrada', async () => {
    const respuesta = await request(app)
      .patch(`/api/ofertas/${idOferta}`)
      .set(conToken(tokenAprobada))
      .send({ titulo: 'Edición sobre oferta cerrada' });

    expect(respuesta.statusCode).toBe(409);
  });

  test('no permite cerrar dos veces', async () => {
    const respuesta = await request(app)
      .patch(`/api/ofertas/${idOferta}/estado`)
      .set(conToken(tokenAprobada))
      .send({ estado: 'CERRADA' });

    expect(respuesta.statusCode).toBe(409);
  });

  test('la empresa reactiva su oferta', async () => {
    const respuesta = await request(app)
      .patch(`/api/ofertas/${idOferta}/estado`)
      .set(conToken(tokenAprobada))
      .send({ estado: 'PUBLICADA' });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.oferta.estado).toBe('PUBLICADA');
  });

  test('no permite reactivar una oferta con la fecha límite vencida', async () => {
    await prisma.oferta.update({
      where: { id: idOferta },
      data: { estado: 'CERRADA', fechaLimite: new Date(Date.now() - 1000) },
    });

    const respuesta = await request(app)
      .patch(`/api/ofertas/${idOferta}/estado`)
      .set(conToken(tokenAprobada))
      .send({ estado: 'PUBLICADA' });

    expect(respuesta.statusCode).toBe(409);
  });

  test('rechaza un estado que la empresa no puede asignar', async () => {
    const respuesta = await request(app)
      .patch(`/api/ofertas/${idOferta}/estado`)
      .set(conToken(tokenAprobada))
      .send({ estado: 'OCULTA' });

    expect(respuesta.statusCode).toBe(400);
  });

  test('rechaza cambiar el estado de una oferta ajena', async () => {
    const respuesta = await request(app)
      .patch(`/api/ofertas/${idOferta}/estado`)
      .set(conToken(tokenOtraAprobada))
      .send({ estado: 'PUBLICADA' });

    expect(respuesta.statusCode).toBe(403);
  });
});

describe('DELETE /api/ofertas/:id', () => {
  test('rechaza eliminar una oferta ajena', async () => {
    const respuesta = await request(app).delete(`/api/ofertas/${idOferta}`).set(conToken(tokenOtraAprobada));

    expect(respuesta.statusCode).toBe(403);
  });

  test('la empresa elimina su oferta (borrado lógico)', async () => {
    const respuesta = await request(app).delete(`/api/ofertas/${idOferta}`).set(conToken(tokenAprobada));

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.oferta.estado).toBe('ELIMINADA');

    const enBase = await prisma.oferta.findUnique({ where: { id: idOferta } });
    expect(enBase).not.toBeNull();
  });

  test('la oferta eliminada ya no aparece ni se puede editar', async () => {
    const lista = await request(app).get('/api/ofertas/mias').set(conToken(tokenAprobada));
    expect(lista.body.ofertas).toHaveLength(1);

    const edicion = await request(app)
      .patch(`/api/ofertas/${idOferta}`)
      .set(conToken(tokenAprobada))
      .send({ titulo: 'Edición sobre oferta eliminada' });
    expect(edicion.statusCode).toBe(404);
  });
});