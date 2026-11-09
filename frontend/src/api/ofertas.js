import { peticion } from './cliente'
import { usarMock } from './config'
import {
  cerrarOfertaMock,
  crearOfertaMock,
  editarOfertaMock,
  eliminarOfertaMock,
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
  if (usarMock.ofertasEmpresa) {
    return crearOfertaMock(datos)
  }

  return peticion('/ofertas', { metodo: 'POST', cuerpo: datos })
}

export async function listarMisOfertas() {
  if (usarMock.ofertasEmpresa) {
    return listarOfertasEmpresaMock()
  }

  const respuesta = await peticion('/ofertas/mias')

  // El backend entrega el conteo en _count; las pantallas usan totalPostulaciones.
  return {
    ofertas: respuesta.ofertas.map(({ _count, ...oferta }) => ({
      ...oferta,
      totalPostulaciones: _count?.postulaciones ?? 0,
    })),
  }
}

export async function editarOferta(id, datos) {
  if (usarMock.ofertasEmpresa) {
    return editarOfertaMock(id, datos)
  }

  return peticion(`/ofertas/${id}`, { metodo: 'PATCH', cuerpo: datos })
}

export async function eliminarOferta(id) {
  if (usarMock.ofertasEmpresa) {
    return eliminarOfertaMock(id)
  }

  return peticion(`/ofertas/${id}`, { metodo: 'DELETE' })
}

export async function cerrarOferta(id) {
  if (usarMock.ofertasEmpresa) {
    return cerrarOfertaMock(id)
  }

  return peticion(`/ofertas/${id}/estado`, {
    metodo: 'PATCH',
    cuerpo: { estado: 'CERRADA' },
  })
}
