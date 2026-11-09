const { z } = require('zod');

const TIPOS = ['PRACTICA', 'EMPLEO', 'CAPACITACION', 'SERVICIO'];
const MODALIDADES = ['PRESENCIAL', 'REMOTA', 'HIBRIDA'];

// La fecha llega como texto (por ejemplo "2026-12-31" o ISO) y debe ser futura
const fechaLimiteSchema = z
  .string({ error: 'La fecha límite es obligatoria' })
  .refine((valor) => !Number.isNaN(Date.parse(valor)), 'La fecha límite no es válida')
  .transform((valor) => new Date(valor))
  .refine((fecha) => fecha > new Date(), 'La fecha límite debe ser posterior a hoy');

const crearOfertaSchema = z.object({
  titulo: z.string({ error: 'El título es obligatorio' }).trim().min(5, 'El título debe tener al menos 5 caracteres').max(120, 'El título es demasiado largo'),
  descripcion: z.string({ error: 'La descripción es obligatoria' }).trim().min(20, 'La descripción debe tener al menos 20 caracteres').max(2000, 'La descripción es demasiado larga'),
  tipo: z.enum(TIPOS, { error: `El tipo debe ser uno de: ${TIPOS.join(', ')}` }),
  modalidad: z.enum(MODALIDADES, { error: `La modalidad debe ser una de: ${MODALIDADES.join(', ')}` }),
  area: z.string({ error: 'El área es obligatoria' }).trim().min(2, 'El área es obligatoria').max(100),
  ubicacion: z.string({ error: 'La ubicación es obligatoria' }).trim().min(2, 'La ubicación es obligatoria').max(120),
  cupos: z.number({ error: 'Los cupos deben ser un número' }).int('Los cupos deben ser un número entero').min(1, 'Los cupos deben ser al menos 1').max(1000).optional(),
  fechaLimite: fechaLimiteSchema,
});

// Al editar, todos los campos son opcionales, pero debe venir al menos uno.
// Los campos que no están en el esquema (estado, empresaId...) se descartan.
const editarOfertaSchema = crearOfertaSchema
  .partial()
  .refine((datos) => Object.keys(datos).length > 0, 'Debes enviar al menos un campo para editar');

const estadoOfertaSchema = z.object({
  estado: z.enum(['PUBLICADA', 'CERRADA'], { error: 'El estado debe ser PUBLICADA o CERRADA' }),
});

module.exports = { crearOfertaSchema, editarOfertaSchema, estadoOfertaSchema, TIPOS, MODALIDADES };