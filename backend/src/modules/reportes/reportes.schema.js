const { z } = require('zod');

const crearReporteSchema = z.object({
  ofertaId: z.coerce
    .number({ invalid_type_error: 'ofertaId debe ser un número válido' })
    .int('ofertaId debe ser un número entero')
    .positive('ofertaId debe ser mayor a 0'),
  motivo: z
    .string({ required_error: 'El motivo del reporte es obligatorio' })
    .trim()
    .min(5, 'El motivo debe tener al menos 5 caracteres')
    .max(500, 'El motivo no puede superar los 500 caracteres'),
});

module.exports = { crearReporteSchema };