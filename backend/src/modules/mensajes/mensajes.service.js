const prisma = require('../../db/prisma');
const { crearError } = require('../../utils/errores');

const validarParticipacionYOferta = async ({ ofertaId, remitenteId, destinatarioId }) => {
  if (remitenteId === destinatarioId) {
    throw crearError('No puedes enviarte un mensaje a ti mismo', 400);
  }

  const oferta = await prisma.oferta.findUnique({
    where: { id: ofertaId },
    include: {
      empresa: { select: { usuarioId: true } },
      postulaciones: {
        include: {
          estudiante: { select: { usuarioId: true } },
        },
      },
    },
  });

  if (!oferta) {
    throw crearError('Oferta no encontrada', 404);
  }

  const usuarioEmpresaId = oferta.empresa?.usuarioId;
  const idsEstudiantesPostulados = oferta.postulaciones
    .map((p) => p.estudiante?.usuarioId)
    .filter(Boolean);

  const esEmpresaDeOferta = remitenteId === usuarioEmpresaId;
  const esEstudiantePostulado = idsEstudiantesPostulados.includes(remitenteId);

  if (!esEmpresaDeOferta && !esEstudiantePostulado) {
    throw crearError('No tienes permiso para enviar mensajes en esta oferta', 403);
  }

  if (esEmpresaDeOferta && !idsEstudiantesPostulados.includes(destinatarioId)) {
    throw crearError('El destinatario no tiene una postulación asociada a esta oferta', 400);
  }

  if (esEstudiantePostulado && destinatarioId !== usuarioEmpresaId) {
    throw crearError('El destinatario no corresponde a la empresa de esta oferta', 400);
  }

  return oferta;
};

const enviarMensaje = async ({ ofertaId, remitenteId, destinatarioId, contenido }) => {
  await validarParticipacionYOferta({ ofertaId, remitenteId, destinatarioId });

  return prisma.mensaje.create({
    data: {
      ofertaId,
      remitenteId,
      destinatarioId,
      contenido,
    },
    select: {
      id: true,
      ofertaId: true,
      remitenteId: true,
      destinatarioId: true,
      contenido: true,
      fechaEnvio: true,
      leido: true,
    },
  });
};

const listarMensajes = async ({ usuarioId, ofertaId }) => {
  const where = {
    OR: [{ remitenteId: usuarioId }, { destinatarioId: usuarioId }],
  };

  if (ofertaId !== undefined) {
    where.ofertaId = ofertaId;
  }

  return prisma.mensaje.findMany({
    where,
    select: {
      id: true,
      ofertaId: true,
      remitenteId: true,
      destinatarioId: true,
      contenido: true,
      fechaEnvio: true,
      leido: true,
      remitente: { select: { id: true, correo: true, rol: true } },
      destinatario: { select: { id: true, correo: true, rol: true } },
    },
    orderBy: { fechaEnvio: 'asc' },
  });
};

const marcarComoLeido = async ({ mensajeId, usuarioId }) => {
  const mensaje = await prisma.mensaje.findUnique({ where: { id: mensajeId } });

  if (!mensaje) {
    throw crearError('Mensaje no encontrado', 404);
  }

  if (mensaje.destinatarioId !== usuarioId) {
    throw crearError('Solo el destinatario puede marcar el mensaje como leído', 403);
  }

  return prisma.mensaje.update({
    where: { id: mensajeId },
    data: { leido: true },
    select: {
      id: true,
      ofertaId: true,
      remitenteId: true,
      destinatarioId: true,
      contenido: true,
      fechaEnvio: true,
      leido: true,
    },
  });
};

module.exports = {
  enviarMensaje,
  listarMensajes,
  marcarComoLeido,
};