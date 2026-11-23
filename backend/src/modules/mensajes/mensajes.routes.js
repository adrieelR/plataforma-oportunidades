const { Router } = require('express');
const { autenticar } = require('../../middlewares/auth');
const { requerirRol } = require('../../middlewares/roles');
const validar = require('../../middlewares/validate');
const { enviarMensajeSchema } = require('./mensajes.schema');
const mensajesController = require('./mensajes.controller');

const router = Router();

router.use(autenticar, requerirRol('ESTUDIANTE', 'EMPRESA'));

router.post('/', validar(enviarMensajeSchema), mensajesController.enviarMensaje);
router.get('/', mensajesController.listarMensajes);
router.patch('/:id/leer', mensajesController.marcarComoLeido);

module.exports = router;