const { Router } = require('express');
const validar = require('../../middlewares/validate');
const { registroEstudianteSchema, loginSchema } = require('./auth.schema');
const authController = require('./auth.controller');
const { limitadorLogin } = require('../../middlewares/rateLimit');
const { autenticar } = require('../../middlewares/auth');
const router = Router();

router.post(
    '/registro',
    validar(registroEstudianteSchema),
    authController.registroEstudiante
);

router.post(
    '/login',
    limitadorLogin,
    validar(loginSchema),
    authController.login
);

router.get(
    '/perfil',
    autenticar,
    authController.perfil
);
module.exports = router;