const prisma = require('../../src/db/prisma');
const correo = require('../../src/services/correo');
const {
  notificar,
  notificarResultadoEmpresa,
  notificarEstadoPostulacion,
} = require('../../src/modules/notificaciones/notificaciones.service');

let usuario;

beforeAll(async () => {
  await prisma.usuario.deleteMany();
  usuario = await prisma.usuario.create({
    data: { correo: 'ana@inacapmail.cl', contrasenaHash: 'no-se-usa', rol: 'ESTUDIANTE' },
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  await prisma.usuario.deleteMany();
  await prisma.$disconnect();
});

describe('notificar', () => {
  test('registra la notificación y la marca como enviada', async () => {
    const espia = jest.spyOn(correo, 'enviarCorreo');

    const notificacion = await notificar({
      usuarioId: usuario.id,
      tipo: 'CONFIRMACION_REGISTRO',
      asunto: 'Hola',
      cuerpo: 'Cuerpo del mensaje',
    });

    expect(notificacion.estadoEnvio).toBe('ENVIADA');
    expect(espia).toHaveBeenCalledWith({
      destinatario: 'ana@inacapmail.cl',
      asunto: 'Hola',
      cuerpo: 'Cuerpo del mensaje',
    });
  });

  test('si el correo falla, queda FALLIDA y no lanza error', async () => {
    jest.spyOn(correo, 'enviarCorreo').mockRejectedValue(new Error('SMTP caído'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const notificacion = await notificar({
      usuarioId: usuario.id,
      tipo: 'CONFIRMACION_REGISTRO',
      asunto: 'Hola',
      cuerpo: 'Cuerpo del mensaje',
    });

    expect(notificacion.estadoEnvio).toBe('FALLIDA');
  });

  test('devuelve null si el usuario no existe', async () => {
    const notificacion = await notificar({
      usuarioId: 999999,
      tipo: 'CONFIRMACION_REGISTRO',
      asunto: 'Hola',
      cuerpo: 'Cuerpo del mensaje',
    });

    expect(notificacion).toBeNull();
  });
});

describe('textos de las notificaciones', () => {
  test('informa la aprobación o el rechazo de una empresa', async () => {
    const aprobada = await notificarResultadoEmpresa({
      usuarioId: usuario.id,
      razonSocial: 'Andes SpA',
      aprobada: true,
    });
    const rechazada = await notificarResultadoEmpresa({
      usuarioId: usuario.id,
      razonSocial: 'Andes SpA',
      aprobada: false,
    });

    expect(aprobada.asunto).toContain('aprobada');
    expect(rechazada.asunto).toContain('rechazada');
  });

  test('informa el nuevo estado de una postulación', async () => {
    const notificacion = await notificarEstadoPostulacion({
      usuarioId: usuario.id,
      nombre: 'Ana',
      tituloOferta: 'Práctica de desarrollo web',
      estado: 'ACEPTADA',
    });

    expect(notificacion.tipo).toBe('CAMBIO_ESTADO_POSTULACION');
    expect(notificacion.cuerpo).toContain('aceptada');
    expect(notificacion.cuerpo).toContain('Práctica de desarrollo web');
  });
});