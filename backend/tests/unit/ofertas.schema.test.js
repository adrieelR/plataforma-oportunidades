const { crearOfertaSchema, editarOfertaSchema, estadoOfertaSchema } = require('../../src/modules/ofertas/ofertas.schema');

const enUnMes = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

const datosValidos = {
  titulo: 'Práctica de desarrollo web',
  descripcion: 'Apoyo al equipo de desarrollo en proyectos web con Node.js.',
  tipo: 'PRACTICA',
  modalidad: 'HIBRIDA',
  area: 'Tecnología',
  ubicacion: 'Santiago',
  cupos: 2,
  fechaLimite: enUnMes(),
};

describe('crearOfertaSchema', () => {
  test('acepta datos válidos', () => {
    const resultado = crearOfertaSchema.safeParse(datosValidos);

    expect(resultado.success).toBe(true);
    expect(resultado.data.fechaLimite).toBeInstanceOf(Date);
  });

  test('rechaza un tipo inexistente', () => {
    expect(crearOfertaSchema.safeParse({ ...datosValidos, tipo: 'PASANTIA' }).success).toBe(false);
  });

  test('rechaza un título vacío', () => {
    expect(crearOfertaSchema.safeParse({ ...datosValidos, titulo: '   ' }).success).toBe(false);
  });

  test('rechaza una fecha límite pasada', () => {
    const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    expect(crearOfertaSchema.safeParse({ ...datosValidos, fechaLimite: ayer }).success).toBe(false);
  });

  test('rechaza una fecha límite que no es fecha', () => {
    expect(crearOfertaSchema.safeParse({ ...datosValidos, fechaLimite: 'mañana' }).success).toBe(false);
  });

  test('rechaza cupos que no son enteros positivos', () => {
    expect(crearOfertaSchema.safeParse({ ...datosValidos, cupos: 0 }).success).toBe(false);
    expect(crearOfertaSchema.safeParse({ ...datosValidos, cupos: 1.5 }).success).toBe(false);
  });

  test('descarta campos que el cliente no debe controlar', () => {
    const resultado = crearOfertaSchema.safeParse({ ...datosValidos, estado: 'OCULTA', empresaId: 99 });

    expect(resultado.success).toBe(true);
    expect(resultado.data.estado).toBeUndefined();
    expect(resultado.data.empresaId).toBeUndefined();
  });
});

describe('editarOfertaSchema', () => {
  test('acepta un solo campo', () => {
    expect(editarOfertaSchema.safeParse({ titulo: 'Nuevo título válido' }).success).toBe(true);
  });

  test('rechaza un cuerpo vacío', () => {
    expect(editarOfertaSchema.safeParse({}).success).toBe(false);
  });
});

describe('estadoOfertaSchema', () => {
  test('solo acepta PUBLICADA o CERRADA', () => {
    expect(estadoOfertaSchema.safeParse({ estado: 'CERRADA' }).success).toBe(true);
    expect(estadoOfertaSchema.safeParse({ estado: 'OCULTA' }).success).toBe(false);
  });
});