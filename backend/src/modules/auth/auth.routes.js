const { Router } = require('express');
const validar = require('../../middlewares/validate');
const { registroEstudianteSchema } = require('./auth.schema');
const authController = require('./auth.controller');

const router = Router();

router.post(
    '/registro',
    validar(registroEstudianteSchema),
    authController.registroEstudiante
);
module.exports = router;