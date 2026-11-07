const authService = require('./auth.service');

const registroEstudiante = async (req,res, next)=>{
    try{
        const usuario = await authService.registrarEstudiante(req.body);
        res.status(201).json({mensaje: 'Registro exitoso', usuario});
    } catch (error) {
        next(error);
    }
};

module.exports = {registroEstudiante};