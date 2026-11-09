const { z } = require('zod');

// ---- Reglas compartidas ----
const correoSchema = z.string().trim().toLowerCase().email('El correo no es válido');

const contrasenaNuevaSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(72, 'La contraseña es demasiado larga')
  .regex(/[A-Za-z]/, 'La contraseña debe incluir una letra')
  .regex(/[0-9]/, 'La contraseña debe incluir un número');

// ---- RUT chileno: se valida el dígito verificador (módulo 11) ----
const normalizarRut = (rut) => rut.replace(/[.\s]/g, '').toUpperCase();

const rutEsValido = (rut) => {
  const limpio = normalizarRut(rut);
  if (!/^\d{7,8}-[\dK]$/.test(limpio)) return false;

  const [cuerpo, dv] = limpio.split('-');
  let suma = 0;
  let factor = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const resto = 11 - (suma % 11);
  const esperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);

  return dv === esperado;
};

// ---- Esquemas ----
const registroEstudianteSchema = z.object({
  nombres: z.string().trim().min(2, 'Los nombres son obligatorios').max(80),
  apellidos: z.string().trim().min(2, 'Los apellidos son obligatorios').max(80),
  carrera: z.string().trim().min(2, 'La carrera es obligatoria').max(100),
  correo: correoSchema,
  contrasena: contrasenaNuevaSchema,
});

const registroEmpresaSchema = z.object({
  razonSocial: z.string().trim().min(2, 'La razón social es obligatoria').max(120),
  rut: z
    .string()
    .trim()
    .refine(rutEsValido, 'El RUT no es válido')
    .transform(normalizarRut),
  rubro: z.string().trim().min(2, 'El rubro es obligatorio').max(100),
  descripcion: z.string().trim().max(500, 'La descripción es demasiado larga').optional(),
  correo: correoSchema,
  contrasena: contrasenaNuevaSchema,
});

const loginSchema = z.object({
  correo: correoSchema,
  contrasena: z.string().min(1, 'La contraseña es obligatoria'),
});

module.exports = { registroEstudianteSchema, registroEmpresaSchema, loginSchema };