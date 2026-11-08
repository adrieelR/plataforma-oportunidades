import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Cargando from '../components/Cargando'
import Mensaje from '../components/Mensaje'
import { useAuth } from '../context/useAuth'
import { inicioSegunRol } from '../utils/roles'

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
    <AuthLayout
      titulo="Iniciar sesión"
      descripcion="Accede con tu cuenta para revisar las oportunidades disponibles."
      marcaTitulo="Conecta con oportunidades reales"
      marcaTexto="Encuentra prácticas, empleos y capacitaciones, o publica ofertas para llegar a nuevos talentos."
    >
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
      <p className="auth__pie auth__pie--secundario">
        ¿Eres una empresa?{' '}
        <Link to="/registro-empresa">Registra tu empresa</Link>
      </p>
    </AuthLayout>
  )
}
