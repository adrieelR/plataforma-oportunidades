import { useState } from 'react'
import { Link } from 'react-router-dom'
import { registrarEmpresa } from '../api/auth'
import AuthLayout from '../components/AuthLayout'
import Cargando from '../components/Cargando'
import Mensaje from '../components/Mensaje'

const FORMULARIO_INICIAL = {
  razonSocial: '',
  rut: '',
  rubro: '',
  descripcion: '',
  correo: '',
  contrasena: '',
  repetirContrasena: '',
}

function validar(formulario) {
  const errores = {}

  if (!formulario.razonSocial.trim()) {
    errores.razonSocial = 'Ingresa la razón social.'
  }
  if (!formulario.rut.trim()) {
    errores.rut = 'Ingresa el RUT de la empresa.'
  }
  if (!formulario.rubro.trim()) {
    errores.rubro = 'Ingresa el rubro.'
  }

  if (!formulario.correo.trim()) {
    errores.correo = 'Ingresa el correo de contacto.'
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

export default function RegistroEmpresa() {
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
      await registrarEmpresa({
        razonSocial: formulario.razonSocial.trim(),
        rut: formulario.rut.trim(),
        rubro: formulario.rubro.trim(),
        descripcion: formulario.descripcion.trim(),
        correo: formulario.correo.trim(),
        contrasena: formulario.contrasena,
      })
      setRegistrado(true)
    } catch (error) {
      setErrorGeneral(error?.mensaje || 'No se pudo registrar la empresa.')

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
        descripcion="Recibimos los datos de tu empresa."
      >
        <Mensaje tipo="exito">
          Empresa registrada. Queda pendiente de aprobación.
        </Mensaje>

        <Link to="/login" className="boton boton--primario boton--bloque">
          Ir a iniciar sesión
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      titulo="Registrar empresa"
      descripcion="La cuenta quedará pendiente hasta que un administrador la apruebe."
      ancho
      marcaTitulo="Encuentra talento para tu equipo"
      marcaTexto="Publica oportunidades y conecta con estudiantes que están buscando su primera experiencia."
    >
      {errorGeneral && <Mensaje tipo="error">{errorGeneral}</Mensaje>}

        <form className="formulario" onSubmit={manejarEnvio} noValidate>
          <div className="campo">
            <label htmlFor="empresa-razon-social">Razón social</label>
            <input
              id="empresa-razon-social"
              name="razonSocial"
              type="text"
              value={formulario.razonSocial}
              onChange={manejarCambio}
              autoComplete="organization"
              aria-invalid={Boolean(erroresCampo.razonSocial)}
              aria-describedby={
                erroresCampo.razonSocial
                  ? 'empresa-razon-social-error'
                  : undefined
              }
            />
            {erroresCampo.razonSocial && (
              <span className="campo__error" id="empresa-razon-social-error">
                {erroresCampo.razonSocial}
              </span>
            )}
          </div>

          <div className="formulario__fila">
            <div className="campo">
              <label htmlFor="empresa-rut">RUT</label>
              <input
                id="empresa-rut"
                name="rut"
                type="text"
                value={formulario.rut}
                onChange={manejarCambio}
                placeholder="76.543.210-8"
                aria-invalid={Boolean(erroresCampo.rut)}
                aria-describedby={
                  erroresCampo.rut ? 'empresa-rut-error' : undefined
                }
              />
              {erroresCampo.rut && (
                <span className="campo__error" id="empresa-rut-error">
                  {erroresCampo.rut}
                </span>
              )}
            </div>

            <div className="campo">
              <label htmlFor="empresa-rubro">Rubro</label>
              <input
                id="empresa-rubro"
                name="rubro"
                type="text"
                value={formulario.rubro}
                onChange={manejarCambio}
                aria-invalid={Boolean(erroresCampo.rubro)}
                aria-describedby={
                  erroresCampo.rubro ? 'empresa-rubro-error' : undefined
                }
              />
              {erroresCampo.rubro && (
                <span className="campo__error" id="empresa-rubro-error">
                  {erroresCampo.rubro}
                </span>
              )}
            </div>
          </div>

          <div className="campo">
            <label htmlFor="empresa-descripcion">Descripción</label>
            <textarea
              id="empresa-descripcion"
              name="descripcion"
              rows="3"
              value={formulario.descripcion}
              onChange={manejarCambio}
            />
            <span className="campo__ayuda">Opcional.</span>
          </div>

          <div className="campo">
            <label htmlFor="empresa-correo">Correo de contacto</label>
            <input
              id="empresa-correo"
              name="correo"
              type="email"
              value={formulario.correo}
              onChange={manejarCambio}
              autoComplete="email"
              aria-invalid={Boolean(erroresCampo.correo)}
              aria-describedby={
                erroresCampo.correo ? 'empresa-correo-error' : undefined
              }
            />
            {erroresCampo.correo && (
              <span className="campo__error" id="empresa-correo-error">
                {erroresCampo.correo}
              </span>
            )}
          </div>

          <div className="formulario__fila">
            <div className="campo">
              <label htmlFor="empresa-contrasena">Contraseña</label>
              <input
                id="empresa-contrasena"
                name="contrasena"
                type="password"
                value={formulario.contrasena}
                onChange={manejarCambio}
                autoComplete="new-password"
                aria-invalid={Boolean(erroresCampo.contrasena)}
                aria-describedby={
                  erroresCampo.contrasena
                    ? 'empresa-contrasena-error'
                    : 'empresa-contrasena-ayuda'
                }
              />
              <span className="campo__ayuda" id="empresa-contrasena-ayuda">
                Mínimo 8 caracteres, con una letra y un número.
              </span>
              {erroresCampo.contrasena && (
                <span className="campo__error" id="empresa-contrasena-error">
                  {erroresCampo.contrasena}
                </span>
              )}
            </div>

            <div className="campo">
              <label htmlFor="empresa-repetir-contrasena">
                Repetir contraseña
              </label>
              <input
                id="empresa-repetir-contrasena"
                name="repetirContrasena"
                type="password"
                value={formulario.repetirContrasena}
                onChange={manejarCambio}
                autoComplete="new-password"
                aria-invalid={Boolean(erroresCampo.repetirContrasena)}
                aria-describedby={
                  erroresCampo.repetirContrasena
                    ? 'empresa-repetir-contrasena-error'
                    : undefined
                }
              />
              {erroresCampo.repetirContrasena && (
                <span
                  className="campo__error"
                  id="empresa-repetir-contrasena-error"
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
            {enviando ? (
              <Cargando texto="Registrando empresa..." />
            ) : (
              'Registrar empresa'
            )}
          </button>
        </form>

        <p className="auth__pie">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
    </AuthLayout>
  )
}
