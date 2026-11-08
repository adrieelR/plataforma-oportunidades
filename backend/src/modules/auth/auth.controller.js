const authService = require('./auth.service');

const registroEstudiante = async (req,res, next)=>{
    try{
        const usuario = await authService.registrarEstudiante(req.body);
        res.status(201).json({mensaje: 'Registro exitoso', usuario});
    } catch (error) {
        next(error);
    }
};

const login = async (req,res, next) =>{
    try{
        const resultado = await authService.iniciarSesion(req.body);
        res.status(200).json(resultado);
    }catch (error) {
        next(error);
    }
};

module.exports = {registroEstudiante, login};