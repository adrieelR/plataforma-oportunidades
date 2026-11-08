import { peticion } from './cliente'
import { usarMock } from './config'
import {
  loginMock,
  obtenerPerfilMock,
  registrarEmpresaMock,
  registrarEstudianteMock,
  verificarMock,
} from './mocks'

export async function login({ correo, contrasena }) {
  if (usarMock.login) {
    return loginMock({ correo, contrasena })
  }

  return peticion('/auth/login', {
    metodo: 'POST',
    cuerpo: { correo, contrasena },
    noExpirarSesion: true,
  })
}

export async function registrarEstudiante(datos) {
  if (usarMock.registro) {
    return registrarEstudianteMock(datos)
  }

  return peticion('/auth/registro', {
    metodo: 'POST',
    cuerpo: datos,
    noExpirarSesion: true,
  })
}

export async function registrarEmpresa(datos) {
  if (usarMock.registroEmpresa) {
    return registrarEmpresaMock(datos)
  }

  return peticion('/auth/registro-empresa', {
    metodo: 'POST',
    cuerpo: datos,
    noExpirarSesion: true,
  })
}

export async function verificar(token) {
  if (usarMock.verificar) {
    return verificarMock(token)
  }

  return peticion('/auth/verificar', {
    metodo: 'POST',
    cuerpo: { token },
    noExpirarSesion: true,
  })
}

export async function obtenerPerfil() {
  if (usarMock.perfil) {
    return obtenerPerfilMock()
  }

  return peticion('/auth/perfil')
}
