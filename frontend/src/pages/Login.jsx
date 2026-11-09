import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Cargando from '../components/Cargando'
import Mensaje from '../components/Mensaje'
import { useAuth } from '../context/useAuth'
import { inicioSegunRol } from '../utils/roles'
import './auth.css'

const FORMULARIO_INICIAL = {
  correo: '',
  contrasena: '',
}

function validar(formulario) {
  const errores = {}

  if (!formulario.correo.trim()) {
    errores.correo = 'Ingresa tu correo.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.correo.trim())) {
    errores.correo = 'Ingresa un correo válido.'
  }

  if (!formulario.contrasena) {
    errores.contrasena = 'Ingresa tu contraseña.'
  }

  return errores
}

export default function Login() {
  const { estaAutenticado, rol, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL)
  const [erroresCampo, setErroresCampo] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (estaAutenticado) {
    return <Navigate to={inicioSegunRol(rol)} replace />
  }

  const manejarCambio = (evento) => {
    const { name, value } = evento.target
    setFormulario((actual) => ({ ...actual, [name]: value }))

    setErroresCampo((actuales) => {
      if (!actuales[name]) {
        return actuales
      }
      const copia = { ...actuales }
      delete copia[name]
      return copia
    })
  }

  const manejarEnvio = async (evento) => {
    evento.preventDefault()
    setErrorGeneral('')

    const errores = validar(formulario)
    if (Object.keys(errores).length > 0) {
      setErroresCampo(errores)
      return
    }

    setErroresCampo({})
    setEnviando(true)

    try {
      const usuario = await login({
        correo: formulario.correo.trim(),
        contrasena: formulario.contrasena,
      })
      const destino = location.state?.desde || inicioSegunRol(usuario.rol)
      navigate(destino, { replace: true })
    } catch (error) {
      setErrorGeneral(error?.mensaje || 'No se pudo iniciar sesión.')

      const erroresApi = {}
      for (const item of error?.errores || []) {
        if (item.campo) {
          erroresApi[item.campo] = item.mensaje
        }
      }
      setErroresCampo(erroresApi)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="auth">
      <div className="auth__panel">
        <header className="auth__encabezado">
          <h1>Iniciar sesión</h1>
          <p>Accede con tu cuenta para revisar las oportunidades disponibles.</p>
        </header>

        {location.state?.sesionExpirada && !errorGeneral && (
          <Mensaje tipo="info">
            Tu sesión expiró. Vuelve a iniciar sesión.
          </Mensaje>
        )}

        {errorGeneral && <Mensaje tipo="error">{errorGeneral}</Mensaje>}

        <form className="formulario" onSubmit={manejarEnvio} noValidate>
          <div className="campo">
            <label htmlFor="login-correo">Correo</label>
            <input
              id="login-correo"
              name="correo"
              type="email"
              value={formulario.correo}
              onChange={manejarCambio}
              autoComplete="email"
              aria-invalid={Boolean(erroresCampo.correo)}
              aria-describedby={
                erroresCampo.correo ? 'login-correo-error' : undefined
              }
            />
            {erroresCampo.correo && (
              <span className="campo__error" id="login-correo-error">
                {erroresCampo.correo}
              </span>
            )}
          </div>

          <div className="campo">
            <label htmlFor="login-contrasena">Contraseña</label>
            <input
              id="login-contrasena"
              name="contrasena"
              type="password"
              value={formulario.contrasena}
              onChange={manejarCambio}
              autoComplete="current-password"
              aria-invalid={Boolean(erroresCampo.contrasena)}
              aria-describedby={
                erroresCampo.contrasena ? 'login-contrasena-error' : undefined
              }
            />
            {erroresCampo.contrasena && (
              <span className="campo__error" id="login-contrasena-error">
                {erroresCampo.contrasena}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="boton boton--primario boton--bloque"
            disabled={enviando}
          >
            {enviando ? <Cargando texto="Ingresando..." /> : 'Ingresar'}
          </button>
        </form>

        <p className="auth__pie">
          ¿Aún no tienes cuenta? <Link to="/registro">Regístrate</Link>
        </p>
      </div>
    </section>
  )
}
