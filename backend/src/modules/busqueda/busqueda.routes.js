const { Router } = require('express');
const { autenticar } = require('../../middlewares/auth');
const { requerirRol } = require('../../middlewares/roles');
const busquedaController = require('./busqueda.controller');

const router = Router();

// La plataforma es exclusiva para estudiantes: solo ellos buscan ofertas
router.use(autenticar, requerirRol('ESTUDIANTE'));

router.get('/ofertas', busquedaController.buscar);

module.exports = router;