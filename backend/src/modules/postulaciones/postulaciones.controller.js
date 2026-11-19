const postulacionesService = require('./postulaciones.service');

const crear = async (req, res, next) => {
  try {
    const postulacion = await postulacionesService.postular(req.usuario.id, req.body.ofertaId);
    res.status(201).json({ mensaje: 'Postulación enviada', postulacion });
  } catch (error) {
    next(error);
  }
};
const cambiarEstado = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ mensaje: 'El identificador no es válido' });
    }

    const postulacion = await postulacionesService.cambiarEstado(req.usuario.id, id, req.body.estado);
    res.status(200).json({ postulacion });
  } catch (error) {
    next(error);
  }
};

module.exports = { crear, cambiarEstado };