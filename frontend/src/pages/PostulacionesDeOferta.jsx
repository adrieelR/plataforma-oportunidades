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
import {
  ETIQUETA_ESTADO_OFERTA,
  ETIQUETA_ESTADO_POSTULACION,
  formatearFechaHora,
  varianteEstado,
} from '../utils/formato'

export default function PostulacionesDeOferta() {
  const { id } = useParams()
  const [oferta, setOferta] = useState(null)
  const [postulaciones, setPostulaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [errorAccion, setErrorAccion] = useState('')
  const [actualizandoId, setActualizandoId] = useState(null)

  useEffect(() => {
    let activo = true

    Promise.all([obtenerOferta(id), listarPostulacionesDeOferta(id)])
      .then(([respuestaOferta, respuestaPostulaciones]) => {
        if (activo) {
          setOferta(respuestaOferta.oferta)
          setPostulaciones(respuestaPostulaciones.postulaciones)
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
  }, [id])

  const cambiarEstado = async (postulacion, nuevoEstado) => {
    if (nuevoEstado === postulacion.estado) {
      return
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

      {mensaje && <Mensaje tipo="exito">{mensaje}</Mensaje>}
      {(error || errorAccion) && (
        <Mensaje tipo="error">{error || errorAccion}</Mensaje>
      )}

      {cargando && (
        <div className="cargando-pagina">
          <Cargando texto="Cargando postulaciones..." />
        </div>
      )}

      {!cargando && !error && postulaciones.length === 0 && (
        <EstadoVacio>
          Esta oferta todavía no tiene postulaciones.
        </EstadoVacio>
      )}

      {!cargando && !error && postulaciones.length > 0 && (
        <div className="lista-candidatos">
          {postulaciones.map((postulacion) => {
            const nombre = `${postulacion.estudiante.nombres} ${postulacion.estudiante.apellidos}`
            const idSelect = `estado-postulacion-${postulacion.id}`

            return (
              <article className="candidato panel" key={postulacion.id}>
                <div className="candidato__cabecera">
                  <Avatar nombre={nombre} persona tamano="md" />
                  <div className="candidato__identidad">
                    <h2>{nombre}</h2>
                    <p>{postulacion.estudiante.carrera}</p>
                  </div>
                  <Etiqueta variante={varianteEstado(postulacion.estado)}>
                    {ETIQUETA_ESTADO_POSTULACION[postulacion.estado] ||
                      postulacion.estado}
                  </Etiqueta>
                </div>

                <ul className="candidato__datos">
                  <li>
                    <Icono nombre="correo" tamano={15} />
                    {postulacion.estudiante.correo}
                  </li>
                  <li>
                    <Icono nombre="calendario" tamano={15} />
                    {formatearFechaHora(postulacion.fechaPostulacion)}
                  </li>
                </ul>

                <div className="candidato__acciones">
                  <label htmlFor={idSelect}>Cambiar estado</label>
                  <select
                    id={idSelect}
                    value={postulacion.estado}
                    onChange={(evento) =>
                      cambiarEstado(postulacion, evento.target.value)
                    }
                    disabled={actualizandoId === postulacion.id}
                  >
                    <option value="ENVIADA" disabled>
                      Enviada
                    </option>
                    <option value="PRESELECCIONADA">Preseleccionada</option>
                    <option value="ACEPTADA">Aceptada</option>
                    <option value="RECHAZADA">Rechazada</option>
                  </select>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
