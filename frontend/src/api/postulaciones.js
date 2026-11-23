import { peticion } from './cliente'
import { usarMock } from './config'
import {
  cambiarEstadoPostulacionMock,
  crearPostulacionMock,
  listarMisPostulacionesMock,
  listarPostulacionesDeOfertaMock,
} from './mocks'

export async function crearPostulacion(ofertaId) {
  if (usarMock.postular) {
    return crearPostulacionMock(ofertaId)
  }

  return peticion('/postulaciones', {
    metodo: 'POST',
    cuerpo: { ofertaId: Number(ofertaId) },
  })
}

export async function listarMisPostulaciones(estado) {
  if (usarMock.misPostulaciones) {
    return listarMisPostulacionesMock()
  }

  return peticion('/postulaciones/mias', {
    params: { estado },
  })
}

export async function listarPostulacionesDeOferta(ofertaId, estado) {
  if (usarMock.postulacionesDeOferta) {
    return listarPostulacionesDeOfertaMock(ofertaId)
  }

  return peticion(`/ofertas/${ofertaId}/postulaciones`, {
    params: { estado },
  })
}

export async function cambiarEstadoPostulacion(id, estado) {
  if (usarMock.cambiarEstadoPostulacion) {
    return cambiarEstadoPostulacionMock(id, estado)
  }

  return peticion(`/postulaciones/${id}/estado`, {
    metodo: 'PATCH',
    cuerpo: { estado },
  })
}
