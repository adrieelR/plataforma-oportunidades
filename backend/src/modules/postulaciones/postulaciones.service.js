const prisma = require('../../db/prisma');
const { crearError } = require('../../utils/errores');

// Estados en los que una oferta ya no se puede ver ni postular (la ve solo su empresa o el administrador)
const ESTADOS_NO_VISIBLES = ['BORRADOR', 'OCULTA', 'ELIMINADA'];

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
  if (oferta.estado !== 'PUBLICADA' || oferta.fechaLimite <= new Date()) {
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

module.exports = { postular };