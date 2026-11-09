const { z } = require('zod');
const { TIPOS, MODALIDADES } = require('../ofertas/ofertas.schema');

// Parámetros de la URL: /api/busqueda/ofertas?tipo=PRACTICA&area=tecnolog&ubicacion=santiago
const busquedaSchema = z.object({
  tipo: z.enum(TIPOS, { error: `El tipo debe ser uno de: ${TIPOS.join(', ')}` }).optional(),
  modalidad: z.enum(MODALIDADES, { error: `La modalidad debe ser una de: ${MODALIDADES.join(', ')}` }).optional(),
  area: z.string().trim().min(1, 'El área no puede estar vacía').max(100).optional(),
  ubicacion: z.string().trim().min(1, 'La ubicación no puede estar vacía').max(120).optional(),
  q: z.string().trim().min(1, 'El texto de búsqueda no puede estar vacío').max(100).optional(),
  pagina: z.coerce.number({ error: 'La página debe ser un número' }).int().min(1, 'La página debe ser al menos 1').default(1),
  limite: z.coerce.number({ error: 'El límite debe ser un número' }).int().min(1, 'El límite debe ser al menos 1').max(50, 'El límite máximo es 50').default(10),
});

module.exports = { busquedaSchema };