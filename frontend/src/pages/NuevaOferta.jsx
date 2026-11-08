import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { crearOferta } from '../api/ofertas'
import Cargando from '../components/Cargando'
import Icono from '../components/Icono'
import Mensaje from '../components/Mensaje'
import { useAuth } from '../context/useAuth'
import { ETIQUETA_MODALIDAD, ETIQUETA_TIPO } from '../utils/formato'

const FORMULARIO_INICIAL = {
  titulo: '',
  descripcion: '',
  tipo: 'PRACTICA',
  modalidad: 'PRESENCIAL',
  area: '',
  ubicacion: '',
  cupos: '',
  fechaLimite: '',
}

function validar(formulario, hoy) {
  const errores = {}

  if (!formulario.titulo.trim()) {
    errores.titulo = 'Ingresa un título.'
  }
  if (!formulario.descripcion.trim()) {
    errores.descripcion = 'Ingresa una descripción.'
  }
  if (!formulario.area.trim()) {
    errores.area = 'Ingresa el área.'
  }
  if (!formulario.ubicacion.trim()) {
    errores.ubicacion = 'Ingresa la ubicación.'
  }

  if (!formulario.fechaLimite) {
    errores.fechaLimite = 'Selecciona una fecha límite.'
  } else if (formulario.fechaLimite < hoy) {
    errores.fechaLimite = 'La fecha límite debe ser posterior a hoy.'
  }

  if (formulario.cupos) {
    const cupos = Number(formulario.cupos)
    if (!Number.isInteger(cupos) || cupos < 1) {
      errores.cupos = 'Los cupos deben ser un número entero mayor a cero.'
    }
  }

  return errores
}

export default function NuevaOferta() {
  const { perfil, cargandoPerfil } = useAuth()
  const navigate = useNavigate()
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL)
  const [erroresCampo, setErroresCampo] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [hoy] = useState(() => new Date().toISOString().slice(0, 10))
  const empresaAprobada = perfil?.estadoAprobacion === 'APROBADA'

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

    const errores = validar(formulario, hoy)
    if (Object.keys(errores).length > 0) {
      setErroresCampo(errores)
      return
    }

    setErroresCampo({})
    setEnviando(true)

    try {
      const datos = {
        titulo: formulario.titulo.trim(),
        descripcion: formulario.descripcion.trim(),
        tipo: formulario.tipo,
        modalidad: formulario.modalidad,
        area: formulario.area.trim(),
        ubicacion: formulario.ubicacion.trim(),
        fechaLimite: formulario.fechaLimite,
      }

      if (formulario.cupos) {
        datos.cupos = Number(formulario.cupos)
      }

      await crearOferta(datos)
      navigate('/empresa/ofertas', {
        replace: true,
        state: { mensaje: 'Oferta publicada correctamente.' },
      })
    } catch (fallo) {
      setErrorGeneral(fallo?.mensaje || 'No se pudo publicar la oferta.')

      const erroresApi = {}
      for (const item of fallo?.errores || []) {
        if (item.campo) {
          erroresApi[item.campo] = item.mensaje
        }
      }
      setErroresCampo(erroresApi)
    } finally {
      setEnviando(false)
    }
  }

  if (cargandoPerfil) {
    return (
      <section className="pagina">
        <div className="cargando-pagina">
          <Cargando texto="Cargando perfil de la empresa..." />
        </div>
      </section>
    )
  }

  if (!empresaAprobada) {
    return (
      <section className="pagina">
        <Mensaje tipo="info">
          Tu empresa aún no está aprobada. No puedes crear ofertas hasta que un
          administrador la apruebe.
        </Mensaje>
        <Link to="/empresa/ofertas" className="boton boton--secundario">
          Volver a mis ofertas
        </Link>
      </section>
    )
  }

  return (
    <section className="pagina">
      <Link to="/empresa/ofertas" className="enlace-volver">
        <Icono nombre="volver" tamano={17} />
        Volver a mis ofertas
      </Link>

      <header className="pagina__encabezado">
        <p className="pagina__etiqueta">Nueva publicación</p>
        <h1>Nueva oferta</h1>
        <p>Completa los datos para publicar una nueva oportunidad.</p>
      </header>

      <div className="formulario-panel">
        <div className="panel panel--formulario">
          {errorGeneral && <Mensaje tipo="error">{errorGeneral}</Mensaje>}

          <form className="formulario" onSubmit={manejarEnvio} noValidate>
            <fieldset className="formulario__grupo">
              <legend>Información principal</legend>

              <div className="campo">
                <label htmlFor="oferta-titulo">Título</label>
                <input
                  id="oferta-titulo"
                  name="titulo"
                  type="text"
                  value={formulario.titulo}
                  onChange={manejarCambio}
                  aria-invalid={Boolean(erroresCampo.titulo)}
                  aria-describedby={
                    erroresCampo.titulo ? 'oferta-titulo-error' : undefined
                  }
                />
                {erroresCampo.titulo && (
                  <span className="campo__error" id="oferta-titulo-error">
                    {erroresCampo.titulo}
                  </span>
                )}
              </div>

              <div className="campo">
                <label htmlFor="oferta-descripcion">Descripción</label>
                <textarea
                  id="oferta-descripcion"
                  name="descripcion"
                  rows="5"
                  value={formulario.descripcion}
                  onChange={manejarCambio}
                  aria-invalid={Boolean(erroresCampo.descripcion)}
                  aria-describedby={
                    erroresCampo.descripcion
                      ? 'oferta-descripcion-error'
                      : undefined
                  }
                />
                {erroresCampo.descripcion && (
                  <span className="campo__error" id="oferta-descripcion-error">
                    {erroresCampo.descripcion}
                  </span>
                )}
              </div>

              <div className="campo">
                <label htmlFor="oferta-tipo">Tipo</label>
                <select
                  id="oferta-tipo"
                  name="tipo"
                  value={formulario.tipo}
                  onChange={manejarCambio}
                >
                  {Object.entries(ETIQUETA_TIPO).map(([valor, texto]) => (
                    <option key={valor} value={valor}>
                      {texto}
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>

            <fieldset className="formulario__grupo">
              <legend>Ubicación y modalidad</legend>

              <div className="formulario__fila">
                <div className="campo">
                  <label htmlFor="oferta-modalidad">Modalidad</label>
                  <select
                    id="oferta-modalidad"
                    name="modalidad"
                    value={formulario.modalidad}
                    onChange={manejarCambio}
                  >
                    {Object.entries(ETIQUETA_MODALIDAD).map(
                      ([valor, texto]) => (
                        <option key={valor} value={valor}>
                          {texto}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="campo">
                  <label htmlFor="oferta-area">Área</label>
                  <input
                    id="oferta-area"
                    name="area"
                    type="text"
                    value={formulario.area}
                    onChange={manejarCambio}
                    aria-invalid={Boolean(erroresCampo.area)}
                    aria-describedby={
                      erroresCampo.area ? 'oferta-area-error' : undefined
                    }
                  />
                  {erroresCampo.area && (
                    <span className="campo__error" id="oferta-area-error">
                      {erroresCampo.area}
                    </span>
                  )}
                </div>
              </div>

              <div className="formulario__fila">
                <div className="campo">
                  <label htmlFor="oferta-ubicacion">Ubicación</label>
                  <input
                    id="oferta-ubicacion"
                    name="ubicacion"
                    type="text"
                    value={formulario.ubicacion}
                    onChange={manejarCambio}
                    aria-invalid={Boolean(erroresCampo.ubicacion)}
                    aria-describedby={
                      erroresCampo.ubicacion
                        ? 'oferta-ubicacion-error'
                        : undefined
                    }
                  />
                  {erroresCampo.ubicacion && (
                    <span className="campo__error" id="oferta-ubicacion-error">
                      {erroresCampo.ubicacion}
                    </span>
                  )}
                </div>

                <div className="campo">
                  <label htmlFor="oferta-cupos">Cupos</label>
                  <input
                    id="oferta-cupos"
                    name="cupos"
                    type="number"
                    min="1"
                    step="1"
                    value={formulario.cupos}
                    onChange={manejarCambio}
                    aria-invalid={Boolean(erroresCampo.cupos)}
                    aria-describedby={
                      erroresCampo.cupos
                        ? 'oferta-cupos-error'
                        : 'oferta-cupos-ayuda'
                    }
                  />
                  <span className="campo__ayuda" id="oferta-cupos-ayuda">
                    Opcional. Por defecto se considera 1.
                  </span>
                  {erroresCampo.cupos && (
                    <span className="campo__error" id="oferta-cupos-error">
                      {erroresCampo.cupos}
                    </span>
                  )}
                </div>
              </div>
            </fieldset>

            <fieldset className="formulario__grupo">
              <legend>Vigencia</legend>

              <div className="campo">
                <label htmlFor="oferta-fecha-limite">Fecha límite</label>
                <input
                  id="oferta-fecha-limite"
                  name="fechaLimite"
                  type="date"
                  min={hoy}
                  value={formulario.fechaLimite}
                  onChange={manejarCambio}
                  aria-invalid={Boolean(erroresCampo.fechaLimite)}
                  aria-describedby={
                    erroresCampo.fechaLimite
                      ? 'oferta-fecha-limite-error'
                      : undefined
                  }
                />
                {erroresCampo.fechaLimite && (
                  <span className="campo__error" id="oferta-fecha-limite-error">
                    {erroresCampo.fechaLimite}
                  </span>
                )}
              </div>
            </fieldset>

            <div className="formulario__acciones">
              <button
                type="submit"
                className="boton boton--primario"
                disabled={enviando}
              >
                {enviando ? 'Publicando...' : 'Publicar oferta'}
              </button>
              <Link
                to="/empresa/ofertas"
                className="boton boton--secundario"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>

        <aside className="panel formulario-ayuda">
          <span className="formulario-ayuda__icono">
            <Icono nombre="maletin" tamano={22} />
          </span>
          <h2>Consejos para tu publicación</h2>
          <ul>
            <li>Usa un título claro y directo.</li>
            <li>Describe las tareas y el perfil que buscas.</li>
            <li>Indica modalidad, ubicación y cupos disponibles.</li>
            <li>Revisa la fecha límite antes de publicar.</li>
          </ul>
        </aside>
      </div>
    </section>
  )
}
