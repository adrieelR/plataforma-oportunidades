import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { obtenerOferta } from '../api/ofertas'
import { crearPostulacion } from '../api/postulaciones'
import Avatar from '../components/Avatar'
import Cargando from '../components/Cargando'
import Etiqueta from '../components/Etiqueta'
import Icono from '../components/Icono'
import Mensaje from '../components/Mensaje'
import { useAuth } from '../context/useAuth'
import {
  ETIQUETA_MODALIDAD,
  ETIQUETA_TIPO,
  formatearFecha,
} from '../utils/formato'

export default function DetalleOferta() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const [oferta, setOferta] = useState(null)
  const [yaPostulo, setYaPostulo] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [postulando, setPostulando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [errorPostulacion, setErrorPostulacion] = useState('')
  const [hoy] = useState(() => new Date().toISOString().slice(0, 10))

  useEffect(() => {
    let activo = true

    obtenerOferta(id)
      .then((respuesta) => {
        if (activo) {
          setOferta(respuesta.oferta)
          setYaPostulo(Boolean(respuesta.yaPostulo))
          setError('')
        }
      })
      .catch((fallo) => {
        if (activo) {
          setError(fallo?.mensaje || 'No se pudo cargar la oferta.')
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

  if (cargando) {
    return (
      <section className="pagina">
        <div className="cargando-pagina">
          <Cargando texto="Cargando oferta..." />
        </div>
      </section>
    )
  }

  if (error || !oferta) {
    return (
      <section className="pagina">
        <Mensaje tipo="error">{error || 'La oferta no existe.'}</Mensaje>
        <Link to="/ofertas" className="boton boton--secundario">
          Volver a las ofertas
        </Link>
      </section>
    )
  }

  const ofertaDisponible =
    (!oferta.estado || oferta.estado === 'PUBLICADA') &&
    oferta.fechaLimite >= hoy
  const cuentaVerificada = usuario?.estadoCuenta === 'ACTIVA'
  const puedePostular =
    ofertaDisponible && cuentaVerificada && !yaPostulo && !postulando
  const empresa = oferta.empresa?.razonSocial || 'Empresa'

  const postular = async () => {
    setErrorPostulacion('')
    setMensajeExito('')
    setPostulando(true)

    try {
      await crearPostulacion(oferta.id)
      setYaPostulo(true)
      setMensajeExito(
        oferta.tipo === 'CAPACITACION'
          ? 'Inscripción realizada correctamente.'
          : 'Postulación enviada correctamente.',
      )
    } catch (fallo) {
      setErrorPostulacion(
        fallo?.mensaje || 'No se pudo completar la acción.',
      )
    } finally {
      setPostulando(false)
    }
  }

  return (
    <section className="pagina">
      <Link to="/ofertas" className="enlace-volver">
        <Icono nombre="volver" tamano={17} />
        Volver a las ofertas
      </Link>

      <div className="detalle">
        <article className="panel detalle__principal">
          <header className="detalle__encabezado">
            <Avatar nombre={empresa} tamano="lg" />
            <div className="detalle__encabezado-texto">
              <p className="detalle__empresa">{empresa}</p>
              <h1>{oferta.titulo}</h1>
            </div>
            <Etiqueta variante="tipo">
              {ETIQUETA_TIPO[oferta.tipo] || oferta.tipo}
            </Etiqueta>
          </header>

          <ul className="detalle__meta">
            <li>
              <Icono nombre="ubicacion" tamano={16} />
              {oferta.ubicacion}
            </li>
            <li>
              <Icono nombre="reloj" tamano={16} />
              {ETIQUETA_MODALIDAD[oferta.modalidad] || oferta.modalidad}
            </li>
            <li>
              <Icono nombre="calendario" tamano={16} />
              Hasta {formatearFecha(oferta.fechaLimite)}
            </li>
          </ul>

          <section className="detalle__seccion">
            <h2>Descripción</h2>
            <p className="detalle__descripcion">{oferta.descripcion}</p>
          </section>

          <section className="detalle__seccion">
            <h2>Detalles de la oportunidad</h2>
            <dl className="detalle__datos">
              <div>
                <dt>Tipo</dt>
                <dd>{ETIQUETA_TIPO[oferta.tipo] || oferta.tipo}</dd>
              </div>
              <div>
                <dt>Modalidad</dt>
                <dd>
                  {ETIQUETA_MODALIDAD[oferta.modalidad] || oferta.modalidad}
                </dd>
              </div>
              <div>
                <dt>Área</dt>
                <dd>{oferta.area}</dd>
              </div>
              <div>
                <dt>Ubicación</dt>
                <dd>{oferta.ubicacion}</dd>
              </div>
              <div>
                <dt>Cupos</dt>
                <dd>{oferta.cupos}</dd>
              </div>
              <div>
                <dt>Fecha límite</dt>
                <dd>{formatearFecha(oferta.fechaLimite)}</dd>
              </div>
              <div>
                <dt>Publicada</dt>
                <dd>{formatearFecha(oferta.fechaPublicacion)}</dd>
              </div>
            </dl>
          </section>
        </article>

        <aside className="panel detalle__lateral">
          <span className="detalle__lateral-icono">
            <Icono nombre="maletin" tamano={22} />
          </span>
          <h2>¿Te interesa esta oportunidad?</h2>
          <p className="detalle__lateral-texto">
            Revisa los detalles y envía tu postulación. Podrás seguir el estado
            desde “Mis postulaciones”.
          </p>

          <div className="detalle__mensajes">
            {usuario?.estadoCuenta === 'PENDIENTE_VERIFICACION' && (
              <Mensaje tipo="info">
                Verifica tu correo para poder postular.
              </Mensaje>
            )}

            {!ofertaDisponible && (
              <Mensaje tipo="info">
                Esta oferta ya no está disponible para postular.
              </Mensaje>
            )}

            {yaPostulo && (
              <Mensaje tipo="exito">
                Ya postulaste a esta oferta.{' '}
                <Link to="/mis-postulaciones">Revisa su estado</Link>.
              </Mensaje>
            )}

            {mensajeExito && <Mensaje tipo="exito">{mensajeExito}</Mensaje>}
            {errorPostulacion && (
              <Mensaje tipo="error">{errorPostulacion}</Mensaje>
            )}
          </div>

          <button
            type="button"
            className="boton boton--primario boton--bloque"
            onClick={postular}
            disabled={!puedePostular}
          >
            {postulando
              ? 'Enviando...'
              : oferta.tipo === 'CAPACITACION'
                ? 'Inscribirme'
                : 'Postular'}
          </button>
        </aside>
      </div>
    </section>
  )
}
