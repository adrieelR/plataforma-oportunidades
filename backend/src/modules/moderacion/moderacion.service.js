const prisma = require('../../db/prisma');
const { crearError } = require('../../utils/errores');

const ESTADOS_OFERTA = ['BORRADOR', 'PUBLICADA', 'CERRADA', 'VENCIDA', 'OCULTA', 'ELIMINADA'];
const ROLES = ['ESTUDIANTE', 'EMPRESA', 'ADMINISTRADOR'];
const ESTADOS_CUENTA = ['PENDIENTE_VERIFICACION', 'ACTIVA', 'SUSPENDIDA'];

// El registro de moderación necesita saber qué administrador tomó la decisión
const obtenerAdministrador = async (usuarioId) => {
  const administrador = await prisma.administrador.findUnique({ where: { usuarioId } });

  if (!administrador) {
    throw crearError('No tienes un perfil de administrador', 403);
  }
  return administrador;
};

const listarOfertas = async (estado) => {
  if (estado && !ESTADOS_OFERTA.includes(estado)) {
    throw crearError('El estado solicitado no es válido', 400);
  }

  return prisma.oferta.findMany({
    where: estado ? { estado } : {},
    select: {
      id: true,
      titulo: true,
      tipo: true,
      estado: true,
      fechaPublicacion: true,
      fechaLimite: true,
      empresa: { select: { id: true, razonSocial: true } },
    },
    orderBy: { id: 'desc' },
  });
};

const moderarOferta = async (usuarioId, ofertaId, { decision, motivo }) => {
  const administrador = await obtenerAdministrador(usuarioId);
  const oferta = await prisma.oferta.findUnique({ where: { id: ofertaId } });

  if (!oferta) {
    throw crearError('Oferta no encontrada', 404);
  }
  if (oferta.estado === 'ELIMINADA') {
    throw crearError('La oferta ya fue eliminada', 409);
  }

  const nuevoEstado = decision === 'OCULTAR' ? 'OCULTA' : 'ELIMINADA';

  if (oferta.estado === nuevoEstado) {
    throw crearError('La oferta ya está oculta', 409);
  }

  // Cambio de estado y registro del motivo en una sola transacción: o se guardan los dos o ninguno
  const [moderacion, ofertaActualizada] = await prisma.$transaction([
    prisma.moderacion.create({
      data: { ofertaId, administradorId: administrador.id, decision, motivo },
      select: { id: true, ofertaId: true, decision: true, motivo: true, fechaDecision: true },
    }),
    prisma.oferta.update({
      where: { id: ofertaId },
      data: { estado: nuevoEstado },
      select: { id: true, estado: true },
    }),
  ]);

  return { moderacion, oferta: ofertaActualizada };
};

const listarUsuarios = async ({ rol, estadoCuenta }) => {
  if (rol && !ROLES.includes(rol)) {
    throw crearError('El rol solicitado no es válido', 400);
  }
  if (estadoCuenta && !ESTADOS_CUENTA.includes(estadoCuenta)) {
    throw crearError('El estado de cuenta solicitado no es válido', 400);
  }

  const usuarios = await prisma.usuario.findMany({
    where: { ...(rol && { rol }), ...(estadoCuenta && { estadoCuenta }) },
    // Nunca se selecciona contrasenaHash
    select: {
      id: true,
      correo: true,
      rol: true,
      estadoCuenta: true,
      fechaRegistro: true,
      estudiante: { select: { nombres: true, apellidos: true } },
      empresa: { select: { razonSocial: true } },
    },
    orderBy: { id: 'asc' },
  });

  return usuarios.map(({ estudiante, empresa, ...resto }) => ({
    ...resto,
    nombre: estudiante
      ? `${estudiante.nombres} ${estudiante.apellidos}`
      : empresa
        ? empresa.razonSocial
        : null,
  }));
};

const suspenderCuenta = async (usuarioId, objetivoId, { motivo }) => {
  const administrador = await obtenerAdministrador(usuarioId);
  const objetivo = await prisma.usuario.findUnique({
    where: { id: objetivoId },
    select: { id: true, rol: true, estadoCuenta: true },
  });

  if (!objetivo) {
    throw crearError('Usuario no encontrado', 404);
  }
  // Evita que un administrador se bloquee a sí mismo o a otro administrador
  if (objetivo.rol === 'ADMINISTRADOR') {
    throw crearError('No se puede suspender a un administrador', 403);
  }
  if (objetivo.estadoCuenta === 'SUSPENDIDA') {
    throw crearError('La cuenta ya está suspendida', 409);
  }

  const [suspension, usuario] = await prisma.$transaction([
    prisma.suspensionCuenta.create({
      data: { usuarioId: objetivoId, administradorId: administrador.id, motivo },
      select: { id: true, usuarioId: true, motivo: true, fechaSuspension: true },
    }),
    prisma.usuario.update({
      where: { id: objetivoId },
      data: { estadoCuenta: 'SUSPENDIDA' },
      select: { id: true, correo: true, rol: true, estadoCuenta: true },
    }),
  ]);

  return { suspension, usuario };
};

module.exports = { listarOfertas, moderarOferta, listarUsuarios, suspenderCuenta };