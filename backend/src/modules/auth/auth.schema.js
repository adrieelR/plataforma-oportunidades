const { z } = require('zod');

const registroEstudianteSchema = z.object({
  nombres: z.string().trim().min(2, 'Los nombres son obligatorios').max(80),
  apellidos: z.string().trim().min(2, 'Los apellidos son obligatorios').max(80),
  carrera: z.string().trim().min(2, 'La carrera es obligatoria').max(100),
  correo: z.string().trim().toLowerCase().email('El correo no es válido'),
  contrasena: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña es demasiado larga')
    .regex(/[A-Za-z]/, 'La contraseña debe incluir una letra')
    .regex(/[0-9]/, 'La contraseña debe incluir un número'),
});

module.exports = { registroEstudianteSchema };