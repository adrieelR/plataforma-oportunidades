export function agruparConversaciones(mensajes, usuarioId) {
  const conversaciones = new Map()

  for (const mensaje of mensajes) {
    const esRemitente = mensaje.remitenteId === usuarioId
    const contacto = esRemitente ? mensaje.destinatario : mensaje.remitente

    if (!contacto) {
      continue
    }

    const clave = `${mensaje.ofertaId}:${contacto.id}`
    const noLeido = mensaje.destinatarioId === usuarioId && !mensaje.leido
    const actual = conversaciones.get(clave)

    if (actual) {
      actual.ultimoMensaje = mensaje
      if (noLeido) {
        actual.noLeidos += 1
      }
    } else {
      conversaciones.set(clave, {
        clave,
        ofertaId: mensaje.ofertaId,
        contacto,
        ultimoMensaje: mensaje,
        noLeidos: noLeido ? 1 : 0,
      })
    }
  }

  return [...conversaciones.values()].sort(
    (a, b) =>
      new Date(b.ultimoMensaje.fechaEnvio) -
      new Date(a.ultimoMensaje.fechaEnvio),
  )
}

export function filtrarConversacion(mensajes, usuarioId, contactoId) {
  return mensajes.filter(
    (mensaje) =>
      (mensaje.remitenteId === usuarioId &&
        mensaje.destinatarioId === contactoId) ||
      (mensaje.remitenteId === contactoId &&
        mensaje.destinatarioId === usuarioId),
  )
}
