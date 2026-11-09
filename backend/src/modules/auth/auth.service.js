const bcrypt = require('bcryptjs');
const prisma = require('../../db/prisma');
const jwt = require('jsonwebtoken');
const { tr } = require('zod/v4/locales');

const RONDAS_BCRYPT = 12;
// hash de relleno para que el tiempo de respuesta sea parecido exista o no el correo
const HASH_FALSO = bcrypt.hashSync('relleno-no-es-una-contrasena', RONDAS_BCRYPT);

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
const iniciarSesion = async ({correo, contrasena}) =>{
  const usuario = await prisma.usuario.findUnique({where: {correo} });

  const hashAcomparar = usuario ? usuario.contrasenaHash : HASH_FALSO;
  const coincide = await bcrypt.compare(contrasena, hashAcomparar);

  // mismo mensaje si falla el correo o la contraseña (OWASP A07)
  if (!usuario || !coincide ){
    throw crearError('Correo o contraseña incorrectos ', 401);
  }
  if (usuario.estadoCuenta === 'SUSPENDIDA'){
    throw crearError('La cuenta está suspendida', 403);

  }
  
  const token = jwt.sign(
    {id: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET,
    {expiresIn: '8h'}
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
      estadoCuenta: usuario.estadoCuenta,

    },
  };
};

const obtenerPerfil = async (usuarioId) => {
  const usuario = await prisma.usuario.findUnique({
    where: {id: usuarioId},
    select: {
      id:true,
      correo:true,
      rol:true,
      estadoCuenta:true,
      estudiante: {
        select: {
          nombres: true,
          apellidos: true,
          carrera: true,
          institucion: {select: {nombre:true }},
        },
      },
      empresa: {
        select: {
          razonSocial:true,
          rut:true,
          rubro:true,
          descripcion:true,
          estadoAprobacion:true,
        },
      },
      administrador: {select: { nombre:true }},
    },
  });

  if (!usuario) {
    throw crearError('Usuario no encontrado', 400);
  }

  const {estudiante, empresa, administrador, ...datosUsuario} = usuario;
  
  return {usuario: datosUsuario, perfil: estudiante || empresa || administrador};
};

const registrarEmpresa = async ({ razonSocial, rut, rubro, descripcion, correo, contrasena }) => {
  const usuarioExistente = await prisma.usuario.findUnique({ where: { correo } });

  if (usuarioExistente) {
    throw crearError('Ya existe una cuenta con ese correo', 409);
  }

  const empresaExistente = await prisma.empresa.findUnique({ where: { rut } });

  if (empresaExistente) {
    throw crearError('Ya existe una empresa registrada con ese RUT', 409);
  }

  const contrasenaHash = await bcrypt.hash(contrasena, RONDAS_BCRYPT);

  // La cuenta queda ACTIVA, pero la empresa queda PENDIENTE de aprobación (RF-03)
  const usuario = await prisma.usuario.create({
    data: {
      correo,
      contrasenaHash,
      rol: 'EMPRESA',
      estadoCuenta: 'ACTIVA',
      empresa: {
        create: { razonSocial, rut, rubro, descripcion },
      },
    },
    select: { id: true, correo: true, rol: true, estadoCuenta: true },
  });

  return usuario;
};
module.exports = {registrarEstudiante, registrarEmpresa, iniciarSesion, obtenerPerfil};

