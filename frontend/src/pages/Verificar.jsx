import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { verificar } from '../api/auth'
import AuthLayout from '../components/AuthLayout'
import Cargando from '../components/Cargando'
import Mensaje from '../components/Mensaje'

export default function Verificar() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const yaEjecutado = useRef(false)
  const [estado, setEstado] = useState(() =>
    token
      ? { cargando: true, mensaje: '', error: '' }
      : {
          cargando: false,
          mensaje: '',
          error: 'El enlace no incluye un token de verificación.',
        },
  )

  useEffect(() => {
    if (!token || yaEjecutado.current) {
      return
    }

    yaEjecutado.current = true

    verificar(token)
      .then((respuesta) => {
        setEstado({
          cargando: false,
          mensaje: respuesta.mensaje,
          error: '',
        })
      })
      .catch((error) => {
        setEstado({
          cargando: false,
          mensaje: '',
          error: error?.mensaje || 'No se pudo verificar el correo.',
        })
      })
  }, [token])

  return (
    <AuthLayout
      titulo="Verificación de correo"
      descripcion="Estamos revisando el enlace de verificación."
    >
      {estado.cargando && <Cargando texto="Verificando..." />}

      {estado.mensaje && <Mensaje tipo="exito">{estado.mensaje}</Mensaje>}

      {estado.error && <Mensaje tipo="error">{estado.error}</Mensaje>}

      <Link to="/login" className="boton boton--secundario boton--bloque">
        Ir a iniciar sesión
      </Link>
    </AuthLayout>
  )
}
