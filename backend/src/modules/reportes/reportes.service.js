const prisma = require('../../db/prisma');
const { crearError } = require('../../utils/errores');

const ESTADOS_REPORTE = ['PENDIENTE', 'RESUELTO', 'DESCARTADO'];

const crearReporte = async ({ ofertaId, usuarioId, motivo }) => {
  const oferta = await prisma.oferta.findUnique({
    where: { id: ofertaId },
    include: { empresa: { select: { usuarioId: true } } },
  });

  if (!oferta || oferta.estado === 'ELIMINADA') {
    throw crearError('Oferta no encontrada', 404);
  }

  if (oferta.empresa?.usuarioId === usuarioId) {
    throw crearError('No puedes reportar tu propia publicación', 400);
  }

  const reportePendienteExistente = await prisma.reporte.findFirst({
    where: {
      ofertaId,
      usuarioId,
      estado: 'PENDIENTE',
    },
  });

  if (reportePendienteExistente) {
    throw crearError('Ya tienes un reporte pendiente para esta publicación', 409);
  }

  return prisma.reporte.create({
    data: {
      ofertaId,
      usuarioId,
      motivo,
      estado: 'PENDIENTE',
    },
    select: {
      id: true,
      ofertaId: true,
      usuarioId: true,
      motivo: true,
      estado: true,
      fechaReporte: true,
    },
  });
};

const listarReportes = async (estado) => {
  const filtro = estado || 'PENDIENTE';

  if (!ESTADOS_REPORTE.includes(filtro)) {
    throw crearError('El estado de reporte solicitado no es válido', 400);
  }

  return prisma.reporte.findMany({
    where: { estado: filtro },
    select: {
      id: true,
      ofertaId: true,
      usuarioId: true,
      motivo: true,
      estado: true,
      fechaReporte: true,
      oferta: {
        select: {
          id: true,
          titulo: true,
          estado: true,
          empresa: { select: { id: true, razonSocial: true } },
        },
      },
      usuario: {
        select: { id: true, correo: true, rol: true },
      },
    },
    orderBy: { fechaReporte: 'desc' },
  });
};

module.exports = {
  crearReporte,
  listarReportes,
};