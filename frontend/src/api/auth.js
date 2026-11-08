import { peticion } from './cliente'
import { usarMock } from './config'
import { loginMock, registrarEstudianteMock } from './mocks'

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
