const manejadorErrores = (err, req, res, next) => {
    const estado = err.estado || err.status || 500;

    // los errores inesperados se registraran en el servidor, pero no se muestran al cliente
    if (estado >= 500) {
        console.error(err);
    }
    res.status(estado).json({
        mensaje: estado >= 500 ? 'Error interno del servidor': err.message,
    });
};

module.exports = manejadorErrores;