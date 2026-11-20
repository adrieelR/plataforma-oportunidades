const { z } = require('zod');

// Estados que la empresa puede asignar (ENVIADA es el inicial y CANCELADA la decide el estudiante)
const ESTADOS_GESTIONABLES = ['PRESELECCIONADA', 'ACEPTADA', 'RECHAZADA'];

const crearPostulacionSchema = z.object({
  ofertaId: z
    .number({ error: 'El identificador de la oferta es obligatorio y debe ser un número' })
    .int('El identificador de la oferta debe ser un número entero')
    .min(1, 'El identificador de la oferta no es válido'),
});

const cambiarEstadoPostulacionSchema = z.object({
  estado: z.enum(ESTADOS_GESTIONABLES, {
    error: `El estado debe ser uno de: ${ESTADOS_GESTIONABLES.join(', ')}`,
  }),
});

module.exports = { crearPostulacionSchema, cambiarEstadoPostulacionSchema, ESTADOS_GESTIONABLES };