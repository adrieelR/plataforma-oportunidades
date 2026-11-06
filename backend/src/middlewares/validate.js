const validar = (schema) => (req, res, next) => {
    const resultado = schema.safeParse(req.body);

    if(!resultado.success){
        return res.status(400).json({
            mensaje: 'Datos invalidos',
            errores: resultado.error.issues.map((e) => ({
                campo: e.path.join('.'),
                mensaje: e.message
            })),
        });
    }
    req.body = resultado.data;
    next();
};
module.exports = validar;