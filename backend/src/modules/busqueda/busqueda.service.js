const prisma = require('../../db/prisma');

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

module.exports = { buscarOfertas };