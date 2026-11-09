const { Router } = require('express');
const { autenticar } = require('../../middlewares/auth');
const { requerirRol } = require('../../middlewares/roles');
const validar = require('../../middlewares/validate');
const { decisionSchema } = require('./admin.schema');
const adminController = require('./admin.controller');

const router = Router();

// OWASP A01: todas las rutas de administración exigen sesión y rol ADMINISTRADOR
router.use(autenticar, requerirRol('ADMINISTRADOR'));

router.get('/empresas', adminController.listarEmpresas);

router.patch(
  '/empresas/:id/aprobacion',
  validar(decisionSchema),
  adminController.resolverAprobacion
);

module.exports = router;