const { Router } = require('express');
const { autenticar } = require('../../middlewares/auth');
const { requerirRol } = require('../../middlewares/roles');
const validar = require('../../middlewares/validate');
const { decisionSchema } = require('./admin.schema');
const adminController = require('./admin.controller');
const moderacionController = require('../moderacion/moderacion.controller');
const { moderarOfertaSchema, suspenderCuentaSchema } = require('../moderacion/moderacion.schema');

const router = Router();

// OWASP A01: todas las rutas de administración exigen sesión y rol ADMINISTRADOR
router.use(autenticar, requerirRol('ADMINISTRADOR'));

router.get('/empresas', adminController.listarEmpresas);

router.patch(
  '/empresas/:id/aprobacion',
  validar(decisionSchema),
  adminController.resolverAprobacion
);
// HU-09: moderación de publicaciones y de cuentas
router.get('/ofertas', moderacionController.listarOfertas);

router.patch('/ofertas/:id/moderacion', validar(moderarOfertaSchema), moderacionController.moderarOferta);

router.get('/usuarios', moderacionController.listarUsuarios);

router.patch('/usuarios/:id/suspension', validar(suspenderCuentaSchema), moderacionController.suspenderCuenta);

module.exports = router;