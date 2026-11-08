import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginApi } from '../api/auth'
import {
  borrarSesion,
  guardarSesion,
  obtenerToken,
  obtenerUsuarioGuardado,
} from '../api/cliente'
import { AuthContext } from './authContexto'

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [token, setToken] = useState(() => obtenerToken())
  const [usuario, setUsuario] = useState(() => obtenerUsuarioGuardado())

  const logout = useCallback(() => {
    borrarSesion()
    setToken(null)
    setUsuario(null)
  }, [])

  const login = useCallback(async (credenciales) => {
    const respuesta = await loginApi(credenciales)
    guardarSesion(respuesta)
    setToken(respuesta.token)
    setUsuario(respuesta.usuario)
    return respuesta.usuario
  }, [])

  useEffect(() => {
    const manejarSesionExpirada = () => {
      setToken(null)
      setUsuario(null)
      navigate('/login', {
        replace: true,
        state: { sesionExpirada: true },
      })
    }

    window.addEventListener('sesion-expirada', manejarSesionExpirada)
    return () =>
      window.removeEventListener('sesion-expirada', manejarSesionExpirada)
  }, [navigate])

  const valor = useMemo(
    () => ({
      usuario,
      token,
      estaAutenticado: Boolean(token && usuario),
      rol: usuario?.rol || null,
      login,
      logout,
    }),
    [usuario, token, login, logout],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
