const { Router } = require('express');
const validar = require('../../middlewares/validate');
const { registroEstudianteSchema, registroEmpresaSchema, loginSchema } = require('./auth.schema');
const authController = require('./auth.controller');
const { limitadorLogin } = require('../../middlewares/rateLimit');
const { autenticar } = require('../../middlewares/auth');
const { ro } = require('zod/v4/locales');


const router = Router();

router.post(
    '/registro',
    validar(registroEstudianteSchema),
    authController.registroEstudiante
);

router.post(
    '/registro-empresa',
    validar(registroEmpresaSchema),
    authController.registroEmpresa
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