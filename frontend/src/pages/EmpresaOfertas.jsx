import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cerrarOferta, listarMisOfertas } from '../api/ofertas'
import Cargando from '../components/Cargando'
import EstadoVacio from '../components/EstadoVacio'
import Etiqueta from '../components/Etiqueta'
import Icono from '../components/Icono'
import Mensaje from '../components/Mensaje'
import { useAuth } from '../context/useAuth'
import {
  ETIQUETA_ESTADO_OFERTA,
  ETIQUETA_MODALIDAD,
  ETIQUETA_TIPO,
  formatearFecha,
  mensajeAprobacionEmpresa,
  varianteEstado,
} from '../utils/formato'

export default function EmpresaOfertas() {
  const { perfil, cargandoPerfil } = useAuth()
  const location = useLocation()
  const [ofertas, setOfertas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState(location.state?.mensaje || '')
  const [cerrandoId, setCerrandoId] = useState(null)

  useEffect(() => {
    let activo = true

    listarMisOfertas()
      .then((respuesta) => {
        if (activo) {
          setOfertas(respuesta.ofertas)
        }
      })
      .catch((fallo) => {
        if (activo) {
          setError(fallo?.mensaje || 'No se pudieron cargar tus ofertas.')
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

  const empresaAprobada = perfil?.estadoAprobacion === 'APROBADA'
  const publicadas = ofertas.filter((oferta) => oferta.estado === 'PUBLICADA')
  const cerradas = ofertas.filter((oferta) => oferta.estado === 'CERRADA')
  const totalPostulaciones = ofertas.reduce(
    (total, oferta) => total + (oferta.totalPostulaciones || 0),
    0,
  )

  const manejarCierre = async (oferta) => {
    if (
      !window.confirm(
        `¿Cerrar la oferta "${oferta.titulo}"? No volverá a aparecer en la lista pública.`,
      )
    ) {
      return
    }

    setMensaje('')
    setError('')
    setCerrandoId(oferta.id)

    try {
      await cerrarOferta(oferta.id)
      setOfertas((actuales) =>
        actuales.map((item) =>
          item.id === oferta.id ? { ...item, estado: 'CERRADA' } : item,
        ),
      )
      setMensaje('Oferta cerrada correctamente.')
    } catch (fallo) {
      setError(fallo?.mensaje || 'No se pudo cerrar la oferta.')
    } finally {
      setCerrandoId(null)
    }
  }

  return (
    <section className="pagina">
      <header className="pagina__encabezado pagina__encabezado--fila">
        <div>
          <p className="pagina__etiqueta">Panel de empresa</p>
          <h1>Mis ofertas</h1>
          <p>Administra las ofertas publicadas por tu empresa.</p>
        </div>

        {empresaAprobada ? (
          <Link
            to="/empresa/ofertas/nueva"
            className="boton boton--primario"
          >
            <Icono nombre="mas" tamano={17} />
            Nueva oferta
          </Link>
        ) : (
          <button type="button" className="boton boton--primario" disabled>
            <Icono nombre="mas" tamano={17} />
            Nueva oferta
          </button>
        )}
      </header>

      {!cargandoPerfil && perfil && !empresaAprobada && (
        <Mensaje
          tipo={perfil.estadoAprobacion === 'RECHAZADA' ? 'error' : 'info'}
        >
          {mensajeAprobacionEmpresa(perfil.estadoAprobacion)}
        </Mensaje>
      )}

      {mensaje && <Mensaje tipo="exito">{mensaje}</Mensaje>}
      {error && <Mensaje tipo="error">{error}</Mensaje>}

      {!cargando && (
        <div className="metricas">
          <article className="metrica panel">
            <span className="metrica__icono">
              <Icono nombre="maletin" tamano={19} />
            </span>
            <span className="metrica__valor">{publicadas.length}</span>
            <span className="metrica__etiqueta">Ofertas publicadas</span>
          </article>
          <article className="metrica panel">
            <span className="metrica__icono">
              <Icono nombre="cerrar" tamano={19} />
            </span>
            <span className="metrica__valor">{cerradas.length}</span>
            <span className="metrica__etiqueta">Ofertas cerradas</span>
          </article>
          <article className="metrica panel">
            <span className="metrica__icono">
              <Icono nombre="usuarios" tamano={19} />
            </span>
            <span className="metrica__valor">{totalPostulaciones}</span>
            <span className="metrica__etiqueta">Postulaciones recibidas</span>
          </article>
        </div>
      )}

      {cargando && (
        <div className="cargando-pagina">
          <Cargando texto="Cargando ofertas..." />
        </div>
      )}

      {!cargando && ofertas.length === 0 && (
        <EstadoVacio>
          Aún no has publicado ofertas.
          {empresaAprobada && (
            <>
              {' '}
              <Link to="/empresa/ofertas/nueva">Crea la primera</Link>.
            </>
          )}
        </EstadoVacio>
      )}

      {!cargando && ofertas.length > 0 && (
        <div className="lista-ofertas-empresa">
          {ofertas.map((oferta) => (
            <article className="oferta-empresa panel" key={oferta.id}>
              <div className="oferta-empresa__cabecera">
                <div>
                  <div className="oferta-empresa__etiquetas">
                    <Etiqueta variante="tipo">
                      {ETIQUETA_TIPO[oferta.tipo] || oferta.tipo}
                    </Etiqueta>
                    <Etiqueta variante={varianteEstado(oferta.estado)}>
                      {ETIQUETA_ESTADO_OFERTA[oferta.estado] || oferta.estado}
                    </Etiqueta>
                  </div>
                  <h2 className="oferta-empresa__titulo">{oferta.titulo}</h2>
                  <p className="oferta-empresa__meta">
                    <Icono nombre="reloj" tamano={15} />
                    {ETIQUETA_MODALIDAD[oferta.modalidad] || oferta.modalidad}
                  </p>
                </div>
                <span className="oferta-empresa__postulaciones">
                  <strong>{oferta.totalPostulaciones}</strong>
                  <span>
                    {oferta.totalPostulaciones === 1
                      ? 'postulación'
                      : 'postulaciones'}
                  </span>
                </span>
              </div>

              <dl className="oferta-empresa__datos">
                <div>
                  <dt>Publicación</dt>
                  <dd>{formatearFecha(oferta.fechaPublicacion)}</dd>
                </div>
                <div>
                  <dt>Fecha límite</dt>
                  <dd>{formatearFecha(oferta.fechaLimite)}</dd>
                </div>
                <div>
                  <dt>Estado</dt>
                  <dd>
                    {ETIQUETA_ESTADO_OFERTA[oferta.estado] || oferta.estado}
                  </dd>
                </div>
              </dl>

              <div className="oferta-empresa__acciones">
                <Link
                  to={`/empresa/ofertas/${oferta.id}/postulaciones`}
                  className="boton boton--secundario boton--pequeno"
                >
                  Ver postulaciones
                </Link>
                {oferta.estado === 'PUBLICADA' && (
                  <button
                    type="button"
                    className="boton boton--peligro boton--pequeno"
                    onClick={() => manejarCierre(oferta)}
                    disabled={cerrandoId === oferta.id}
                  >
                    {cerrandoId === oferta.id
                      ? 'Cerrando...'
                      : 'Cerrar oferta'}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
