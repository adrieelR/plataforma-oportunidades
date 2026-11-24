const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');

// OWASP A01 y A07: solo deja pasar peticiones con un token válido de una cuenta que no esté suspendida
const autenticar = async (req, res, next) => {
  const cabecera = req.headers.authorization || '';
  const [tipo, token] = cabecera.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ mensaje: 'debes iniciar sesión' });
  }

  let datos;
  try {
    datos = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    return res.status(401).json({ mensaje: 'Sesión inválida o expirada' });
  }

  try {
    // Un token sigue siendo válido hasta 8 horas; por eso se consulta el estado actual de la cuenta
    const usuario = await prisma.usuario.findUnique({
      where: { id: datos.id },
      select: { estadoCuenta: true },
    });

    if (!usuario) {
      return res.status(401).json({ mensaje: 'Sesión inválida o expirada' });
    }
    if (usuario.estadoCuenta === 'SUSPENDIDA') {
      return res.status(403).json({ mensaje: 'La cuenta está suspendida' });
    }

    req.usuario = { id: datos.id, rol: datos.rol };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { autenticar };