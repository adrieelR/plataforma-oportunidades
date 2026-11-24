const { z } = require('zod');

const motivoSchema = z
  .string({ error: 'El motivo es obligatorio' })
  .trim()
  .min(10, 'El motivo debe tener al menos 10 caracteres')
  .max(500, 'El motivo es demasiado largo');

// MANTENER queda para la historia de reportes; aquí solo se oculta o elimina
const moderarOfertaSchema = z.object({
  decision: z.enum(['OCULTAR', 'ELIMINAR'], { error: 'La decisión debe ser OCULTAR o ELIMINAR' }),
  motivo: motivoSchema,
});

const suspenderCuentaSchema = z.object({
  motivo: motivoSchema,
});

module.exports = { moderarOfertaSchema, suspenderCuentaSchema };