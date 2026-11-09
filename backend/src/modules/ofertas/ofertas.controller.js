const ofertasService = require('./ofertas.service');

const leerId = (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ mensaje: 'El identificador no es válido' });
    return null;
  }
  return id;
};

const crear = async (req, res, next) => {
  try {
    const oferta = await ofertasService.crearOferta(req.usuario.id, req.body);
    res.status(201).json({ mensaje: 'Oferta publicada', oferta });
  } catch (error) {
    next(error);
  }
};

const listarMias = async (req, res, next) => {
  try {
    const ofertas = await ofertasService.listarMisOfertas(req.usuario.id, req.query.estado);
    res.status(200).json({ ofertas });
  } catch (error) {
    next(error);
  }
};

const editar = async (req, res, next) => {
  try {
    const id = leerId(req, res);
    if (id === null) return;

    const oferta = await ofertasService.editarOferta(req.usuario.id, id, req.body);
    res.status(200).json({ oferta });
  } catch (error) {
    next(error);
  }
};

const cambiarEstado = async (req, res, next) => {
  try {
    const id = leerId(req, res);
    if (id === null) return;

    const oferta = await ofertasService.cambiarEstado(req.usuario.id, id, req.body.estado);
    res.status(200).json({ oferta });
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const id = leerId(req, res);
    if (id === null) return;

    const oferta = await ofertasService.eliminarOferta(req.usuario.id, id);
    res.status(200).json({ oferta });
  } catch (error) {
    next(error);
  }
};

module.exports = { crear, listarMias, editar, cambiarEstado, eliminar };