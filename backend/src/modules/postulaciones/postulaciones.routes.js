const { Router } = require('express');
const { autenticar } = require('../../middlewares/auth');
const { requerirRol } = require('../../middlewares/roles');
const validar = require('../../middlewares/validate');
const { crearPostulacionSchema, cambiarEstadoPostulacionSchema } = require('./postulaciones.schema');
const postulacionesController = require('./postulaciones.controller');

const router = Router();

// El rol se exige ruta por ruta porque cada una la usa un rol distinto
router.post('/', autenticar, requerirRol('ESTUDIANTE'), validar(crearPostulacionSchema), postulacionesController.crear);

router.patch(
  '/:id/estado',
  autenticar,
  requerirRol('EMPRESA'),
  validar(cambiarEstadoPostulacionSchema),
  postulacionesController.cambiarEstado,
);

module.exports = router;