import { peticion } from './cliente'
import { usarMock } from './config'
import {
  cambiarEstadoPostulacionMock,
  crearPostulacionMock,
  listarMisPostulacionesMock,
  listarPostulacionesDeOfertaMock,
} from './mocks'

export async function crearPostulacion(ofertaId) {
  if (usarMock.postulaciones) {
    return crearPostulacionMock(ofertaId)
  }

  return peticion(`/ofertas/${ofertaId}/postulaciones`, { metodo: 'POST' })
}

export async function listarMisPostulaciones() {
  if (usarMock.postulaciones) {
    return listarMisPostulacionesMock()
  }

  return peticion('/postulaciones/mias')
}

export async function listarPostulacionesDeOferta(ofertaId) {
  if (usarMock.postulaciones) {
    return listarPostulacionesDeOfertaMock(ofertaId)
  }

  return peticion(`/ofertas/${ofertaId}/postulaciones`)
}

export async function cambiarEstadoPostulacion(id, estado) {
  if (usarMock.postulaciones) {
    return cambiarEstadoPostulacionMock(id, estado)
  }

  return peticion(`/postulaciones/${id}/estado`, {
    metodo: 'PATCH',
    cuerpo: { estado },
  })
}
