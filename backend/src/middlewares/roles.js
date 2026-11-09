
// OWASP A01: control de acceso, cada ruta declara que roles pueden usarla
const requerirRol = (...rolesPermitidos) => (req,res,next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)){
        return res.status(403).json({mensaje: 'No tienes permiso para realizar esta acción'});
    }
    next();
};

module.exports = { requerirRol };