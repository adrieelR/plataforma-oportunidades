const { z } = require('zod');

const enviarMensajeSchema = z.object({
  ofertaId: z.coerce
    .number({ invalid_type_error: 'ofertaId debe ser un número válido' })
    .int('ofertaId debe ser un número entero')
    .positive('ofertaId debe ser mayor a 0'),
  destinatarioId: z.coerce
    .number({ invalid_type_error: 'destinatarioId debe ser un número válido' })
    .int('destinatarioId debe ser un número entero')
    .positive('destinatarioId debe ser mayor a 0'),
  contenido: z
    .string({ required_error: 'El contenido del mensaje es obligatorio' })
    .trim()
    .min(1, 'El mensaje no puede estar vacío')
    .max(2000, 'El mensaje no puede superar los 2000 caracteres'),
});

module.exports = { enviarMensajeSchema };