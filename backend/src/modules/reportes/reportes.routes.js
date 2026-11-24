const { Router } = require('express');
const { autenticar } = require('../../middlewares/auth');
const { requerirRol } = require('../../middlewares/roles');
const validar = require('../../middlewares/validate');
const { crearReporteSchema } = require('./reportes.schema');
const reportesController = require('./reportes.controller');

const router = Router();

router.use(autenticar);

// CU-13: Estudiante o Empresa reporta una publicación
router.post(
  '/',
  requerirRol('ESTUDIANTE', 'EMPRESA'),
  validar(crearReporteSchema),
  reportesController.crearReporte
);

// Lista reportes (por defecto PENDIENTE) para revisión del administrador
router.get(
  '/',
  requerirRol('ADMINISTRADOR'),
  reportesController.listarReportes
);

module.exports = router;