import { peticion } from './cliente'
import { notificacionesDisponibles } from './config'

// Endpoint pendiente en el backend (HU-10). Mientras el interruptor esté en
// false se devuelve una lista vacía y no se realizan peticiones de red.
// Cuando exista GET /notificaciones se espera { notificaciones: [...] }.
export async function listarNotificaciones() {
  if (!notificacionesDisponibles) {
    return { notificaciones: [] }
  }

  return peticion('/notificaciones')
}
