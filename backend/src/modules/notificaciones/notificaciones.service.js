const prisma = require('../../db/prisma');
const correo = require('../../services/correo');

// Registra la notificación y la envía por correo (CU-10).
// Nunca lanza error: si el correo falla, la operación principal (registro, aprobación...) sigue funcionando.
const notificar = async ({ usuarioId, tipo, asunto, cuerpo }) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { correo: true },
    });

    if (!usuario) {
      return null;
    }

    const notificacion = await prisma.notificacion.create({
      data: { usuarioId, tipo, asunto, cuerpo },
    });

    let estadoEnvio = 'ENVIADA';

    try {
      await correo.enviarCorreo({ destinatario: usuario.correo, asunto, cuerpo });
    } catch (error) {
      estadoEnvio = 'FALLIDA';
      console.error('No se pudo enviar el correo:', error.message);
    }

    return await prisma.notificacion.update({
      where: { id: notificacion.id },
      data: { estadoEnvio },
    });
  } catch (error) {
    console.error('No se pudo registrar la notificación:', error.message);
    return null;
  }
};

// ---- Un mensaje por cada evento de RF-10 ----

const notificarRegistroEstudiante = ({ usuarioId, nombre }) =>
  notificar({
    usuarioId,
    tipo: 'CONFIRMACION_REGISTRO',
    asunto: 'Tu registro en la plataforma fue recibido',
    cuerpo:
      `Hola ${nombre},\n\n` +
      'Tu cuenta fue creada correctamente. Para postular a ofertas, tu cuenta debe estar verificada.\n\n' +
      'Plataforma de Oportunidades para Estudiantes',
  });

const notificarRegistroEmpresa = ({ usuarioId, razonSocial }) =>
  notificar({
    usuarioId,
    tipo: 'CONFIRMACION_REGISTRO',
    asunto: 'Recibimos la solicitud de registro de tu empresa',
    cuerpo:
      `Hola ${razonSocial},\n\n` +
      'Tu solicitud quedó pendiente de aprobación por el administrador. ' +
      'Te avisaremos por este medio cuando sea resuelta.\n\n' +
      'Plataforma de Oportunidades para Estudiantes',
  });

const notificarResultadoEmpresa = ({ usuarioId, razonSocial, aprobada }) =>
  notificar({
    usuarioId,
    tipo: 'APROBACION_EMPRESA',
    asunto: aprobada ? 'Tu empresa fue aprobada' : 'Tu solicitud de registro fue rechazada',
    cuerpo: aprobada
      ? `Hola ${razonSocial},\n\nTu empresa fue aprobada. Ya puedes publicar ofertas en la plataforma.`
      : `Hola ${razonSocial},\n\nTu solicitud de registro fue rechazada por el administrador, por lo que no podrás publicar ofertas.`,
  });

const ESTADOS = {
  PRESELECCIONADA: 'preseleccionada',
  ACEPTADA: 'aceptada',
  RECHAZADA: 'rechazada',
  CANCELADA: 'cancelada',
};

const notificarEstadoPostulacion = ({ usuarioId, nombre, tituloOferta, estado }) =>
  notificar({
    usuarioId,
    tipo: 'CAMBIO_ESTADO_POSTULACION',
    asunto: 'Cambió el estado de tu postulación',
    cuerpo:
      `Hola ${nombre},\n\n` +
      `Tu postulación a "${tituloOferta}" ahora está ${ESTADOS[estado] || estado.toLowerCase()}.\n\n` +
      'Puedes ver el detalle en la sección "Mis postulaciones".',
  });

module.exports = {
  notificar,
  notificarRegistroEstudiante,
  notificarRegistroEmpresa,
  notificarResultadoEmpresa,
  notificarEstadoPostulacion,
};