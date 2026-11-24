import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarMensajes } from '../api/mensajes'
import { listarMisOfertas } from '../api/ofertas'
import { listarMisPostulaciones } from '../api/postulaciones'
import Cargando from '../components/Cargando'
import EstadoVacio from '../components/EstadoVacio'
import Etiqueta from '../components/Etiqueta'
import Mensaje from '../components/Mensaje'
import { useAuth } from '../context/useAuth'
import { formatearFechaHora } from '../utils/formato'
import { agruparConversaciones } from '../utils/mensajes'
import { ETIQUETA_ROL } from '../utils/roles'

function construirInfoOfertas(rol, respuesta) {
  const info = new Map()

  if (rol === 'ESTUDIANTE') {
    for (const postulacion of respuesta.postulaciones || []) {
      const oferta = postulacion.oferta
      info.set(oferta.id, {
        titulo: oferta.titulo,
        contactoNombre: oferta.empresa?.razonSocial,
      })
    }
  } else {
    for (const oferta of respuesta.ofertas || []) {
      info.set(oferta.id, { titulo: oferta.titulo })
    }
  }

  return info
}

export default function Mensajes() {
  const { usuario, rol } = useAuth()
  const usuarioId = usuario?.id
  const [conversaciones, setConversaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!usuarioId) {
      return undefined
    }

    let activo = true

    const pedirContexto =
      rol === 'ESTUDIANTE' ? listarMisPostulaciones() : listarMisOfertas()

    Promise.all([listarMensajes(), pedirContexto])
      .then(([respuestaMensajes, respuestaContexto]) => {
        if (!activo) {
          return
        }

        setError('')

        const info = construirInfoOfertas(rol, respuestaContexto)
        const grupos = agruparConversaciones(
          respuestaMensajes.mensajes || [],
          usuarioId,
        )

        setConversaciones(
          grupos.map((grupo) => {
            const datosOferta = info.get(grupo.ofertaId) || {}
            const esEmpresa = grupo.contacto.rol === 'EMPRESA'

            return {
              ...grupo,
              ofertaTitulo:
                datosOferta.titulo || `Oferta #${grupo.ofertaId}`,
              contactoNombre: esEmpresa
                ? datosOferta.contactoNombre || grupo.contacto.correo
                : grupo.contacto.correo,
            }
          }),
        )
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
  }, [rol, usuarioId])

  return (
    <section className="pagina">
      <header className="pagina__encabezado">
        <p className="pagina__etiqueta">Comunicación</p>
        <h1>Mensajes</h1>
        <p>Conversa con la empresa o el estudiante asociado a cada postulación.</p>
      </header>

      {error && <Mensaje tipo="error">{error}</Mensaje>}

      {cargando && (
        <div className="cargando-pagina">
          <Cargando texto="Cargando mensajes..." />
        </div>
      )}

      {!cargando && !error && conversaciones.length === 0 && (
        <EstadoVacio>
          Aún no tienes mensajes. Inicia una conversación desde una
          postulación.
        </EstadoVacio>
      )}

      {!cargando && !error && conversaciones.length > 0 && (
        <div className="lista-conversaciones">
          {conversaciones.map((conversacion) => (
            <Link
              className="conversacion-item panel"
              key={conversacion.clave}
              to={`/mensajes/${conversacion.ofertaId}/${conversacion.contacto.id}`}
              state={{
                ofertaTitulo: conversacion.ofertaTitulo,
                contactoNombre: conversacion.contactoNombre,
                contactoRol: conversacion.contacto.rol,
              }}
            >
              <div className="conversacion-item__cabecera">
                <div className="conversacion-item__identidad">
                  <h2>{conversacion.ofertaTitulo}</h2>
                  <p>{conversacion.contactoNombre}</p>
                </div>
                <div className="conversacion-item__etiquetas">
                  <Etiqueta variante="tipo">
                    {ETIQUETA_ROL[conversacion.contacto.rol] ||
                      conversacion.contacto.rol}
                  </Etiqueta>
                  {conversacion.noLeidos > 0 && (
                    <span className="conversacion-item__no-leidos">
                      {conversacion.noLeidos} sin leer
                    </span>
                  )}
                </div>
              </div>

              <p className="conversacion-item__ultimo">
                {conversacion.ultimoMensaje.contenido}
              </p>
              <span className="conversacion-item__fecha">
                {formatearFechaHora(conversacion.ultimoMensaje.fechaEnvio)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
