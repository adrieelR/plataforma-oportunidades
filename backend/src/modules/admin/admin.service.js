const prisma = require('../../db/prisma');
const { crearError } = require('../../utils/errores');

const ESTADOS = ['PENDIENTE', 'APROBADA', 'RECHAZADA'];

const listarEmpresas = async (estado) => {
  const filtro = estado || 'PENDIENTE';

  if (!ESTADOS.includes(filtro)) {
    throw crearError('El estado solicitado no es válido', 400);
  }

  const empresas = await prisma.empresa.findMany({
    where: { estadoAprobacion: filtro },
    select: {
      id: true,
      razonSocial: true,
      rut: true,
      rubro: true,
      descripcion: true,
      estadoAprobacion: true,
      usuario: { select: { correo: true } },
    },
    orderBy: { id: 'asc' },
  });

  return empresas.map(({ usuario, ...resto }) => ({ ...resto, correo: usuario.correo }));
};

const resolverAprobacion = async (empresaId, decision) => {
  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });

  if (!empresa) {
    throw crearError('Empresa no encontrada', 404);
  }

  if (empresa.estadoAprobacion !== 'PENDIENTE') {
    throw crearError('La solicitud de esta empresa ya fue resuelta', 409);
  }

  const aprobada = decision === 'APROBAR';

  return prisma.empresa.update({
    where: { id: empresaId },
    data: {
      estadoAprobacion: aprobada ? 'APROBADA' : 'RECHAZADA',
      fechaAprobacion: aprobada ? new Date() : null,
    },
    select: { id: true, estadoAprobacion: true },
  });
};

module.exports = { listarEmpresas, resolverAprobacion };