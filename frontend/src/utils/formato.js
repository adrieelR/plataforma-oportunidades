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
  PUBLICADA: 'Publicada',
  CERRADA: 'Cerrada',
  VENCIDA: 'Vencida',
}

export const ETIQUETA_ESTADO_POSTULACION = {
  ENVIADA: 'Enviada',
  PRESELECCIONADA: 'Preseleccionada',
  ACEPTADA: 'Aceptada',
  RECHAZADA: 'Rechazada',
  CANCELADA: 'Cancelada',
}

export const ETIQUETA_APROBACION = {
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
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
