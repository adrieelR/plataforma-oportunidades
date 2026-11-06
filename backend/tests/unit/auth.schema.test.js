const { registroEstudianteSchema } = require('../../src/modules/auth/auth.schema');

describe('registroEstudianteSchema', () => {
  const datosValidos = {
    nombres: 'Ana',
    apellidos: 'Pérez',
    carrera: 'Ingeniería en Informática',
    correo: 'ana.perez@inacapmail.cl',
    contrasena: 'Clave1234',
  };

  test('acepta datos válidos', () => {
    const resultado = registroEstudianteSchema.safeParse(datosValidos);

    expect(resultado.success).toBe(true);
  });

  test('rechaza un correo mal escrito', () => {
    const resultado = registroEstudianteSchema.safeParse({
      ...datosValidos,
      correo: 'hola',
    });

    expect(resultado.success).toBe(false);
  });
});