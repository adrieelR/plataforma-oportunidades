import { peticion } from './cliente'

export async function listarMensajes({ ofertaId } = {}) {
  return peticion('/mensajes', { params: { ofertaId } })
}

export async function enviarMensaje({ ofertaId, destinatarioId, contenido }) {
  return peticion('/mensajes', {
    metodo: 'POST',
    cuerpo: { ofertaId, destinatarioId, contenido },
  })
}

export async function marcarMensajeLeido(id) {
  return peticion(`/mensajes/${id}/leer`, { metodo: 'PATCH' })
}
