const { z } = require('zod');

const decisionSchema = z.object({
    decision: z
    .string()
    .refine((valor) => ['APROBAR', 'RECHAZAR'].includes(valor), 'La decisión debe ser APROBAR O RECHAZAR'),

});

module.exports = { decisionSchema };