const postulacionesService = require('./postulaciones.service');

const crear = async (req, res, next) => {
  try {
    const postulacion = await postulacionesService.postular(req.usuario.id, req.body.ofertaId);
    res.status(201).json({ mensaje: 'Postulación enviada', postulacion });
  } catch (error) {
    next(error);
  }
};

module.exports = { crear };