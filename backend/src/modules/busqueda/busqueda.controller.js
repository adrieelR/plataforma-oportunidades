const busquedaService = require('./busqueda.service');
const { busquedaSchema } = require('./busqueda.schema');

const buscar = async (req, res, next) => {
  try {
    // validar() solo revisa el body, así que la query se valida aquí
    const resultado = busquedaSchema.safeParse(req.query);

    if (!resultado.success) {
      return res.status(400).json({
        mensaje: 'Datos invalidos',
        errores: resultado.error.issues.map((e) => ({
          campo: e.path.join('.'),
          mensaje: e.message,
        })),
      });
    }

    const datos = await busquedaService.buscarOfertas(resultado.data);
    res.status(200).json(datos);
  } catch (error) {
    next(error);
  }
};

module.exports = { buscar };