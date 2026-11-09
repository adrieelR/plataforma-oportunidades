const bcrypt = require('bcryptjs');
const prisma = require('../../db/prisma');

const RONDAS_BCRYPT = 12;

const crearError = (mensaje, estado) =>{
    const error = new Error(mensaje);
    error.estado = estado;
    return error;
};

const registrarEstudiante = async ({ nombres, apellidos, carrera, correo, contrasena }) => {
  // 1. La institución se deduce del dominio del correo (RF-02)
  const dominio = correo.split('@')[1];
  const institucion = await prisma.institucionEducativa.findUnique({
    where: { dominioCorreo: dominio },
  });

  if (!institucion) {
    throw crearError('el correo no pertenece a una institución de educación superior registrada', 400);
  }
  // 2. El correo no puede estar repetido
  const existente = await prisma.usuario.findUnique({where: {correo}});

  if (existente){
    throw crearError('Ya existe una cuenta con ese correo',409);

  }

  //3. La constraseña se guarda cifrada, nunca en claro (OWASP A02. RNF-01)
  const contrasenaHash = await bcrypt.hash(contrasena, RONDAS_BCRYPT);

  // 4. se crea el usuario y su perfil de estudiante en un solo paso
  const usuario = await prisma.usuario.create({
    data: {
        correo,
        contrasenaHash,
        rol: 'ESTUDIANTE',
        estudiante: {
            create: {nombres, apellidos, carrera, institucionId: institucion.id},
        },
    },
    select: {id:true, correo:true, rol:true, estadoCuenta:true},
  });
  return usuario
};

module.exports = {registrarEstudiante};

