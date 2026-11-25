export const ETIQUETA_TIPO = {
  PRACTICA: 'Práctica',
  EMPLEO: 'Empleo',
  CAPACITACION: 'Capacitación',
  SERVICIO: 'Servicio',
}

export const ETIQUETA_MODALIDAD = {
  PRESENCIAL: 'Presencial',
  REMOTA: 'Remota',
  HIBRIDA: 'Híbrida',
}

export const ETIQUETA_ESTADO_OFERTA = {
  BORRADOR: 'Borrador',
  PUBLICADA: 'Publicada',
  CERRADA: 'Cerrada',
  VENCIDA: 'Vencida',
  OCULTA: 'Oculta',
  ELIMINADA: 'Eliminada',
}

export const ESTADOS_OFERTA_EDITABLES = ['PUBLICADA', 'BORRADOR']

export const ETIQUETA_ESTADO_POSTULACION = {
  ENVIADA: 'Enviada',
  PRESELECCIONADA: 'Preseleccionada',
  ACEPTADA: 'Aceptada',
  RECHAZADA: 'Rechazada',
  CANCELADA: 'Cancelada',
}

export const ESTADOS_POSTULACION_FINALES = [
  'ACEPTADA',
  'RECHAZADA',
  'CANCELADA',
]

export const ETIQUETA_TIPO_POSTULACION = {
  POSTULACION: 'Postulación',
  INSCRIPCION: 'Inscripción',
}

export const ETIQUETA_APROBACION = {
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
}

export const ETIQUETA_ESTADO_CUENTA = {
  ACTIVA: 'Activa',
  PENDIENTE_VERIFICACION: 'Pendiente de verificación',
  SUSPENDIDA: 'Suspendida',
}

export const ETIQUETA_ESTADO_REPORTE = {
  PENDIENTE: 'Pendiente',
  RESUELTO: 'Resuelto',
  DESCARTADO: 'Descartado',
}

export const ETIQUETA_TIPO_NOTIFICACION = {
  CONFIRMACION_REGISTRO: 'Registro',
  VERIFICACION_CORREO: 'Verificación',
  CONFIRMACION_POSTULACION: 'Postulación',
  CAMBIO_ESTADO_POSTULACION: 'Cambio de estado',
  APROBACION_EMPRESA: 'Aprobación de empresa',
  CAMBIO_ESTADO_CUENTA: 'Estado de cuenta',
  RECUPERACION_CONTRASENA: 'Recuperación de contraseña',
}

export const MENSAJE_APROBACION_EMPRESA = {
  PENDIENTE:
    'Tu solicitud está en revisión. Podrás publicar ofertas cuando el administrador la apruebe.',
  RECHAZADA:
    'Tu solicitud fue rechazada por el administrador. No puedes publicar ofertas.',
}

export function mensajeAprobacionEmpresa(estado) {
  return (
    MENSAJE_APROBACION_EMPRESA[estado] ||
    MENSAJE_APROBACION_EMPRESA.PENDIENTE
  )
}

export function fechaLimiteVencida(fechaLimite) {
  if (!fechaLimite) {
    return false
  }

  const fecha =
    fechaLimite instanceof Date
      ? fechaLimite.toISOString().slice(0, 10)
      : String(fechaLimite).slice(0, 10)
  const hoy = new Date().toISOString().slice(0, 10)

  return fecha <= hoy
}

export function formatearFecha(fecha) {
  if (!fecha) {
    return 'Sin fecha'
  }

  const [anio, mes, dia] = fecha.slice(0, 10).split('-').map(Number)
  const valor = new Date(anio, mes - 1, dia)

  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' }).format(valor)
}

export function formatearFechaHora(fecha) {
  if (!fecha) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(fecha))
}

export function varianteEstado(estado) {
  return estado ? estado.toLowerCase() : 'neutro'
}
