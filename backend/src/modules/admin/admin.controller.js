const adminService = require('./admin.service');

const listarEmpresas = async (req, res, next) => {
  try {
    const empresas = await adminService.listarEmpresas(req.query.estado);
    res.status(200).json({ empresas });
  } catch (error) {
    next(error);
  }
};

const resolverAprobacion = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ mensaje: 'El identificador no es válido' });
    }

    const empresa = await adminService.resolverAprobacion(id, req.body.decision);
    res.status(200).json({ empresa });
  } catch (error) {
    next(error);
  }
};

module.exports = { listarEmpresas, resolverAprobacion };