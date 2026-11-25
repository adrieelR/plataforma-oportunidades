import { peticion } from './cliente'

// RF-13 / CU-13: endpoints reales del backend. Los flags de config.js
// permanecen en false para usar la API real.
export async function crearReporte({ ofertaId, motivo }) {
  return peticion('/reportes', {
    metodo: 'POST',
    cuerpo: { ofertaId: Number(ofertaId), motivo },
  })
}

export async function listarReportes({ estado = 'PENDIENTE' } = {}) {
  return peticion('/reportes', { params: { estado } })
}
