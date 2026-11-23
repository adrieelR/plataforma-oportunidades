const moderacionService = require('./moderacion.service');

const leerId = (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ mensaje: 'El identificador no es válido' });
    return null;
  }
  return id;
};

const listarOfertas = async (req, res, next) => {
  try {
    const ofertas = await moderacionService.listarOfertas(req.query.estado);
    res.status(200).json({ ofertas });
  } catch (error) {
    next(error);
  }
};

const moderarOferta = async (req, res, next) => {
  try {
    const id = leerId(req, res);
    if (id === null) return;

    const resultado = await moderacionService.moderarOferta(req.usuario.id, id, req.body);
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};

const listarUsuarios = async (req, res, next) => {
  try {
    const usuarios = await moderacionService.listarUsuarios(req.query);
    res.status(200).json({ usuarios });
  } catch (error) {
    next(error);
  }
};

const suspenderCuenta = async (req, res, next) => {
  try {
    const id = leerId(req, res);
    if (id === null) return;

    const resultado = await moderacionService.suspenderCuenta(req.usuario.id, id, req.body);
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};

module.exports = { listarOfertas, moderarOferta, listarUsuarios, suspenderCuenta };