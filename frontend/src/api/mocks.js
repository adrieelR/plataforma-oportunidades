// MOCKS SOLO PARA DESARROLLO.
// Las cuentas demo de este archivo son ficticias y no deben usarse fuera de él.
// Cuando exista POST /auth/login en el backend, cambiar usarMock.login a false
// en src/api/config.js y eliminar los datos de ejemplo de este módulo.

import { ErrorApi } from './cliente'

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

const DOMINIOS_VALIDOS = ['inacapmail.cl']
const correosRegistrados = new Set(
  CUENTAS_DEMO.map((cuenta) => cuenta.correo.toLowerCase()),
)
let siguienteId = 100

function esperar(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function loginMock({ correo, contrasena }) {
  await esperar()

  const correoNormalizado = correo.trim().toLowerCase()
  const cuenta = CUENTAS_DEMO.find(
    (item) =>
      item.correo.toLowerCase() === correoNormalizado &&
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

  const correo = datos.correo.trim().toLowerCase()
  const dominio = correo.split('@')[1]

  if (!DOMINIOS_VALIDOS.includes(dominio)) {
    throw new ErrorApi(
      'El correo no pertenece a una institución de educación superior registrada',
      400,
      [
        {
          campo: 'correo',
          mensaje:
            'Usa un correo institucional de una institución registrada.',
        },
      ],
    )
  }

  if (correosRegistrados.has(correo)) {
    throw new ErrorApi('Ya existe una cuenta con ese correo', 409, [
      { campo: 'correo', mensaje: 'Ya existe una cuenta con ese correo.' },
    ])
  }

  correosRegistrados.add(correo)

  return {
    mensaje: 'Registro exitoso',
    usuario: {
      id: siguienteId++,
      correo,
      rol: 'ESTUDIANTE',
      estadoCuenta: 'PENDIENTE_VERIFICACION',
    },
  }
}
