const jwt = require('jsonwebtoken');

//OWASP A01 Y A07: solo deja psar peticiones con un token válido

const autenticar = (req,res,next) =>{
    const cabecera = req.headers.authorization || '';
    const [tipo, token] = cabecera.split(' ');

    if (tipo !== 'Bearer' || !token ) {
        return res.status(401).json({mensaje: 'debes iniciar sesión'});
    }
    
    try {
        const datos = jwt.verify(token, process.env.JWT_SECRET, {algorithms: ['HS256']});
        req.usuario = {id: datos.id, rol: datos.rol };
        next();
    } catch (error) {
        return res.status(401).json({mensaje: 'Sesión inválida o expirada'});
    }
};

module.exports = {autenticar};