import { peticion } from './cliente'
import { usarMock } from './config'
import {
  cerrarOfertaMock,
  crearOfertaMock,
  listarOfertasEmpresaMock,
  listarOfertasMock,
  obtenerOfertaMock,
} from './mocks'

export async function listarOfertas({ q, tipo } = {}) {
  if (usarMock.ofertas) {
    return listarOfertasMock({ q, tipo })
  }

  return peticion('/ofertas', { params: { q, tipo } })
}

export async function obtenerOferta(id) {
  if (usarMock.ofertas) {
    return obtenerOfertaMock(id)
  }

  return peticion(`/ofertas/${id}`)
}

export async function crearOferta(datos) {
  if (usarMock.ofertas) {
    return crearOfertaMock(datos)
  }

  return peticion('/ofertas', { metodo: 'POST', cuerpo: datos })
}

export async function listarMisOfertas() {
  if (usarMock.ofertas) {
    return listarOfertasEmpresaMock()
  }

  return peticion('/ofertas/mias')
}

export async function cerrarOferta(id) {
  if (usarMock.ofertas) {
    return cerrarOfertaMock(id)
  }

  return peticion(`/ofertas/${id}/cerrar`, { metodo: 'PATCH' })
}
