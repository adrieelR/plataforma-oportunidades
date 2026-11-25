const prisma = require('../../db/prisma');
const {crearError} = require('../../utils/errores');

// Solo se muestran ofertas PUBLICADAS cuya fecha límite aún no pasó (criterio de HU-05)
const buscarOfertas = async ({ tipo, modalidad, area, ubicacion, q, pagina, limite }) => {
  const contiene = (texto) => ({ contains: texto, mode: 'insensitive' });

  const where = {
    estado: 'PUBLICADA',
    fechaLimite: { gt: new Date() },
    ...(tipo && { tipo }),
    ...(modalidad && { modalidad }),
    ...(area && { area: contiene(area) }),
    ...(ubicacion && { ubicacion: contiene(ubicacion) }),
    ...(q && { OR: [{ titulo: contiene(q) }, { descripcion: contiene(q) }] }),
  };

  const [total, ofertas] = await prisma.$transaction([
    prisma.oferta.count({ where }),
    prisma.oferta.findMany({
      where,
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        tipo: true,
        modalidad: true,
        area: true,
        ubicacion: true,
        cupos: true,
        fechaPublicacion: true,
        fechaLimite: true,
        // Solo datos públicos de la empresa: nunca el RUT ni el correo
        empresa: { select: { id: true, razonSocial: true, rubro: true } },
      },
      orderBy: [{ fechaPublicacion: 'desc' }, { id: 'desc' }],
      skip: (pagina - 1) * limite,
      take: limite,
    }),
  ]);

  return {
    ofertas,
    paginacion: { pagina, limite, total, totalPaginas: Math.ceil(total / limite) },
  };
};
const obtenerOferta = async (usuarioId, ofertaId) => {
  const estudiante = await prisma.estudiante.findUnique({ where: { usuarioId } });

  if (!estudiante) {
    throw crearError('No tienes un perfil de estudiante', 403);
  }

  const oferta = await prisma.oferta.findUnique({
    where: { id: ofertaId },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      tipo: true,
      modalidad: true,
      area: true,
      ubicacion: true,
      cupos: true,
      estado: true,
      fechaLimite: true,
      fechaPublicacion: true,
      empresa: { select: { razonSocial: true, rubro: true } },
    },
  });

  if (!oferta || ['BORRADOR', 'ELIMINADA', 'OCULTA'].includes(oferta.estado)) {
    throw crearError('Oferta no encontrada', 404);
  }

  const postulacion = await prisma.postulacion.findUnique({
    where: { estudianteId_ofertaId: { estudianteId: estudiante.id, ofertaId } },
    select: { estado: true },
  });

  const vigente = oferta.estado === 'PUBLICADA' && oferta.fechaLimite > new Date();

  // Una oferta cerrada o vencida solo la ve quien postuló a ella
  if (!vigente && !postulacion) {
    throw crearError('Oferta no encontrada', 404);
  }

  return {
    oferta: { ...oferta, vigente },
    yaPostulo: Boolean(postulacion),
    estadoPostulacion: postulacion ? postulacion.estado : null,
  };
};

module.exports = { buscarOfertas , obtenerOferta}; 
