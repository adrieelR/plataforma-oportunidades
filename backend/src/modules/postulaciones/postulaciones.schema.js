const { z } = require('zod');

const crearPostulacionSchema = z.object({
  ofertaId: z
    .number({ error: 'El identificador de la oferta es obligatorio y debe ser un número' })
    .int('El identificador de la oferta debe ser un número entero')
    .min(1, 'El identificador de la oferta no es válido'),
});

module.exports = { crearPostulacionSchema };