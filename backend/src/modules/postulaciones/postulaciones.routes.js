const { Router } = require('express');
const { autenticar } = require('../../middlewares/auth');
const { requerirRol } = require('../../middlewares/roles');
const validar = require('../../middlewares/validate');
const { crearPostulacionSchema } = require('./postulaciones.schema');
const postulacionesController = require('./postulaciones.controller');

const router = Router();

// Solo los estudiantes postulan
router.use(autenticar, requerirRol('ESTUDIANTE'));

router.post('/', validar(crearPostulacionSchema), postulacionesController.crear);

module.exports = router;