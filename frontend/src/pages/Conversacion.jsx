import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  enviarMensaje,
  listarMensajes,
  marcarMensajeLeido,
} from '../api/mensajes'
import Cargando from '../components/Cargando'
import EstadoVacio from '../components/EstadoVacio'
import Etiqueta from '../components/Etiqueta'
import Icono from '../components/Icono'
import Mensaje from '../components/Mensaje'
import { useAuth } from '../context/useAuth'
import { formatearFechaHora } from '../utils/formato'
import { filtrarConversacion } from '../utils/mensajes'
import { ETIQUETA_ROL } from '../utils/roles'

export default function Conversacion() {
  const { ofertaId, contactoId } = useParams()

  return (
    <ConversacionContenido
      key={`${ofertaId}-${contactoId}`}
      ofertaId={ofertaId}
      contactoId={contactoId}
    />
  )
}

function ConversacionContenido({ ofertaId, contactoId }) {
  const location = useLocation()
  const { usuario } = useAuth()
  const usuarioId = usuario?.id
  const ofertaIdNumero = Number(ofertaId)
  const contactoIdNumero = Number(contactoId)
  const idsValidos =
    Number.isInteger(ofertaIdNumero) &&
    ofertaIdNumero > 0 &&
    Number.isInteger(contactoIdNumero) &&
    contactoIdNumero > 0
  const errorValidacion =
    usuarioId && idsValidos ? '' : 'La conversación no es válida.'

  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [errorEnvio, setErrorEnvio] = useState('')
  const [enviando, setEnviando] = useState(false)
  const finRef = useRef(null)

  useEffect(() => {
    if (errorValidacion) {
      return undefined
    }

    let activo = true

    listarMensajes({ ofertaId: ofertaIdNumero })
      .then((respuesta) => {
        if (!activo) {
          return
        }

        const conversacion = filtrarConversacion(
          respuesta.mensajes || [],
          usuarioId,
          contactoIdNumero,
        )

        setMensajes(conversacion)

        const noLeidos = conversacion.filter(
          (mensaje) =>
            mensaje.destinatarioId === usuarioId && !mensaje.leido,
        )

        if (noLeidos.length > 0) {
          Promise.allSettled(
            noLeidos.map((mensaje) => marcarMensajeLeido(mensaje.id)),
          ).then((resultados) => {
            if (!activo) {
              return
            }

            const leidos = new Set(
              noLeidos
                .filter((_, indice) => resultados[indice].status === 'fulfilled')
                .map((mensaje) => mensaje.id),
            )

            if (leidos.size > 0) {
              setMensajes((actuales) =>
                actuales.map((mensaje) =>
                  leidos.has(mensaje.id)
                    ? { ...mensaje, leido: true }
                    : mensaje,
                ),
              )
            }
          })
        }
      })
      .catch((fallo) => {
        if (activo) {
          setError(fallo?.mensaje || 'No se pudieron cargar los mensajes.')
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
  }, [usuarioId, idsValidos, ofertaIdNumero, contactoIdNumero, errorValidacion])

  useEffect(() => {
    if (mensajes.length > 0) {
      finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [mensajes.length])

  const contacto =
    mensajes.find((mensaje) => mensaje.remitenteId === contactoIdNumero)
      ?.remitente ||
    mensajes.find((mensaje) => mensaje.destinatarioId === contactoIdNumero)
      ?.destinatario

  const ofertaTitulo =
    location.state?.ofertaTitulo || `Oferta #${ofertaIdNumero}`
  const contactoNombre =
    location.state?.contactoNombre ||
    contacto?.correo ||
    'Contacto'
  const contactoRol = location.state?.contactoRol || contacto?.rol

  const manejarEnvio = async (evento) => {
    evento.preventDefault()
    const contenido = texto.trim()

    if (!contenido || enviando) {
      return
    }

    setEnviando(true)
    setErrorEnvio('')

    try {
      const respuesta = await enviarMensaje({
        ofertaId: ofertaIdNumero,
        destinatarioId: contactoIdNumero,
        contenido,
      })
      setMensajes((actuales) => [...actuales, respuesta.mensaje])
      setTexto('')
    } catch (fallo) {
      setErrorEnvio(fallo?.mensaje || 'No se pudo enviar el mensaje.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="pagina">
      <Link to="/mensajes" className="enlace-volver">
        <Icono nombre="volver" tamano={17} />
        Volver a mensajes
      </Link>

      <header className="pagina__encabezado">
        <p className="pagina__etiqueta">Conversación</p>
        <h1>{ofertaTitulo}</h1>
        <p className="pagina__encabezado-linea">
          {contactoNombre}
          {contactoRol && (
            <Etiqueta variante="tipo">
              {ETIQUETA_ROL[contactoRol] || contactoRol}
            </Etiqueta>
          )}
        </p>
      </header>

      {(errorValidacion || error) && (
        <Mensaje tipo="error">{errorValidacion || error}</Mensaje>
      )}
      {errorEnvio && <Mensaje tipo="error">{errorEnvio}</Mensaje>}

      {cargando && !errorValidacion && (
        <div className="cargando-pagina">
          <Cargando texto="Cargando conversación..." />
        </div>
      )}

      {!cargando && !errorValidacion && !error && (
        <div className="conversacion panel">
          <div className="conversacion__lista">
            {mensajes.length === 0 && (
              <EstadoVacio>
                Aún no hay mensajes. Escribe el primero.
              </EstadoVacio>
            )}

            {mensajes.map((mensaje) => {
              const propio = mensaje.remitenteId === usuarioId

              return (
                <article
                  className={`burbuja ${
                    propio ? 'burbuja--propia' : 'burbuja--ajena'
                  }`}
                  key={mensaje.id}
                >
                  <p className="burbuja__contenido">{mensaje.contenido}</p>
                  <span className="burbuja__meta">
                    {propio ? 'Tú' : contactoNombre} ·{' '}
                    {formatearFechaHora(mensaje.fechaEnvio)}
                  </span>
                </article>
              )
            })}

            <div ref={finRef} />
          </div>

          <form className="conversacion__formulario" onSubmit={manejarEnvio}>
            <div className="campo">
              <label htmlFor="mensaje-contenido">Escribe un mensaje</label>
              <textarea
                id="mensaje-contenido"
                value={texto}
                onChange={(evento) => setTexto(evento.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Escribe tu mensaje..."
                disabled={enviando}
              />
            </div>

            <div className="conversacion__acciones">
              <span className="conversacion__contador">
                {texto.length}/2000
              </span>
              <button
                type="submit"
                className="boton boton--primario"
                disabled={enviando || !texto.trim()}
              >
                {enviando ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
