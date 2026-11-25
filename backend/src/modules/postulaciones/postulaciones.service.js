const prisma = require('../../db/prisma');
const { crearError } = require('../../utils/errores');
const { notificarEstadoPostulacion } = require('../notificaciones/notificaciones.service');
// Estados en los que una oferta ya no se puede ver ni postular (la ve solo su empresa o el administrador)
const ESTADOS_NO_VISIBLES = ['BORRADOR', 'OCULTA', 'ELIMINADA'];
const ESTADOS_POSTULACION = ['ENVIADA', 'PRESELECCIONADA', 'ACEPTADA', 'RECHAZADA', 'CANCELADA'];
const postular = async (usuarioId, ofertaId) => {
  // 1. Solo un estudiante verificado puede postular (HU-06)
  const estudiante = await prisma.estudiante.findUnique({ where: { usuarioId } });

  if (!estudiante) {
    throw crearError('No tienes un perfil de estudiante', 403);
  }
  if (!estudiante.verificado) {
    throw crearError('Debes verificar tu cuenta de estudiante para postular', 403);
  }

  // 2. La oferta debe existir y haber sido visible para los estudiantes
  const oferta = await prisma.oferta.findUnique({ where: { id: ofertaId } });

  if (!oferta || ESTADOS_NO_VISIBLES.includes(oferta.estado)) {
    throw crearError('Oferta no encontrada', 404);
  }

  // 3. No se puede postular a una oferta cerrada o vencida (por estado o por fecha límite)
  const ahora = new Date();
  if (oferta.estado === 'PUBLICADA' && oferta.fechaLimite <= ahora) {
    await prisma.oferta.update({
      where: { id: oferta.id },
      data: { estado: 'VENCIDA' },
    });
    throw crearError('La oferta está vencida y no admite nuevas postulaciones', 409);
  }

  if (oferta.estado !== 'PUBLICADA') {
    throw crearError('La oferta ya no está vigente', 409);
  }

  // 4. Una sola postulación por estudiante y oferta
  const existente = await prisma.postulacion.findUnique({
    where: { estudianteId_ofertaId: { estudianteId: estudiante.id, ofertaId } },
  });

  if (existente) {
    throw crearError('Ya postulaste a esta oferta', 409);
  }

  try {
    return await prisma.postulacion.create({
      data: {
        estudianteId: estudiante.id,
        ofertaId,
        // Las capacitaciones se registran como inscripción; el resto, como postulación
        tipo: oferta.tipo === 'CAPACITACION' ? 'INSCRIPCION' : 'POSTULACION',
      },
    });
  } catch (error) {
    // Dos solicitudes simultáneas: la restricción única de la base de datos lo impide
    if (error.code === 'P2002') {
      throw crearError('Ya postulaste a esta oferta', 409);
    }
    throw error;
  }
};

// HU-07: la empresa dueña de la oferta cambia el estado de una postulación
const cambiarEstado = async (usuarioId, postulacionId, nuevoEstado) => {
  const empresa = await prisma.empresa.findUnique({ where: { usuarioId } });

  if (!empresa) {
    throw crearError('No tienes un perfil de empresa', 403);
  }
  if (empresa.estadoAprobacion !== 'APROBADA') {
    throw crearError('Tu empresa aún no está aprobada para gestionar postulaciones', 403);
  }

  const postulacion = await prisma.postulacion.findUnique({
    where: { id: postulacionId },
    include: { oferta: { select: { empresaId: true, estado: true } } },
  });

  if (!postulacion || postulacion.oferta.estado === 'ELIMINADA') {
    throw crearError('Postulación no encontrada', 404);
  }
  // OWASP A01: solo la empresa dueña de la oferta gestiona sus postulaciones
  if (postulacion.oferta.empresaId !== empresa.id) {
    throw crearError('No tienes permiso sobre esta postulación', 403);
  }

  if (postulacion.estado === 'CANCELADA') {
    throw crearError('El estudiante canceló esta postulación', 409);
  }
  // ACEPTADA y RECHAZADA son decisiones finales
  if (['ACEPTADA', 'RECHAZADA'].includes(postulacion.estado)) {
    throw crearError('La postulación ya fue resuelta y no se puede cambiar', 409);
  }
  if (postulacion.estado === nuevoEstado) {
    throw crearError(`La postulación ya está en estado ${nuevoEstado}`, 409);
  }

  const actualizada = await prisma.postulacion.update({
    where: { id: postulacionId },
    data: { estado: nuevoEstado },
    select: {
      id: true,
      ofertaId: true,
      estudianteId: true,
      tipo: true,
      estado: true,
      fechaPostulacion: true,
      estudiante: { select: { usuarioId: true, nombres: true } },
      oferta: { select: { titulo: true } },
    },
  });

  await notificarEstadoPostulacion({
    usuarioId: actualizada.estudiante.usuarioId,
    nombre: actualizada.estudiante.nombres,
    tituloOferta: actualizada.oferta.titulo,
    estado: nuevoEstado,
  });

  return {
    id: actualizada.id,
    ofertaId: actualizada.ofertaId,
    estudianteId: actualizada.estudianteId,
    tipo: actualizada.tipo,
    estado: actualizada.estado,
    fechaPostulacion: actualizada.fechaPostulacion,
  };
};

// HU-12: el estudiante ve todas sus postulaciones con su estado actual
const listarMisPostulaciones = async (usuarioId, estado) => {
  const estudiante = await prisma.estudiante.findUnique({ where: { usuarioId } });

  if (!estudiante) {
    throw crearError('No tienes un perfil de estudiante', 403);
  }
  if (estado && !ESTADOS_POSTULACION.includes(estado)) {
    throw crearError('El estado solicitado no es válido', 400);
  }

  return prisma.postulacion.findMany({
    where: { estudianteId: estudiante.id, ...(estado && { estado }) },
    select: {
      id: true,
      tipo: true,
      estado: true,
      fechaPostulacion: true,
      // La oferta se muestra aunque ya esté cerrada, vencida o eliminada; "oferta.estado" lo indica
      oferta: {
        select: {
          id: true,
          titulo: true,
          tipo: true,
          modalidad: true,
          area: true,
          ubicacion: true,
          estado: true,
          fechaLimite: true,
          empresa: { select: { id: true, usuarioId:true, razonSocial: true, } },
        },
      },
    },
    orderBy: [{ fechaPostulacion: 'desc' }, { id: 'desc' }],
  });
};

module.exports = { postular, cambiarEstado, listarMisPostulaciones };
