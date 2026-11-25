import { useEffect, useState } from 'react'
import { notificacionesDisponibles } from '../api/config'
import { listarNotificaciones } from '../api/notificaciones'
import Cargando from '../components/Cargando'
import EstadoVacio from '../components/EstadoVacio'
import Etiqueta from '../components/Etiqueta'
import Mensaje from '../components/Mensaje'
import {
  ETIQUETA_TIPO_NOTIFICACION,
  formatearFechaHora,
} from '../utils/formato'

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([])
  const [cargando, setCargando] = useState(notificacionesDisponibles)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!notificacionesDisponibles) {
      return undefined
    }

    let activo = true

    listarNotificaciones()
      .then((respuesta) => {
        if (activo) {
          setNotificaciones(respuesta.notificaciones || [])
        }
      })
      .catch((fallo) => {
        if (activo) {
          setError(
            fallo?.mensaje || 'No se pudieron cargar las notificaciones.',
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
  }, [])

  return (
    <section className="pagina">
      <header className="pagina__encabezado">
        <p className="pagina__etiqueta">Avisos</p>
        <h1>Notificaciones</h1>
        <p>Revisa los avisos que la plataforma envió a tu cuenta.</p>
      </header>

      {!notificacionesDisponibles && (
        <Mensaje tipo="info">
          Las notificaciones aún no están disponibles en este prototipo.
        </Mensaje>
      )}

      {error && <Mensaje tipo="error">{error}</Mensaje>}

      {cargando && (
        <div className="cargando-pagina">
          <Cargando texto="Cargando notificaciones..." />
        </div>
      )}

      {notificacionesDisponibles &&
        !cargando &&
        !error &&
        notificaciones.length === 0 && (
          <EstadoVacio>Aún no tienes notificaciones.</EstadoVacio>
        )}

      {notificacionesDisponibles &&
        !cargando &&
        !error &&
        notificaciones.length > 0 && (
          <div className="lista-notificaciones">
            {notificaciones.map((notificacion) => (
              <article className="notificacion panel" key={notificacion.id}>
                <div className="notificacion__cabecera">
                  <h2>{notificacion.asunto}</h2>
                  <Etiqueta variante="tipo">
                    {ETIQUETA_TIPO_NOTIFICACION[notificacion.tipo] ||
                      notificacion.tipo}
                  </Etiqueta>
                </div>
                <p className="notificacion__cuerpo">{notificacion.cuerpo}</p>
                <span className="notificacion__fecha">
                  {formatearFechaHora(notificacion.fechaCreacion)}
                </span>
              </article>
            ))}
          </div>
        )}
    </section>
  )
}
