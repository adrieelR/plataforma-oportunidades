import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { obtenerOferta } from '../api/ofertas'
import {
  cambiarEstadoPostulacion,
  listarPostulacionesDeOferta,
} from '../api/postulaciones'
import Avatar from '../components/Avatar'
import Cargando from '../components/Cargando'
import EstadoVacio from '../components/EstadoVacio'
import Etiqueta from '../components/Etiqueta'
import Icono from '../components/Icono'
import Mensaje from '../components/Mensaje'
import { confirmarAccion } from '../utils/alertas'
import {
  ETIQUETA_ESTADO_OFERTA,
  ETIQUETA_ESTADO_POSTULACION,
  ETIQUETA_TIPO_POSTULACION,
  formatearFechaHora,
  varianteEstado,
} from '../utils/formato'

const ACCIONES_POR_ESTADO = {
  ENVIADA: [
    {
      estado: 'PRESELECCIONADA',
      texto: 'Preseleccionar',
      clase: 'boton--secundario',
    },
    { estado: 'ACEPTADA', texto: 'Aceptar', clase: 'boton--primario' },
    { estado: 'RECHAZADA', texto: 'Rechazar', clase: 'boton--peligro' },
  ],
  PRESELECCIONADA: [
    { estado: 'ACEPTADA', texto: 'Aceptar', clase: 'boton--primario' },
    { estado: 'RECHAZADA', texto: 'Rechazar', clase: 'boton--peligro' },
  ],
}

const ACCIONES_CON_CONFIRMACION = ['ACEPTADA', 'RECHAZADA']

export default function PostulacionesDeOferta() {
  const { id } = useParams()
  const [oferta, setOferta] = useState(null)
  const [postulaciones, setPostulaciones] = useState([])
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [errorOferta, setErrorOferta] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [errorAccion, setErrorAccion] = useState('')
  const [actualizandoId, setActualizandoId] = useState(null)

  useEffect(() => {
    let activo = true

    obtenerOferta(id)
      .then((respuesta) => {
        if (activo) {
          setOferta(respuesta.oferta)
          setErrorOferta('')
        }
      })
      .catch((fallo) => {
        if (activo) {
          setErrorOferta(fallo?.mensaje || 'No se pudo cargar la oferta.')
        }
      })

    return () => {
      activo = false
    }
  }, [id])

  useEffect(() => {
    let activo = true

    listarPostulacionesDeOferta(id, estadoFiltro || undefined)
      .then((respuesta) => {
        if (activo) {
          setPostulaciones(respuesta.postulaciones)
        }
      })
      .catch((fallo) => {
        if (activo) {
          setError(
            fallo?.mensaje || 'No se pudieron cargar las postulaciones.',
          )
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false)
        }
      })

    return () => {
      activo = false
    }
  }, [id, estadoFiltro])

  const cambiarEstado = async (postulacion, nuevoEstado) => {
    const nombre = `${postulacion.estudiante.nombres} ${postulacion.estudiante.apellidos}`

    if (ACCIONES_CON_CONFIRMACION.includes(nuevoEstado)) {
      const confirmado = await confirmarAccion({
        titulo:
          nuevoEstado === 'ACEPTADA'
            ? '¿Aceptar esta postulación?'
            : '¿Rechazar esta postulación?',
        texto: `La decisión sobre la postulación de ${nombre} no se puede deshacer.`,
        textoConfirmar: nuevoEstado === 'ACEPTADA' ? 'Aceptar' : 'Rechazar',
      })

      if (!confirmado) {
        return
      }
    }

    setMensaje('')
    setErrorAccion('')
    setActualizandoId(postulacion.id)

    try {
      const respuesta = await cambiarEstadoPostulacion(
        postulacion.id,
        nuevoEstado,
      )
      setPostulaciones((actuales) =>
        actuales.map((item) =>
          item.id === postulacion.id
            ? { ...item, estado: respuesta.postulacion.estado }
            : item,
        ),
      )
      setMensaje('Estado de la postulación actualizado.')
    } catch (fallo) {
      setErrorAccion(
        fallo?.mensaje || 'No se pudo actualizar la postulación.',
      )
    } finally {
      setActualizandoId(null)
    }
  }

  return (
    <section className="pagina">
      <Link to="/empresa/ofertas" className="enlace-volver">
        <Icono nombre="volver" tamano={17} />
        Volver a mis ofertas
      </Link>

      <header className="pagina__encabezado">
        <p className="pagina__etiqueta">Candidatos</p>
        <h1>Postulaciones recibidas</h1>
        {oferta && (
          <p className="pagina__encabezado-linea">
            {oferta.titulo}
            <Etiqueta variante={varianteEstado(oferta.estado)}>
              {ETIQUETA_ESTADO_OFERTA[oferta.estado] || oferta.estado}
            </Etiqueta>
          </p>
        )}
      </header>

      <div className="campo candidatos__filtro">
        <label htmlFor="filtro-estado-postulacion">Filtrar por estado</label>
        <select
          id="filtro-estado-postulacion"
          value={estadoFiltro}
          onChange={(evento) => {
            setCargando(true)
            setError('')
            setErrorAccion('')
            setEstadoFiltro(evento.target.value)
          }}
        >
          <option value="">Todos los estados</option>
          {Object.entries(ETIQUETA_ESTADO_POSTULACION).map(
            ([valor, texto]) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ),
          )}
        </select>
      </div>

      {mensaje && <Mensaje tipo="exito">{mensaje}</Mensaje>}
      {(errorOferta || error || errorAccion) && (
        <Mensaje tipo="error">
          {errorOferta || error || errorAccion}
        </Mensaje>
      )}

      {cargando && (
        <div className="cargando-pagina">
          <Cargando texto="Cargando postulaciones..." />
        </div>
      )}

      {!cargando && !error && postulaciones.length === 0 && (
        <EstadoVacio>
          {estadoFiltro
            ? 'No hay postulaciones con el estado seleccionado.'
            : 'Esta oferta todavía no tiene postulaciones.'}
        </EstadoVacio>
      )}

      {!cargando && !error && postulaciones.length > 0 && (
        <div className="lista-candidatos">
          {postulaciones.map((postulacion) => {
            const estudiante = postulacion.estudiante
            const nombre = `${estudiante.nombres} ${estudiante.apellidos}`
            const acciones = ACCIONES_POR_ESTADO[postulacion.estado] || []
            const enviando = actualizandoId === postulacion.id

            return (
              <article className="candidato panel" key={postulacion.id}>
                <div className="candidato__cabecera">
                  <Avatar nombre={nombre} persona tamano="md" />
                  <div className="candidato__identidad">
                    <h2>{nombre}</h2>
                    <p>{estudiante.carrera}</p>
                  </div>
                  <div className="candidato__etiquetas">
                    <Etiqueta variante="tipo">
                      {ETIQUETA_TIPO_POSTULACION[postulacion.tipo] ||
                        postulacion.tipo}
                    </Etiqueta>
                    <Etiqueta variante={varianteEstado(postulacion.estado)}>
                      {ETIQUETA_ESTADO_POSTULACION[postulacion.estado] ||
                        postulacion.estado}
                    </Etiqueta>
                  </div>
                </div>

                <ul className="candidato__datos">
                  {estudiante.institucion?.nombre && (
                    <li>
                      <Icono nombre="empresa" tamano={15} />
                      {estudiante.institucion.nombre}
                    </li>
                  )}
                  {estudiante.descripcionPerfil && (
                    <li>
                      <Icono nombre="documento" tamano={15} />
                      {estudiante.descripcionPerfil}
                    </li>
                  )}
                  <li>
                    <Icono nombre="calendario" tamano={15} />
                    {formatearFechaHora(postulacion.fechaPostulacion)}
                  </li>
                </ul>

                {acciones.length > 0 && (
                  <div className="candidato__acciones candidato__acciones--botones">
                    {acciones.map((accion) => (
                      <button
                        key={accion.estado}
                        type="button"
                        className={`boton boton--pequeno ${accion.clase}`}
                        onClick={() =>
                          cambiarEstado(postulacion, accion.estado)
                        }
                        disabled={enviando}
                      >
                        {accion.texto}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
