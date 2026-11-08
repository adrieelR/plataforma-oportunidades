import { useState } from 'react'
import { Link } from 'react-router-dom'
import { registrarEstudiante } from '../api/auth'
import AuthLayout from '../components/AuthLayout'
import Cargando from '../components/Cargando'
import Mensaje from '../components/Mensaje'

const FORMULARIO_INICIAL = {
  nombres: '',
  apellidos: '',
  carrera: '',
  correo: '',
  contrasena: '',
  repetirContrasena: '',
}

function validar(formulario) {
  const errores = {}

  if (!formulario.nombres.trim()) {
    errores.nombres = 'Ingresa tus nombres.'
  }
  if (!formulario.apellidos.trim()) {
    errores.apellidos = 'Ingresa tus apellidos.'
  }
  if (!formulario.carrera.trim()) {
    errores.carrera = 'Ingresa tu carrera.'
  }

  if (!formulario.correo.trim()) {
    errores.correo = 'Ingresa tu correo institucional.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.correo.trim())) {
    errores.correo = 'Ingresa un correo válido.'
  }

  if (!formulario.contrasena) {
    errores.contrasena = 'Ingresa una contraseña.'
  } else if (formulario.contrasena.length < 8) {
    errores.contrasena = 'La contraseña debe tener al menos 8 caracteres.'
  } else if (
    !/[A-Za-z]/.test(formulario.contrasena) ||
    !/[0-9]/.test(formulario.contrasena)
  ) {
    errores.contrasena = 'La contraseña debe incluir una letra y un número.'
  }

  if (!formulario.repetirContrasena) {
    errores.repetirContrasena = 'Repite la contraseña.'
  } else if (formulario.contrasena !== formulario.repetirContrasena) {
    errores.repetirContrasena = 'Las contraseñas no coinciden.'
  }

  return errores
}

export default function RegistroEstudiante() {
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL)
  const [erroresCampo, setErroresCampo] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [registrado, setRegistrado] = useState(false)

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
      await registrarEstudiante({
        nombres: formulario.nombres.trim(),
        apellidos: formulario.apellidos.trim(),
        carrera: formulario.carrera.trim(),
        correo: formulario.correo.trim(),
        contrasena: formulario.contrasena,
      })
      setRegistrado(true)
    } catch (error) {
      setErrorGeneral(error?.mensaje || 'No se pudo crear la cuenta.')

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

  if (registrado) {
    return (
      <AuthLayout
        titulo="Registro completado"
        descripcion="Tu cuenta fue creada correctamente."
      >
        <Mensaje tipo="exito">
          Cuenta creada. Falta verificar tu correo
        </Mensaje>

        <Link to="/login" className="boton boton--primario boton--bloque">
          Ir a iniciar sesión
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      titulo="Crear cuenta de estudiante"
      descripcion="Usa tu correo institucional para registrarte en la plataforma."
      ancho
      marcaTitulo="Tu perfil, tus oportunidades"
      marcaTexto="Crea tu cuenta para postular a prácticas, empleos y capacitaciones desde un solo lugar."
    >
      {errorGeneral && <Mensaje tipo="error">{errorGeneral}</Mensaje>}

        <form className="formulario" onSubmit={manejarEnvio} noValidate>
          <div className="formulario__fila">
            <div className="campo">
              <label htmlFor="registro-nombres">Nombres</label>
              <input
                id="registro-nombres"
                name="nombres"
                type="text"
                value={formulario.nombres}
                onChange={manejarCambio}
                autoComplete="given-name"
                aria-invalid={Boolean(erroresCampo.nombres)}
                aria-describedby={
                  erroresCampo.nombres ? 'registro-nombres-error' : undefined
                }
              />
              {erroresCampo.nombres && (
                <span className="campo__error" id="registro-nombres-error">
                  {erroresCampo.nombres}
                </span>
              )}
            </div>

            <div className="campo">
              <label htmlFor="registro-apellidos">Apellidos</label>
              <input
                id="registro-apellidos"
                name="apellidos"
                type="text"
                value={formulario.apellidos}
                onChange={manejarCambio}
                autoComplete="family-name"
                aria-invalid={Boolean(erroresCampo.apellidos)}
                aria-describedby={
                  erroresCampo.apellidos
                    ? 'registro-apellidos-error'
                    : undefined
                }
              />
              {erroresCampo.apellidos && (
                <span className="campo__error" id="registro-apellidos-error">
                  {erroresCampo.apellidos}
                </span>
              )}
            </div>
          </div>

          <div className="campo">
            <label htmlFor="registro-carrera">Carrera</label>
            <input
              id="registro-carrera"
              name="carrera"
              type="text"
              value={formulario.carrera}
              onChange={manejarCambio}
              aria-invalid={Boolean(erroresCampo.carrera)}
              aria-describedby={
                erroresCampo.carrera ? 'registro-carrera-error' : undefined
              }
            />
            {erroresCampo.carrera && (
              <span className="campo__error" id="registro-carrera-error">
                {erroresCampo.carrera}
              </span>
            )}
          </div>

          <div className="campo">
            <label htmlFor="registro-correo">Correo institucional</label>
            <input
              id="registro-correo"
              name="correo"
              type="email"
              value={formulario.correo}
              onChange={manejarCambio}
              autoComplete="email"
              placeholder="nombre@inacapmail.cl"
              aria-invalid={Boolean(erroresCampo.correo)}
              aria-describedby={
                erroresCampo.correo ? 'registro-correo-error' : undefined
              }
            />
            {erroresCampo.correo && (
              <span className="campo__error" id="registro-correo-error">
                {erroresCampo.correo}
              </span>
            )}
          </div>

          <div className="formulario__fila">
            <div className="campo">
              <label htmlFor="registro-contrasena">Contraseña</label>
              <input
                id="registro-contrasena"
                name="contrasena"
                type="password"
                value={formulario.contrasena}
                onChange={manejarCambio}
                autoComplete="new-password"
                aria-invalid={Boolean(erroresCampo.contrasena)}
                aria-describedby={
                  erroresCampo.contrasena
                    ? 'registro-contrasena-error'
                    : 'registro-contrasena-ayuda'
                }
              />
              <span className="campo__ayuda" id="registro-contrasena-ayuda">
                Mínimo 8 caracteres, con una letra y un número.
              </span>
              {erroresCampo.contrasena && (
                <span className="campo__error" id="registro-contrasena-error">
                  {erroresCampo.contrasena}
                </span>
              )}
            </div>

            <div className="campo">
              <label htmlFor="registro-repetir-contrasena">
                Repetir contraseña
              </label>
              <input
                id="registro-repetir-contrasena"
                name="repetirContrasena"
                type="password"
                value={formulario.repetirContrasena}
                onChange={manejarCambio}
                autoComplete="new-password"
                aria-invalid={Boolean(erroresCampo.repetirContrasena)}
                aria-describedby={
                  erroresCampo.repetirContrasena
                    ? 'registro-repetir-contrasena-error'
                    : undefined
                }
              />
              {erroresCampo.repetirContrasena && (
                <span
                  className="campo__error"
                  id="registro-repetir-contrasena-error"
                >
                  {erroresCampo.repetirContrasena}
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="boton boton--primario boton--bloque"
            disabled={enviando}
          >
            {enviando ? <Cargando texto="Creando cuenta..." /> : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth__pie">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
    </AuthLayout>
  )
}
