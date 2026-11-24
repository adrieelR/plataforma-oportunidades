const reportesService = require('./reportes.service');

const crearReporte = async (req, res, next) => {
  try {
    const reporte = await reportesService.crearReporte({
      ofertaId: req.body.ofertaId,
      usuarioId: req.usuario.id,
      motivo: req.body.motivo,
    });
    res.status(201).json({ reporte });
  } catch (error) {
    next(error);
  }
};

const listarReportes = async (req, res, next) => {
  try {
    const reportes = await reportesService.listarReportes(req.query.estado);
    res.status(200).json({ reportes });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearReporte,
  listarReportes,
};