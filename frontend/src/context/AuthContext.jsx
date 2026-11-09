import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginApi, obtenerPerfil } from '../api/auth'
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
  const [perfil, setPerfil] = useState(null)
  const [perfilCargado, setPerfilCargado] = useState(false)

  const logout = useCallback(() => {
    borrarSesion()
    setToken(null)
    setUsuario(null)
    setPerfil(null)
    setPerfilCargado(false)
  }, [])

  const login = useCallback(async (credenciales) => {
    const respuesta = await loginApi(credenciales)
    guardarSesion(respuesta)
    setToken(respuesta.token)
    setUsuario(respuesta.usuario)
    return respuesta.usuario
  }, [])

  useEffect(() => {
    if (!token) {
      return undefined
    }

    let activo = true

    obtenerPerfil()
      .then((datos) => {
        if (activo) {
          setPerfil(datos.perfil)
          setPerfilCargado(true)
        }
      })
      .catch(() => {
        if (activo) {
          setPerfil(null)
          setPerfilCargado(true)
        }
      })

    return () => {
      activo = false
    }
  }, [token])

  useEffect(() => {
    const raiz = document.documentElement
    raiz.dataset.rol = usuario?.rol || 'PUBLICO'

    return () => {
      delete raiz.dataset.rol
    }
  }, [usuario])

  useEffect(() => {
    const manejarSesionExpirada = () => {
      setToken(null)
      setUsuario(null)
      setPerfil(null)
      setPerfilCargado(false)
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
      perfil,
      cargandoPerfil: Boolean(token && !perfilCargado),
      estaAutenticado: Boolean(token && usuario),
      rol: usuario?.rol || null,
      login,
      logout,
    }),
    [usuario, token, perfil, perfilCargado, login, logout],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
