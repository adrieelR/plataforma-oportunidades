import { peticion } from './cliente'
import { usarMock } from './config'
import { decidirEmpresaMock, listarEmpresasMock } from './mocks'

export async function listarEmpresas({ estado = 'PENDIENTE' } = {}) {
  if (usarMock.admin) {
    return listarEmpresasMock({ estado })
  }

  return peticion('/admin/empresas', { params: { estado } })
}

export async function decidirEmpresa(id, decision) {
  if (usarMock.admin) {
    return decidirEmpresaMock(id, decision)
  }

  return peticion(`/admin/empresas/${id}/aprobacion`, {
    metodo: 'PATCH',
    cuerpo: { decision },
  })
}

export async function listarOfertasAdmin({ estado } = {}) {
  return peticion('/admin/ofertas', { params: { estado } })
}

export async function moderarOferta(id, { decision, motivo }) {
  return peticion(`/admin/ofertas/${id}/moderacion`, {
    metodo: 'PATCH',
    cuerpo: { decision, motivo },
  })
}

export async function listarUsuariosAdmin({ rol, estadoCuenta } = {}) {
  return peticion('/admin/usuarios', {
    params: { rol, estadoCuenta },
  })
}

export async function suspenderCuenta(id, motivo) {
  return peticion(`/admin/usuarios/${id}/suspension`, {
    metodo: 'PATCH',
    cuerpo: { motivo },
  })
}
