const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const prisma = require('../../src/db/prisma');

const limpiarBase = async () => {
  await prisma.oferta.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.institucionEducativa.deleteMany();
};

const conToken = (token) => ({ Authorization: `Bearer ${token}` });
const dias = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

let tokenEstudiante;
let tokenEmpresa;
let empresaId;

const iniciarSesion = async (correo, contrasena) => {
  const respuesta = await request(app).post('/api/auth/login').send({ correo, contrasena });
  return respuesta.body.token;
};

const crearOferta = (datos) =>
  prisma.oferta.create({
    data: {
      empresaId,
      titulo: 'Oferta de prueba',
      descripcion: 'Descripción de la oferta de prueba para la búsqueda.',
      tipo: 'PRACTICA',
      modalidad: 'PRESENCIAL',
      area: 'Tecnología',
      ubicacion: 'Santiago',
      estado: 'PUBLICADA',
      fechaPublicacion: new Date(),
      fechaLimite: dias(30),
      ...datos,
    },
  });

beforeAll(async () => {
  await limpiarBase();

  await prisma.institucionEducativa.create({ data: { nombre: 'INACAP', dominioCorreo: 'inacapmail.cl' } });

  const empresa = await prisma.usuario.create({
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
  empresaId = empresa.empresa.id;

  await request(app).post('/api/auth/registro').send({
    nombres: 'Ana',
    apellidos: 'Pérez',
    carrera: 'Ingeniería en Informática',
    correo: 'ana@inacapmail.cl',
    contrasena: 'Clave1234',
  });

  // Ofertas vigentes (las únicas que debe devolver la búsqueda)
  await crearOferta({ titulo: 'Práctica de desarrollo web', tipo: 'PRACTICA', area: 'Tecnología', ubicacion: 'Santiago', modalidad: 'PRESENCIAL' });
  await crearOferta({ titulo: 'Ejecutivo de ventas', descripcion: 'Venta de servicios a empresas medianas.', tipo: 'EMPLEO', area: 'Marketing', ubicacion: 'Valparaíso', modalidad: 'REMOTA' });
  await crearOferta({ titulo: 'Curso de Node.js', descripcion: 'Capacitación práctica en backend con Node.js.', tipo: 'CAPACITACION', area: 'Tecnología', ubicacion: 'Santiago', modalidad: 'HIBRIDA' });

  // Ofertas que NO deben aparecer
  await crearOferta({ titulo: 'Publicada pero con fecha vencida', fechaLimite: dias(-1) });
  await crearOferta({ titulo: 'Oferta cerrada', estado: 'CERRADA' });
  await crearOferta({ titulo: 'Oferta eliminada', estado: 'ELIMINADA' });
  await crearOferta({ titulo: 'Oferta oculta', estado: 'OCULTA' });
  await crearOferta({ titulo: 'Oferta en borrador', estado: 'BORRADOR', fechaPublicacion: null });
  await crearOferta({ titulo: 'Oferta vencida', estado: 'VENCIDA' });

  tokenEstudiante = await iniciarSesion('ana@inacapmail.cl', 'Clave1234');
  tokenEmpresa = await iniciarSesion('contacto@andes.cl', 'Empresa1234');
});

afterAll(async () => {
  await limpiarBase();
  await prisma.$disconnect();
});

const buscar = (consulta = '') => request(app).get(`/api/busqueda/ofertas${consulta}`).set(conToken(tokenEstudiante));

describe('GET /api/busqueda/ofertas', () => {
  test('exige iniciar sesión', async () => {
    const respuesta = await request(app).get('/api/busqueda/ofertas');

    expect(respuesta.statusCode).toBe(401);
  });

  test('rechaza a una empresa', async () => {
    const respuesta = await request(app).get('/api/busqueda/ofertas').set(conToken(tokenEmpresa));

    expect(respuesta.statusCode).toBe(403);
  });

  test('sin filtros devuelve solo las ofertas vigentes', async () => {
    const respuesta = await buscar();

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.ofertas).toHaveLength(3);
    expect(respuesta.body.paginacion.total).toBe(3);

    const titulos = respuesta.body.ofertas.map((o) => o.titulo);
    expect(titulos).not.toContain('Publicada pero con fecha vencida');
    expect(titulos).not.toContain('Oferta cerrada');
    expect(titulos).not.toContain('Oferta eliminada');
    expect(titulos).not.toContain('Oferta oculta');
    expect(titulos).not.toContain('Oferta en borrador');
    expect(titulos).not.toContain('Oferta vencida');
  });

  test('filtra por tipo de oferta', async () => {
    const respuesta = await buscar('?tipo=EMPLEO');

    expect(respuesta.body.ofertas).toHaveLength(1);
    expect(respuesta.body.ofertas[0].titulo).toBe('Ejecutivo de ventas');
  });

  test('filtra por área sin distinguir mayúsculas', async () => {
    const respuesta = await buscar('?area=tecnolog');

    expect(respuesta.body.ofertas).toHaveLength(2);
  });

  test('filtra por ubicación', async () => {
    const respuesta = await buscar('?ubicacion=valpara');

    expect(respuesta.body.ofertas).toHaveLength(1);
    expect(respuesta.body.ofertas[0].tipo).toBe('EMPLEO');
  });

  test('filtra por modalidad', async () => {
    const respuesta = await buscar('?modalidad=REMOTA');

    expect(respuesta.body.ofertas).toHaveLength(1);
  });

  test('combina varios filtros', async () => {
    const respuesta = await buscar('?tipo=CAPACITACION&ubicacion=santiago&area=tecnolog');

    expect(respuesta.body.ofertas).toHaveLength(1);
    expect(respuesta.body.ofertas[0].titulo).toBe('Curso de Node.js');
  });

  test('busca por texto en título o descripción', async () => {
    const respuesta = await buscar('?q=node');

    expect(respuesta.body.ofertas).toHaveLength(1);
  });

  test('responde lista vacía si nada coincide', async () => {
    const respuesta = await buscar('?tipo=SERVICIO');

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body.ofertas).toHaveLength(0);
    expect(respuesta.body.paginacion.total).toBe(0);
  });

  test('rechaza un tipo inválido', async () => {
    const respuesta = await buscar('?tipo=PASANTIA');

    expect(respuesta.statusCode).toBe(400);
  });

  test('rechaza un límite fuera de rango', async () => {
    const respuesta = await buscar('?limite=500');

    expect(respuesta.statusCode).toBe(400);
  });

  test('pagina los resultados', async () => {
    const primera = await buscar('?limite=2&pagina=1');
    const segunda = await buscar('?limite=2&pagina=2');

    expect(primera.body.ofertas).toHaveLength(2);
    expect(segunda.body.ofertas).toHaveLength(1);
    expect(primera.body.paginacion.totalPaginas).toBe(2);
  });

  test('muestra la empresa sin datos sensibles', async () => {
    const respuesta = await buscar('?tipo=EMPLEO');
    const { empresa } = respuesta.body.ofertas[0];

    expect(empresa.razonSocial).toBe('Andes SpA');
    expect(empresa.rut).toBeUndefined();
    expect(empresa.correo).toBeUndefined();
  });
});