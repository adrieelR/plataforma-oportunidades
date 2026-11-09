const prisma = require('../../db/prisma');
const { crearError } = require('../../utils/errores');

const ESTADOS_LISTABLES = ['BORRADOR', 'PUBLICADA', 'CERRADA', 'VENCIDA', 'OCULTA'];

// Devuelve la empresa del usuario autenticado
const obtenerEmpresa = async (usuarioId) => {
  const empresa = await prisma.empresa.findUnique({ where: { usuarioId } });

  if (!empresa) {
    throw crearError('No tienes un perfil de empresa', 403);
  }
  return empresa;
};

// Solo una empresa aprobada por el administrador puede crear o modificar ofertas (RF-03)
const obtenerEmpresaAprobada = async (usuarioId) => {
  const empresa = await obtenerEmpresa(usuarioId);

  if (empresa.estadoAprobacion !== 'APROBADA') {
    throw crearError('Tu empresa aún no está aprobada para gestionar ofertas', 403);
  }
  return empresa;
};

// OWASP A01: la oferta debe existir y pertenecer a la empresa que la modifica
const obtenerOfertaPropia = async (empresaId, ofertaId) => {
  const oferta = await prisma.oferta.findUnique({ where: { id: ofertaId } });

  if (!oferta || oferta.estado === 'ELIMINADA') {
    throw crearError('Oferta no encontrada', 404);
  }
  if (oferta.empresaId !== empresaId) {
    throw crearError('No tienes permiso sobre esta oferta', 403);
  }
  return oferta;
};

const crearOferta = async (usuarioId, datos) => {
  const empresa = await obtenerEmpresaAprobada(usuarioId);

  return prisma.oferta.create({
    data: {
      ...datos,
      empresaId: empresa.id,
      estado: 'PUBLICADA',
      fechaPublicacion: new Date(),
    },
  });
};

const listarMisOfertas = async (usuarioId, estado) => {
  const empresa = await obtenerEmpresa(usuarioId);

  if (estado && !ESTADOS_LISTABLES.includes(estado)) {
    throw crearError('El estado solicitado no es válido', 400);
  }

  return prisma.oferta.findMany({
    where: {
      empresaId: empresa.id,
      estado: estado || { not: 'ELIMINADA' },
    },
    include: { _count: { select: { postulaciones: true } } },
    orderBy: { id: 'desc' },
  });
};

const editarOferta = async (usuarioId, ofertaId, datos) => {
  const empresa = await obtenerEmpresaAprobada(usuarioId);
  const oferta = await obtenerOfertaPropia(empresa.id, ofertaId);

  if (!['BORRADOR', 'PUBLICADA'].includes(oferta.estado)) {
    throw crearError('No se puede editar una oferta cerrada, vencida u oculta', 409);
  }

  return prisma.oferta.update({ where: { id: ofertaId }, data: datos });
};

const cambiarEstado = async (usuarioId, ofertaId, nuevoEstado) => {
  const empresa = await obtenerEmpresaAprobada(usuarioId);
  const oferta = await obtenerOfertaPropia(empresa.id, ofertaId);

  if (oferta.estado === nuevoEstado) {
    throw crearError(`La oferta ya está en estado ${nuevoEstado}`, 409);
  }

  // Solo se alterna entre PUBLICADA y CERRADA; VENCIDA, OCULTA y BORRADOR no se pueden cambiar desde aquí
  if (!['PUBLICADA', 'CERRADA'].includes(oferta.estado)) {
    throw crearError('No se puede cambiar el estado de una oferta vencida, oculta o en borrador', 409);
  }

  if (nuevoEstado === 'PUBLICADA' && oferta.fechaLimite <= new Date()) {
    throw crearError('No se puede reactivar una oferta con la fecha límite vencida', 409);
  }

  return prisma.oferta.update({
    where: { id: ofertaId },
    data: { estado: nuevoEstado },
  });
};

// Borrado lógico: la oferta queda ELIMINADA para conservar el historial de postulaciones
const eliminarOferta = async (usuarioId, ofertaId) => {
  const empresa = await obtenerEmpresaAprobada(usuarioId);
  await obtenerOfertaPropia(empresa.id, ofertaId);

  return prisma.oferta.update({
    where: { id: ofertaId },
    data: { estado: 'ELIMINADA' },
    select: { id: true, estado: true },
  });
};

module.exports = { crearOferta, listarMisOfertas, editarOferta, cambiarEstado, eliminarOferta };