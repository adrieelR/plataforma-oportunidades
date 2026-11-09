export const INICIO_POR_ROL = {
  ESTUDIANTE: '/ofertas',
  EMPRESA: '/empresa/ofertas',
  ADMINISTRADOR: '/admin/empresas',
}

export const ETIQUETA_ROL = {
  ESTUDIANTE: 'Estudiante',
  EMPRESA: 'Empresa',
  ADMINISTRADOR: 'Administrador',
}

export function inicioSegunRol(rol) {
  return INICIO_POR_ROL[rol] || '/login'
}
