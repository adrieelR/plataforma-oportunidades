const { Router } = require('express');
const { autenticar } = require('../../middlewares/auth');
const { requerirRol } = require('../../middlewares/roles');
const validar = require('../../middlewares/validate');
const { crearOfertaSchema, editarOfertaSchema, estadoOfertaSchema } = require('./ofertas.schema');
const ofertasController = require('./ofertas.controller');

const router = Router();

// OWASP A01: la gestión de ofertas exige sesión y rol EMPRESA
router.use(autenticar, requerirRol('EMPRESA'));

router.post('/', validar(crearOfertaSchema), ofertasController.crear);
router.get('/mias', ofertasController.listarMias);
router.patch('/:id', validar(editarOfertaSchema), ofertasController.editar);
router.patch('/:id/estado', validar(estadoOfertaSchema), ofertasController.cambiarEstado);
router.delete('/:id', ofertasController.eliminar);

module.exports = router;