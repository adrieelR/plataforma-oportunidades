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
