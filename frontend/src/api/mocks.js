// MOCKS SOLO PARA DESARROLLO.
// Las cuentas demo y los datos de ejemplo de este archivo son ficticios y no
// deben usarse fuera de él. Cuando el backend implemente los endpoints
// pendientes, cambiar los valores correspondientes en src/api/config.js.

import { ErrorApi, obtenerUsuarioGuardado } from './cliente'

const DOMINIOS_VALIDOS = ['inacapmail.cl']

const CUENTAS_DEMO = [
  {
    id: 1,
    correo: 'admin@plataforma.cl',
    contrasena: 'Admin1234',
    rol: 'ADMINISTRADOR',
    estadoCuenta: 'ACTIVA',
  },
  {
    id: 2,
    correo: 'estudiante.demo@inacapmail.cl',
    contrasena: 'Estudiante1234',
    rol: 'ESTUDIANTE',
    estadoCuenta: 'ACTIVA',
  },
  {
    id: 3,
    correo: 'empresa.demo@plataforma.cl',
    contrasena: 'Empresa1234',
    rol: 'EMPRESA',
    estadoCuenta: 'ACTIVA',
  },
]

const EMPRESAS = [
  {
    id: 1,
    usuarioId: 3,
    razonSocial: 'Innovación Digital SpA',
    rut: '76.543.210-8',
    rubro: 'Tecnología',
    descripcion:
      'Empresa dedicada al desarrollo de software y soluciones digitales.',
    estadoAprobacion: 'APROBADA',
    correo: 'empresa.demo@plataforma.cl',
  },
  {
    id: 2,
    usuarioId: null,
    razonSocial: 'Tecnologías del Sur SpA',
    rut: '77.123.456-7',
    rubro: 'Tecnología',
    descripcion: 'Servicios de infraestructura y soporte informático.',
    estadoAprobacion: 'PENDIENTE',
    correo: 'contacto@tecnologiasdelsur.cl',
  },
  {
    id: 3,
    usuarioId: null,
    razonSocial: 'Comercial Andes Ltda.',
    rut: '78.654.321-0',
    rubro: 'Comercio',
    descripcion: 'Distribución de productos de consumo masivo.',
    estadoAprobacion: 'PENDIENTE',
    correo: 'rrhh@comercialandes.cl',
  },
  {
    id: 4,
    usuarioId: null,
    razonSocial: 'Innova Capacita',
    rut: '79.876.543-2',
    rubro: 'Capacitación',
    descripcion: 'Programas de capacitación para estudiantes y profesionales.',
    estadoAprobacion: 'APROBADA',
    correo: 'cursos@innovacapacita.cl',
  },
]

const ESTUDIANTES = [
  {
    id: 2,
    usuarioId: 2,
    nombres: 'Camila',
    apellidos: 'Rojas',
    carrera: 'Ingeniería en Informática',
    correo: 'estudiante.demo@inacapmail.cl',
    institucion: 'INACAP',
  },
  {
    id: 10,
    usuarioId: null,
    nombres: 'Diego',
    apellidos: 'Soto',
    carrera: 'Analista de Datos',
    correo: 'diego.soto@inacapmail.cl',
    institucion: 'INACAP',
  },
  {
    id: 11,
    usuarioId: null,
    nombres: 'Valentina',
    apellidos: 'Muñoz',
    carrera: 'Diseño Gráfico',
    correo: 'valentina.munoz@inacapmail.cl',
    institucion: 'INACAP',
  },
]

const OFERTAS = [
  {
    id: 1,
    empresaId: 1,
    titulo: 'Práctica en Desarrollo Web',
    descripcion:
      'Participa en el desarrollo de aplicaciones web junto al equipo de producto. Tendrás acompañamiento y acceso a proyectos reales.',
    tipo: 'PRACTICA',
    modalidad: 'HIBRIDA',
    area: 'Tecnología',
    ubicacion: 'Santiago',
    cupos: 3,
    fechaLimite: fechaEnDias(20),
    fechaPublicacion: fechaEnDias(-6),
    estado: 'PUBLICADA',
  },
  {
    id: 2,
    empresaId: 1,
    titulo: 'Empleo de Analista de Datos Junior',
    descripcion:
      'Buscamos una persona para apoyar la construcción de reportes y tableros de datos para el área comercial.',
    tipo: 'EMPLEO',
    modalidad: 'REMOTA',
    area: 'Tecnología',
    ubicacion: 'Remoto',
    cupos: 1,
    fechaLimite: fechaEnDias(30),
    fechaPublicacion: fechaEnDias(-3),
    estado: 'PUBLICADA',
  },
  {
    id: 3,
    empresaId: 4,
    titulo: 'Capacitación en Excel Avanzado',
    descripcion:
      'Curso intensivo de Excel con ejercicios prácticos de análisis y automatización de planillas.',
    tipo: 'CAPACITACION',
    modalidad: 'REMOTA',
    area: 'Administración',
    ubicacion: 'Online',
    cupos: 50,
    fechaLimite: fechaEnDias(15),
    fechaPublicacion: fechaEnDias(-10),
    estado: 'PUBLICADA',
  },
  {
    id: 4,
    empresaId: 1,
    titulo: 'Servicio de Diseño Gráfico',
    descripcion:
      'Apoyo en la creación de piezas gráficas para campañas de comunicación interna y redes sociales.',
    tipo: 'SERVICIO',
    modalidad: 'PRESENCIAL',
    area: 'Diseño',
    ubicacion: 'Valparaíso',
    cupos: 2,
    fechaLimite: fechaEnDias(10),
    fechaPublicacion: fechaEnDias(-1),
    estado: 'PUBLICADA',
  },
  {
    id: 5,
    empresaId: 4,
    titulo: 'Práctica en Marketing Digital',
    descripcion:
      'Colabora en la planificación de contenidos, seguimiento de campañas y análisis de métricas.',
    tipo: 'PRACTICA',
    modalidad: 'PRESENCIAL',
    area: 'Marketing',
    ubicacion: 'Concepción',
    cupos: 2,
    fechaLimite: fechaEnDias(25),
    fechaPublicacion: fechaEnDias(-4),
    estado: 'PUBLICADA',
  },
  {
    id: 6,
    empresaId: 1,
    titulo: 'Práctica en Desarrollo Backend',
    descripcion: 'Oferta de ejemplo que ya fue cerrada por la empresa.',
    tipo: 'PRACTICA',
    modalidad: 'REMOTA',
    area: 'Tecnología',
    ubicacion: 'Remoto',
    cupos: 1,
    fechaLimite: fechaEnDias(40),
    fechaPublicacion: fechaEnDias(-30),
    estado: 'CERRADA',
  },
]

const POSTULACIONES = [
  {
    id: 1,
    ofertaId: 1,
    estudianteId: 10,
    estado: 'ENVIADA',
    fechaPostulacion: fechaHoraEnDias(-2),
  },
  {
    id: 2,
    ofertaId: 1,
    estudianteId: 11,
    estado: 'PRESELECCIONADA',
    fechaPostulacion: fechaHoraEnDias(-1),
  },
  {
    id: 3,
    ofertaId: 3,
    estudianteId: 2,
    estado: 'ENVIADA',
    fechaPostulacion: fechaHoraEnDias(-3),
  },
  {
    id: 4,
    ofertaId: 2,
    estudianteId: 10,
    estado: 'ACEPTADA',
    fechaPostulacion: fechaHoraEnDias(-5),
  },
]

const correosRegistrados = new Set(
  [...CUENTAS_DEMO.map((cuenta) => cuenta.correo), ...EMPRESAS.map((empresa) => empresa.correo)].map(
    (correo) => correo.toLowerCase(),
  ),
)

let siguienteUsuarioId = 100
let siguienteEmpresaId = 100
let siguienteOfertaId = 100
let siguientePostulacionId = 100

function fechaEnDias(dias) {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + dias)
  return fecha.toISOString().slice(0, 10)
}

function fechaHoraEnDias(dias) {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + dias)
  return fecha.toISOString()
}

function esperar(ms = 450) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizarCorreo(correo) {
  return correo.trim().toLowerCase()
}

function estaVigente(oferta) {
  return (
    oferta.estado === 'PUBLICADA' && oferta.fechaLimite >= fechaEnDias(0)
  )
}

function buscarCuentaActual() {
  const usuario = obtenerUsuarioGuardado()
  if (!usuario) {
    throw new ErrorApi('Debes iniciar sesión para continuar', 401)
  }
  return usuario
}

function buscarEmpresaActual() {
  const usuario = buscarCuentaActual()
  if (usuario.rol !== 'EMPRESA') {
    throw new ErrorApi('Tu rol no tiene permiso para esta acción', 403)
  }

  let empresa = EMPRESAS.find(
    (item) =>
      item.usuarioId === usuario.id ||
      normalizarCorreo(item.correo) === normalizarCorreo(usuario.correo),
  )

  if (!empresa) {
    empresa = {
      id: siguienteEmpresaId++,
      usuarioId: usuario.id,
      razonSocial: usuario.correo,
      rut: '',
      rubro: '',
      descripcion: '',
      estadoAprobacion: 'APROBADA',
      correo: usuario.correo,
    }
    EMPRESAS.push(empresa)
  }

  return empresa
}

function buscarEstudianteActual() {
  const usuario = buscarCuentaActual()
  if (usuario.rol !== 'ESTUDIANTE') {
    throw new ErrorApi('Tu rol no tiene permiso para esta acción', 403)
  }

  let estudiante = ESTUDIANTES.find(
    (item) =>
      item.usuarioId === usuario.id ||
      normalizarCorreo(item.correo) === normalizarCorreo(usuario.correo),
  )

  if (!estudiante) {
    estudiante = {
      id: siguienteUsuarioId++,
      usuarioId: usuario.id,
      nombres: usuario.correo,
      apellidos: '',
      carrera: 'No especificada',
      correo: usuario.correo,
      institucion: 'INACAP',
    }
    ESTUDIANTES.push(estudiante)
  }

  return estudiante
}

function buscarAdminActual() {
  const usuario = buscarCuentaActual()
  if (usuario.rol !== 'ADMINISTRADOR') {
    throw new ErrorApi('Tu rol no tiene permiso para esta acción', 403)
  }
  return usuario
}

function empresaDeOferta(oferta) {
  return EMPRESAS.find((empresa) => empresa.id === oferta.empresaId)
}

function ofertaPublica(oferta) {
  const empresa = empresaDeOferta(oferta)
  return {
    id: oferta.id,
    titulo: oferta.titulo,
    descripcion: oferta.descripcion,
    tipo: oferta.tipo,
    modalidad: oferta.modalidad,
    area: oferta.area,
    ubicacion: oferta.ubicacion,
    cupos: oferta.cupos,
    fechaLimite: oferta.fechaLimite,
    fechaPublicacion: oferta.fechaPublicacion,
    empresa: { razonSocial: empresa?.razonSocial || 'Empresa' },
  }
}

function ofertaDetalle(oferta) {
  return {
    ...ofertaPublica(oferta),
    estado: oferta.estado,
  }
}

function ofertaDeEmpresa(oferta) {
  return {
    ...ofertaPublica(oferta),
    estado: oferta.estado,
    totalPostulaciones: POSTULACIONES.filter(
      (postulacion) => postulacion.ofertaId === oferta.id,
    ).length,
  }
}

export async function loginMock({ correo, contrasena }) {
  await esperar()

  const correoNormalizado = normalizarCorreo(correo)
  const cuenta = CUENTAS_DEMO.find(
    (item) =>
      normalizarCorreo(item.correo) === correoNormalizado &&
      item.contrasena === contrasena,
  )

  if (!cuenta) {
    throw new ErrorApi('Correo o contraseña incorrectos', 401)
  }

  return {
    token: `mock-token-${cuenta.id}-${Date.now()}`,
    usuario: {
      id: cuenta.id,
      correo: cuenta.correo,
      rol: cuenta.rol,
      estadoCuenta: cuenta.estadoCuenta,
    },
  }
}

export async function registrarEstudianteMock(datos) {
  await esperar(600)

  const correo = normalizarCorreo(datos.correo)
  const dominio = correo.split('@')[1]

  if (!DOMINIOS_VALIDOS.includes(dominio)) {
    throw new ErrorApi(
      'El correo no pertenece a una institución de educación superior registrada',
      400,
      [
        {
          campo: 'correo',
          mensaje: 'Usa un correo institucional de una institución registrada.',
        },
      ],
    )
  }

  if (correosRegistrados.has(correo)) {
    throw new ErrorApi('Ya existe una cuenta con ese correo', 409, [
      { campo: 'correo', mensaje: 'Ya existe una cuenta con ese correo.' },
    ])
  }

  const id = siguienteUsuarioId++
  CUENTAS_DEMO.push({
    id,
    correo,
    contrasena: datos.contrasena,
    rol: 'ESTUDIANTE',
    estadoCuenta: 'PENDIENTE_VERIFICACION',
  })
  ESTUDIANTES.push({
    id,
    usuarioId: id,
    nombres: datos.nombres,
    apellidos: datos.apellidos,
    carrera: datos.carrera,
    correo,
    institucion: 'INACAP',
  })
  correosRegistrados.add(correo)

  return {
    mensaje: 'Registro exitoso',
    usuario: {
      id,
      correo,
      rol: 'ESTUDIANTE',
      estadoCuenta: 'PENDIENTE_VERIFICACION',
    },
  }
}

export async function registrarEmpresaMock(datos) {
  await esperar(600)

  const correo = normalizarCorreo(datos.correo)

  if (correosRegistrados.has(correo)) {
    throw new ErrorApi('Ya existe una cuenta con ese correo', 409, [
      { campo: 'correo', mensaje: 'Ya existe una cuenta con ese correo.' },
    ])
  }

  const usuarioId = siguienteUsuarioId++
  const empresaId = siguienteEmpresaId++

  CUENTAS_DEMO.push({
    id: usuarioId,
    correo,
    contrasena: datos.contrasena,
    rol: 'EMPRESA',
    estadoCuenta: 'ACTIVA',
  })
  EMPRESAS.push({
    id: empresaId,
    usuarioId,
    razonSocial: datos.razonSocial,
    rut: datos.rut,
    rubro: datos.rubro,
    descripcion: datos.descripcion || '',
    estadoAprobacion: 'PENDIENTE',
    correo,
  })
  correosRegistrados.add(correo)

  return {
    mensaje: 'Registro exitoso',
    usuario: {
      id: usuarioId,
      correo,
      rol: 'EMPRESA',
      estadoCuenta: 'ACTIVA',
    },
  }
}

export async function verificarMock(token) {
  await esperar(700)

  if (!token || token === 'invalido' || token === 'vencido') {
    throw new ErrorApi(
      'El enlace de verificación es inválido, venció o ya fue utilizado',
      400,
    )
  }

  return { mensaje: 'Correo verificado correctamente' }
}

export async function obtenerPerfilMock() {
  await esperar(250)
  const usuario = buscarCuentaActual()

  if (usuario.rol === 'ESTUDIANTE') {
    const estudiante = ESTUDIANTES.find(
      (item) =>
        item.usuarioId === usuario.id ||
        normalizarCorreo(item.correo) === normalizarCorreo(usuario.correo),
    )
    if (!estudiante) {
      throw new ErrorApi('No se encontró el perfil del estudiante', 404)
    }
    return {
      usuario,
      perfil: {
        nombres: estudiante.nombres,
        apellidos: estudiante.apellidos,
        carrera: estudiante.carrera,
        institucion: { nombre: estudiante.institucion },
      },
    }
  }

  if (usuario.rol === 'EMPRESA') {
    const empresa = EMPRESAS.find(
      (item) =>
        item.usuarioId === usuario.id ||
        normalizarCorreo(item.correo) === normalizarCorreo(usuario.correo),
    )
    if (!empresa) {
      throw new ErrorApi('No se encontró el perfil de la empresa', 404)
    }
    return {
      usuario,
      perfil: {
        razonSocial: empresa.razonSocial,
        rut: empresa.rut,
        rubro: empresa.rubro,
        descripcion: empresa.descripcion,
        estadoAprobacion: empresa.estadoAprobacion,
      },
    }
  }

  return {
    usuario,
    perfil: { nombre: 'Administrador de la plataforma' },
  }
}

export async function listarOfertasMock({
  q = '',
  tipo = '',
  modalidad = '',
  area = '',
  ubicacion = '',
  pagina = 1,
  limite = 10,
} = {}) {
  await esperar(350)
  const termino = q.trim().toLowerCase()
  const areaTermino = area.trim().toLowerCase()
  const ubicacionTermino = ubicacion.trim().toLowerCase()

  const filtradas = OFERTAS.filter(estaVigente)
    .filter((oferta) => !tipo || oferta.tipo === tipo)
    .filter((oferta) => !modalidad || oferta.modalidad === modalidad)
    .filter(
      (oferta) =>
        !areaTermino || oferta.area.toLowerCase().includes(areaTermino),
    )
    .filter(
      (oferta) =>
        !ubicacionTermino ||
        oferta.ubicacion.toLowerCase().includes(ubicacionTermino),
    )
    .filter((oferta) => {
      if (!termino) {
        return true
      }
      return [oferta.titulo, oferta.descripcion].some((valor) =>
        valor.toLowerCase().includes(termino),
      )
    })
    .sort((a, b) => b.fechaPublicacion.localeCompare(a.fechaPublicacion))

  const total = filtradas.length
  const totalPaginas = Math.max(1, Math.ceil(total / limite))
  const paginaActual = Math.min(Math.max(Number(pagina) || 1, 1), totalPaginas)
  const inicio = (paginaActual - 1) * limite

  const ofertas = filtradas
    .slice(inicio, inicio + limite)
    .map(ofertaPublica)

  return {
    ofertas,
    paginacion: { pagina: paginaActual, limite, total, totalPaginas },
  }
}

export async function obtenerOfertaMock(id) {
  await esperar(250)
  const oferta = OFERTAS.find((item) => item.id === Number(id))

  if (!oferta) {
    throw new ErrorApi('La oferta no existe', 404)
  }

  const usuario = obtenerUsuarioGuardado()
  const respuesta = { oferta: ofertaDetalle(oferta) }

  if (usuario?.rol === 'ESTUDIANTE') {
    const estudiante = ESTUDIANTES.find(
      (item) =>
        item.usuarioId === usuario.id ||
        normalizarCorreo(item.correo) === normalizarCorreo(usuario.correo),
    )
    respuesta.yaPostulo = Boolean(
      estudiante &&
        POSTULACIONES.some(
          (postulacion) =>
            postulacion.ofertaId === oferta.id &&
            postulacion.estudianteId === estudiante.id,
        ),
    )
  }

  return respuesta
}

export async function crearOfertaMock(datos) {
  await esperar(500)
  const empresa = buscarEmpresaActual()

  if (empresa.estadoAprobacion !== 'APROBADA') {
    throw new ErrorApi(
      'Tu empresa aún no está aprobada para publicar ofertas',
      403,
    )
  }

  if (datos.fechaLimite < fechaEnDias(0)) {
    throw new ErrorApi('Datos inválidos', 400, [
      {
        campo: 'fechaLimite',
        mensaje: 'La fecha límite debe ser posterior a hoy.',
      },
    ])
  }

  const oferta = {
    id: siguienteOfertaId++,
    empresaId: empresa.id,
    titulo: datos.titulo,
    descripcion: datos.descripcion,
    tipo: datos.tipo,
    modalidad: datos.modalidad,
    area: datos.area,
    ubicacion: datos.ubicacion,
    cupos: Number(datos.cupos) || 1,
    fechaLimite: datos.fechaLimite,
    fechaPublicacion: fechaEnDias(0),
    estado: 'PUBLICADA',
  }

  OFERTAS.push(oferta)
  return { oferta: ofertaDetalle(oferta) }
}

export async function listarOfertasEmpresaMock() {
  await esperar(350)
  const empresa = buscarEmpresaActual()

  const ofertas = OFERTAS.filter(
    (oferta) =>
      oferta.empresaId === empresa.id && oferta.estado !== 'ELIMINADA',
  )
    .sort((a, b) => b.fechaPublicacion.localeCompare(a.fechaPublicacion))
    .map(ofertaDeEmpresa)

  return { ofertas }
}

export async function cerrarOfertaMock(id) {
  await esperar(300)
  const empresa = buscarEmpresaActual()
  const oferta = OFERTAS.find((item) => item.id === Number(id))

  if (!oferta) {
    throw new ErrorApi('La oferta no existe', 404)
  }

  if (oferta.empresaId !== empresa.id) {
    throw new ErrorApi('No tienes permiso para cerrar esta oferta', 403)
  }

  oferta.estado = 'CERRADA'
  return { oferta: { id: oferta.id, estado: oferta.estado } }
}

export async function editarOfertaMock(id, datos) {
  await esperar(350)
  const empresa = buscarEmpresaActual()

  if (empresa.estadoAprobacion !== 'APROBADA') {
    throw new ErrorApi(
      'Tu empresa aún no está aprobada para gestionar ofertas',
      403,
    )
  }

  const oferta = OFERTAS.find((item) => item.id === Number(id))

  if (!oferta || oferta.estado === 'ELIMINADA') {
    throw new ErrorApi('La oferta no existe', 404)
  }

  if (oferta.empresaId !== empresa.id) {
    throw new ErrorApi('No tienes permiso sobre esta oferta', 403)
  }

  if (!['BORRADOR', 'PUBLICADA'].includes(oferta.estado)) {
    throw new ErrorApi(
      'No se puede editar una oferta cerrada, vencida u oculta',
      409,
    )
  }

  Object.assign(oferta, datos)
  return { oferta: ofertaDetalle(oferta) }
}

export async function eliminarOfertaMock(id) {
  await esperar(300)
  const empresa = buscarEmpresaActual()

  if (empresa.estadoAprobacion !== 'APROBADA') {
    throw new ErrorApi(
      'Tu empresa aún no está aprobada para gestionar ofertas',
      403,
    )
  }

  const oferta = OFERTAS.find((item) => item.id === Number(id))

  if (!oferta || oferta.estado === 'ELIMINADA') {
    throw new ErrorApi('La oferta no existe', 404)
  }

  if (oferta.empresaId !== empresa.id) {
    throw new ErrorApi('No tienes permiso sobre esta oferta', 403)
  }

  oferta.estado = 'ELIMINADA'
  return { oferta: { id: oferta.id, estado: oferta.estado } }
}

export async function crearPostulacionMock(ofertaId) {
  await esperar(450)
  const usuario = buscarCuentaActual()

  if (usuario.rol !== 'ESTUDIANTE') {
    throw new ErrorApi('Tu rol no tiene permiso para postular', 403)
  }

  if (usuario.estadoCuenta !== 'ACTIVA') {
    throw new ErrorApi(
      'Debes verificar tu correo antes de poder postular',
      403,
    )
  }

  const estudiante = buscarEstudianteActual()
  const oferta = OFERTAS.find((item) => item.id === Number(ofertaId))

  if (!oferta) {
    throw new ErrorApi('La oferta no existe', 404)
  }

  if (!estaVigente(oferta)) {
    throw new ErrorApi('La oferta ya no está vigente', 400)
  }

  const existente = POSTULACIONES.find(
    (postulacion) =>
      postulacion.ofertaId === oferta.id &&
      postulacion.estudianteId === estudiante.id,
  )

  if (existente) {
    throw new ErrorApi('Ya postulaste a esta oferta', 409)
  }

  const postulacion = {
    id: siguientePostulacionId++,
    ofertaId: oferta.id,
    estudianteId: estudiante.id,
    estado: 'ENVIADA',
    fechaPostulacion: new Date().toISOString(),
  }

  POSTULACIONES.push(postulacion)

  return {
    postulacion: {
      id: postulacion.id,
      ofertaId: postulacion.ofertaId,
      estado: postulacion.estado,
      tipo: oferta.tipo,
      fechaPostulacion: postulacion.fechaPostulacion,
    },
  }
}

export async function listarMisPostulacionesMock() {
  await esperar(350)
  const estudiante = buscarEstudianteActual()

  const postulaciones = POSTULACIONES.filter(
    (postulacion) => postulacion.estudianteId === estudiante.id,
  )
    .map((postulacion) => {
      const oferta = OFERTAS.find((item) => item.id === postulacion.ofertaId)
      if (!oferta) {
        return null
      }
      return {
        id: postulacion.id,
        estado: postulacion.estado,
        tipo: oferta.tipo,
        fechaPostulacion: postulacion.fechaPostulacion,
        oferta: {
          id: oferta.id,
          titulo: oferta.titulo,
          estado: oferta.estado,
          empresa: { razonSocial: empresaDeOferta(oferta)?.razonSocial || '' },
        },
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.fechaPostulacion.localeCompare(a.fechaPostulacion))

  return { postulaciones }
}

export async function listarPostulacionesDeOfertaMock(ofertaId) {
  await esperar(350)
  const empresa = buscarEmpresaActual()
  const oferta = OFERTAS.find((item) => item.id === Number(ofertaId))

  if (!oferta) {
    throw new ErrorApi('La oferta no existe', 404)
  }

  if (oferta.empresaId !== empresa.id) {
    throw new ErrorApi('No tienes permiso para ver estas postulaciones', 403)
  }

  const postulaciones = POSTULACIONES.filter(
    (postulacion) => postulacion.ofertaId === oferta.id,
  )
    .map((postulacion) => {
      const estudiante = ESTUDIANTES.find(
        (item) => item.id === postulacion.estudianteId,
      )
      if (!estudiante) {
        return null
      }
      return {
        id: postulacion.id,
        estado: postulacion.estado,
        fechaPostulacion: postulacion.fechaPostulacion,
        estudiante: {
          nombres: estudiante.nombres,
          apellidos: estudiante.apellidos,
          carrera: estudiante.carrera,
          correo: estudiante.correo,
        },
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.fechaPostulacion.localeCompare(a.fechaPostulacion))

  return { postulaciones }
}

export async function cambiarEstadoPostulacionMock(id, estado) {
  await esperar(300)
  const empresa = buscarEmpresaActual()
  const estadosPermitidos = [
    'PRESELECCIONADA',
    'ACEPTADA',
    'RECHAZADA',
  ]

  if (!estadosPermitidos.includes(estado)) {
    throw new ErrorApi('El estado indicado no es válido', 400)
  }

  const postulacion = POSTULACIONES.find((item) => item.id === Number(id))

  if (!postulacion) {
    throw new ErrorApi('La postulación no existe', 404)
  }

  const oferta = OFERTAS.find((item) => item.id === postulacion.ofertaId)

  if (!oferta || oferta.empresaId !== empresa.id) {
    throw new ErrorApi('No tienes permiso para cambiar esta postulación', 403)
  }

  postulacion.estado = estado
  return { postulacion: { id: postulacion.id, estado: postulacion.estado } }
}

export async function listarEmpresasMock({ estado = 'PENDIENTE' } = {}) {
  await esperar(350)
  buscarAdminActual()

  const empresas = EMPRESAS.filter(
    (empresa) => !estado || empresa.estadoAprobacion === estado,
  ).map((empresa) => ({
    id: empresa.id,
    razonSocial: empresa.razonSocial,
    rut: empresa.rut,
    rubro: empresa.rubro,
    descripcion: empresa.descripcion,
    estadoAprobacion: empresa.estadoAprobacion,
    correo: empresa.correo,
  }))

  return { empresas }
}

export async function decidirEmpresaMock(id, decision) {
  await esperar(350)
  buscarAdminActual()

  if (!['APROBAR', 'RECHAZAR'].includes(decision)) {
    throw new ErrorApi('La decisión indicada no es válida', 400)
  }

  const empresa = EMPRESAS.find((item) => item.id === Number(id))

  if (!empresa) {
    throw new ErrorApi('La empresa no existe', 404)
  }

  empresa.estadoAprobacion = decision === 'APROBAR' ? 'APROBADA' : 'RECHAZADA'

  return {
    empresa: { id: empresa.id, estadoAprobacion: empresa.estadoAprobacion },
  }
}
