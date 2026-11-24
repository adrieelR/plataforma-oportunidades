const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const prisma = require('../../src/db/prisma');

// Moderacion -> Oferta y Moderacion -> Administrador no tienen borrado en cascada,
// así que las moderaciones se borran antes que las ofertas y los usuarios
const limpiarBase = async () => {
  await prisma.suspensionCuenta.deleteMany();
  await prisma.moderacion.deleteMany();
  await prisma.postulacion.deleteMany();
  await prisma.oferta.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.institucionEducativa.deleteMany();
};

const conToken = (token) => ({ Authorization: `Bearer ${token}` });
const dias = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);
const MOTIVO = 'Contenido engañoso para los estudiantes';

let tokenAdmin;
let tokenOtroAdmin;
let tokenEstudiante;
let tokenEmpresa;
let tokenEstudianteASuspender;
let tokenEmpresaASuspender;
let idAdmin;
let idEstudianteASuspender;
let idEmpresaASuspender;
let empresaId;

const crearUsuario = (datos) =>
  bcrypt.hash('Clave1234', 4).then((contrasenaHash) =>
    prisma.usuario.create({
      data: { contrasenaHash, estadoCuenta: 'ACTIVA', ...datos },
      include: { empresa: true },
    }),
  );

const iniciarSesion = async (correo) => {
  const respuesta = await request(app).post('/api/auth/login').send({ correo, contrasena: 'Clave1234' });
  return respuesta.body.token;
};

const crearOferta = (datos) =>
  prisma.oferta.create({
    data: {
      empresaId,
      titulo: 'Oferta de prueba',
      descripcion: 'Descripción de la oferta de prueba para moderación.',
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

const moderar = (token, id, cuerpo) =>
  request(app).patch(`/api/admin/ofertas/${id}/moderacion`).set(conToken(token)).send(cuerpo);

const suspender = (token, id, cuerpo) =>
  request(app).patch(`/api/admin/usuarios/${id}/suspension`).set(conToken(token)).send(cuerpo);

beforeAll(async () => {
  await limpiarBase();

  const admin = await crearUsuario({
    correo: 'admin@plataforma.cl',
    rol: 'ADMINISTRADOR',
    administrador: { create: { nombre: 'Administrador' } },
  });
  idAdmin = admin.id;
  await crearUsuario({
    correo: 'admin2@plataforma.cl',
    rol: 'ADMINISTRADOR',
    administrador: { create: { nombre: 'Segundo administrador' } },
  });

  const institucion = await prisma.institucionEducativa.create({
    data: { nombre: 'INACAP', dominioCorreo: 'inacapmail.cl' },
  });
  const datosEstudiante = (nombres) => ({
    create: { nombres, apellidos: 'Pérez', carrera: 'Informática', institucionId: institucion.id },
  });

  await crearUsuario({ correo: 'ana@inacapmail.cl', rol: 'ESTUDIANTE', estudiante: datosEstudiante('Ana') });
  const aSuspender = await crearUsuario({ correo: 'luis@inacapmail.cl', rol: 'ESTUDIANTE', estudiante: datosEstudiante('Luis') });
  idEstudianteASuspender = aSuspender.id;

  const empresa = await crearUsuario({
    correo: 'contacto@andes.cl',
    rol: 'EMPRESA',
    empresa: { create: { razonSocial: 'Andes SpA', rut: '12345678-5', rubro: 'Tecnología', estadoAprobacion: 'APROBADA' } },
  });
  empresaId = empresa.empresa.id;
  const empresaASuspender = await crearUsuario({
    correo: 'otra@empresa.cl',
    rol: 'EMPRESA',
    empresa: { create: { razonSocial: 'Boreal Ltda', rut: '11111111-1', rubro: 'Servicios', estadoAprobacion: 'APROBADA' } },
  });
  idEmpresaASuspender = empresaASuspender.id;

  tokenAdmin = await iniciarSesion('admin@plataforma.cl');
  tokenOtroAdmin = await iniciarSesion('admin2@plataforma.cl');
  tokenEstudiante = await iniciarSesion('ana@inacapmail.cl');
  tokenEmpresa = await iniciarSesion('contacto@andes.cl');
  tokenEstudianteASuspender = await iniciarSesion('luis@inacapmail.cl');
  tokenEmpresaASuspender = await iniciarSesion('otra@empresa.cl');
});

afterAll(async () => {
  await limpiarBase();
  await prisma.$disconnect();
});

describe('PATCH /api/admin/ofertas/:id/moderacion', () => {
  let oferta;

  beforeAll(async () => {
    oferta = await crearOferta({ titulo: 'Oferta a moderar' });
  });

  test('exige iniciar sesión', async () => {
    const respuesta = await request(app)
      .patch(`/api/admin/ofertas/${oferta.id}/moderacion`)
      .send({ decision: 'OCULTAR', motivo: MOTIVO });

    expect(respuesta.statusCode).toBe(401);
  });

  test('rechaza a un estudiante y a una empresa', async () => {
    expect((await moderar(tokenEstudiante, oferta.id, { decision: 'OCULTAR', motivo: MOTIVO })).statusCode).toBe(403);
    expect((await moderar(tokenEmpresa, oferta.id, { decision: 'OCULTAR', motivo: MOTIVO })).statusCode).toBe(403);
  });

  test('rechaza una decisión inválida', async () => {
    expect((await moderar(tokenAdmin, oferta.id, { decision: 'MANTENER', motivo: MOTIVO })).statusCode).toBe(400);
    expect((await moderar(tokenAdmin, oferta.id, { decision: 'XYZ', motivo: MOTIVO })).statusCode).toBe(400);
  });

  test('exige un motivo', async () => {
    expect((await moderar(tokenAdmin, oferta.id, { decision: 'OCULTAR' })).statusCode).toBe(400);
    expect((await moderar(tokenAdmin, oferta.id, { decision: 'OCULTAR', motivo: 'corto' })).statusCode).toBe(400);
    expect((await moderar(tokenAdmin, oferta.id, { decision: 'OCULTAR', motivo: '          ' })).statusCode).toBe(400);
  });

  test('responde 400 si el identificador no es válido', async () => {
    expect((await moderar(tokenAdmin, 'abc', { decision: 'OCULTAR', motivo: MOTIVO })).statusCode).toBe(400);
  });

  test('responde 404 si la oferta no existe', async () => {
    expect((await moderar(tokenAdmin, 999999, { decision: 'OCULTAR', motivo: MOTIVO })).statusCode).toBe(404);
  });

  test('las peticiones rechazadas no cambian la oferta ni registran nada', async () => {
    const enBase = await prisma.oferta.findUnique({ where: { id: oferta.id } });

    expect(enBase.estado).toBe('PUBLICADA');
    expect(await prisma.moderacion.count({ where: { ofertaId: oferta.id } })).toBe(0);
  });

  test('el administrador oculta una oferta y queda registrado el motivo', async () => {
    const respuesta = await moderar(tokenAdmin, oferta.id, { decision: 'OCULTAR', motivo: MOTIVO });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.oferta.estado).toBe('OCULTA');
    expect(respuesta.body.moderacion.decision).toBe('OCULTAR');
    expect(respuesta.body.moderacion.motivo).toBe(MOTIVO);

    const enBase = await prisma.oferta.findUnique({ where: { id: oferta.id } });
    expect(enBase.estado).toBe('OCULTA');

    const registros = await prisma.moderacion.findMany({ where: { ofertaId: oferta.id } });
    expect(registros).toHaveLength(1);
    expect(registros[0].motivo).toBe(MOTIVO);
    expect(registros[0].decision).toBe('OCULTAR');
  });

  test('registra qué administrador tomó la decisión', async () => {
    const admin = await prisma.administrador.findUnique({ where: { usuarioId: idAdmin } });
    const registros = await prisma.moderacion.findMany({ where: { ofertaId: oferta.id } });

    expect(registros[0].administradorId).toBe(admin.id);
  });

  test('no permite ocultar dos veces la misma oferta', async () => {
    const respuesta = await moderar(tokenAdmin, oferta.id, { decision: 'OCULTAR', motivo: MOTIVO });

    expect(respuesta.statusCode).toBe(409);
    expect(await prisma.moderacion.count({ where: { ofertaId: oferta.id } })).toBe(1);
  });

  test('el administrador elimina una oferta oculta y se conserva el historial', async () => {
    const respuesta = await moderar(tokenOtroAdmin, oferta.id, {
      decision: 'ELIMINAR',
      motivo: 'Incumple las normas de la plataforma',
    });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.oferta.estado).toBe('ELIMINADA');
    expect(await prisma.moderacion.count({ where: { ofertaId: oferta.id } })).toBe(2);
  });

  test('no permite moderar una oferta ya eliminada', async () => {
    const respuesta = await moderar(tokenAdmin, oferta.id, { decision: 'OCULTAR', motivo: MOTIVO });

    expect(respuesta.statusCode).toBe(409);
  });

  test('el administrador elimina directamente una oferta publicada', async () => {
    const otra = await crearOferta({ titulo: 'Oferta a eliminar' });
    const respuesta = await moderar(tokenAdmin, otra.id, { decision: 'ELIMINAR', motivo: MOTIVO });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.oferta.estado).toBe('ELIMINADA');
  });
});

describe('PATCH /api/admin/usuarios/:id/suspension', () => {
  test('exige iniciar sesión', async () => {
    const respuesta = await request(app)
      .patch(`/api/admin/usuarios/${idEstudianteASuspender}/suspension`)
      .send({ motivo: MOTIVO });

    expect(respuesta.statusCode).toBe(401);
  });

  test('rechaza a un estudiante y a una empresa', async () => {
    expect((await suspender(tokenEstudiante, idEstudianteASuspender, { motivo: MOTIVO })).statusCode).toBe(403);
    expect((await suspender(tokenEmpresa, idEstudianteASuspender, { motivo: MOTIVO })).statusCode).toBe(403);
  });

  test('exige un motivo', async () => {
    expect((await suspender(tokenAdmin, idEstudianteASuspender, {})).statusCode).toBe(400);
    expect((await suspender(tokenAdmin, idEstudianteASuspender, { motivo: 'corto' })).statusCode).toBe(400);
  });

  test('responde 400 si el identificador no es válido', async () => {
    expect((await suspender(tokenAdmin, 'abc', { motivo: MOTIVO })).statusCode).toBe(400);
  });

  test('responde 404 si el usuario no existe', async () => {
    expect((await suspender(tokenAdmin, 999999, { motivo: MOTIVO })).statusCode).toBe(404);
  });

  test('no permite suspender a un administrador, ni a uno mismo', async () => {
    const otroAdmin = await prisma.usuario.findUnique({ where: { correo: 'admin2@plataforma.cl' } });

    expect((await suspender(tokenAdmin, otroAdmin.id, { motivo: MOTIVO })).statusCode).toBe(403);
    expect((await suspender(tokenAdmin, idAdmin, { motivo: MOTIVO })).statusCode).toBe(403);
  });

  test('las peticiones rechazadas no suspenden ni registran nada', async () => {
    const enBase = await prisma.usuario.findUnique({ where: { id: idEstudianteASuspender } });

    expect(enBase.estadoCuenta).toBe('ACTIVA');
    expect(await prisma.suspensionCuenta.count({ where: { usuarioId: idEstudianteASuspender } })).toBe(0);
  });

  test('el administrador suspende a un estudiante y queda registrado el motivo', async () => {
    const respuesta = await suspender(tokenAdmin, idEstudianteASuspender, { motivo: MOTIVO });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.usuario.estadoCuenta).toBe('SUSPENDIDA');
    expect(respuesta.body.suspension.motivo).toBe(MOTIVO);

    const enBase = await prisma.usuario.findUnique({ where: { id: idEstudianteASuspender } });
    expect(enBase.estadoCuenta).toBe('SUSPENDIDA');

    const registros = await prisma.suspensionCuenta.findMany({ where: { usuarioId: idEstudianteASuspender } });
    expect(registros).toHaveLength(1);
    expect(registros[0].motivo).toBe(MOTIVO);
  });

  test('no permite suspender dos veces la misma cuenta', async () => {
    const respuesta = await suspender(tokenAdmin, idEstudianteASuspender, { motivo: MOTIVO });

    expect(respuesta.statusCode).toBe(409);
    expect(await prisma.suspensionCuenta.count({ where: { usuarioId: idEstudianteASuspender } })).toBe(1);
  });

  test('una cuenta suspendida no puede iniciar sesión', async () => {
    const respuesta = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'luis@inacapmail.cl', contrasena: 'Clave1234' });

    expect(respuesta.statusCode).toBe(403);
  });

  test('una sesión abierta antes de la suspensión deja de funcionar', async () => {
    const respuesta = await request(app).get('/api/auth/perfil').set(conToken(tokenEstudianteASuspender));

    expect(respuesta.statusCode).toBe(403);
    expect(respuesta.body.mensaje).toBe('La cuenta está suspendida');
  });

  test('el administrador suspende a una empresa y su sesión también se bloquea', async () => {
    const respuesta = await suspender(tokenAdmin, idEmpresaASuspender, { motivo: 'Ofertas fraudulentas reiteradas' });

    expect(respuesta.statusCode).toBe(200);

    const sesion = await request(app).get('/api/auth/perfil').set(conToken(tokenEmpresaASuspender));
    expect(sesion.statusCode).toBe(403);
  });

  test('las demás cuentas siguen funcionando', async () => {
    const respuesta = await request(app).get('/api/auth/perfil').set(conToken(tokenEstudiante));

    expect(respuesta.statusCode).toBe(200);
  });
});

describe('GET /api/admin/ofertas', () => {
  test('rechaza a un estudiante', async () => {
    const respuesta = await request(app).get('/api/admin/ofertas').set(conToken(tokenEstudiante));

    expect(respuesta.statusCode).toBe(403);
  });

  test('el administrador ve las ofertas con su empresa y su estado', async () => {
    const respuesta = await request(app).get('/api/admin/ofertas').set(conToken(tokenAdmin));

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.ofertas.length).toBeGreaterThan(0);
    expect(respuesta.body.ofertas[0].empresa.razonSocial).toBe('Andes SpA');
    expect(respuesta.body.ofertas[0].estado).toBeDefined();
  });

  test('filtra por estado', async () => {
    const respuesta = await request(app).get('/api/admin/ofertas?estado=ELIMINADA').set(conToken(tokenAdmin));

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.ofertas).toHaveLength(2);
  });

  test('rechaza un estado inválido', async () => {
    const respuesta = await request(app).get('/api/admin/ofertas?estado=XYZ').set(conToken(tokenAdmin));

    expect(respuesta.statusCode).toBe(400);
  });
});

describe('GET /api/admin/usuarios', () => {
  test('rechaza a una empresa', async () => {
    const respuesta = await request(app).get('/api/admin/usuarios').set(conToken(tokenEmpresa));

    expect(respuesta.statusCode).toBe(403);
  });

  test('el administrador ve los usuarios con su nombre y estado de cuenta', async () => {
    const respuesta = await request(app).get('/api/admin/usuarios').set(conToken(tokenAdmin));
    const ana = respuesta.body.usuarios.find((u) => u.correo === 'ana@inacapmail.cl');

    expect(respuesta.statusCode).toBe(200);
    expect(ana.nombre).toBe('Ana Pérez');
    expect(ana.estadoCuenta).toBe('ACTIVA');
  });

  test('no expone las contraseñas', async () => {
    const respuesta = await request(app).get('/api/admin/usuarios').set(conToken(tokenAdmin));

    expect(respuesta.body.usuarios[0].contrasenaHash).toBeUndefined();
  });

  test('filtra por rol y por estado de cuenta', async () => {
    const empresas = await request(app).get('/api/admin/usuarios?rol=EMPRESA').set(conToken(tokenAdmin));
    const suspendidas = await request(app).get('/api/admin/usuarios?estadoCuenta=SUSPENDIDA').set(conToken(tokenAdmin));

    expect(empresas.body.usuarios).toHaveLength(2);
    expect(suspendidas.body.usuarios).toHaveLength(2);
  });

  test('rechaza filtros inválidos', async () => {
    expect((await request(app).get('/api/admin/usuarios?rol=XYZ').set(conToken(tokenAdmin))).statusCode).toBe(400);
    expect((await request(app).get('/api/admin/usuarios?estadoCuenta=XYZ').set(conToken(tokenAdmin))).statusCode).toBe(400);
  });
});