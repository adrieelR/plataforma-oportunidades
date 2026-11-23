const {
  crearPostulacionSchema,
  cambiarEstadoPostulacionSchema,
} = require('../../src/modules/postulaciones/postulaciones.schema');

describe('crearPostulacionSchema', () => {
  test('acepta un identificador de oferta válido', () => {
    expect(crearPostulacionSchema.safeParse({ ofertaId: 5 }).success).toBe(true);
  });

  test('rechaza un cuerpo sin ofertaId', () => {
    expect(crearPostulacionSchema.safeParse({}).success).toBe(false);
  });

  test('rechaza identificadores que no son enteros positivos', () => {
    expect(crearPostulacionSchema.safeParse({ ofertaId: 'abc' }).success).toBe(false);
    expect(crearPostulacionSchema.safeParse({ ofertaId: 0 }).success).toBe(false);
    expect(crearPostulacionSchema.safeParse({ ofertaId: 1.5 }).success).toBe(false);
  });
});

describe('cambiarEstadoPostulacionSchema', () => {
  test('acepta los tres estados que puede asignar la empresa', () => {
    ['PRESELECCIONADA', 'ACEPTADA', 'RECHAZADA'].forEach((estado) => {
      expect(cambiarEstadoPostulacionSchema.safeParse({ estado }).success).toBe(true);
    });
  });

  test('rechaza estados que la empresa no puede asignar', () => {
    ['ENVIADA', 'CANCELADA', 'OTRO'].forEach((estado) => {
      expect(cambiarEstadoPostulacionSchema.safeParse({ estado }).success).toBe(false);
    });
  });

  test('rechaza un cuerpo sin estado', () => {
    expect(cambiarEstadoPostulacionSchema.safeParse({}).success).toBe(false);
  });
});