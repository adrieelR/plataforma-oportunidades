import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarMisPostulaciones } from '../api/postulaciones'
import Avatar from '../components/Avatar'
import Cargando from '../components/Cargando'
import EstadoVacio from '../components/EstadoVacio'
import Etiqueta from '../components/Etiqueta'
import Icono from '../components/Icono'
import Mensaje from '../components/Mensaje'
import { useAuth } from '../context/useAuth'
import {
  ETIQUETA_ESTADO_OFERTA,
  ETIQUETA_ESTADO_POSTULACION,
  ETIQUETA_TIPO,
  formatearFechaHora,
  varianteEstado,
} from '../utils/formato'

export default function MisPostulaciones() {
  const { usuario } = useAuth()
  const [postulaciones, setPostulaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    listarMisPostulaciones()
      .then((respuesta) => {
        if (activo) {
          setPostulaciones(respuesta.postulaciones)
        }
      })
      .catch((fallo) => {
        if (activo) {
          setError(
            fallo?.mensaje || 'No se pudieron cargar tus postulaciones.',
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
        <p className="pagina__etiqueta">Seguimiento</p>
        <h1>Mis postulaciones</h1>
        <p>Sigue el estado de las oportunidades a las que postulaste.</p>
      </header>

      {usuario?.estadoCuenta === 'PENDIENTE_VERIFICACION' && (
        <Mensaje tipo="info">
          Verifica tu correo para poder postular.
        </Mensaje>
      )}

      {error && <Mensaje tipo="error">{error}</Mensaje>}

      {cargando && (
        <div className="cargando-pagina">
          <Cargando texto="Cargando postulaciones..." />
        </div>
      )}

      {!cargando && !error && postulaciones.length === 0 && (
        <EstadoVacio>
          Aún no tienes postulaciones. Explora las{' '}
          <Link to="/ofertas">ofertas disponibles</Link>.
        </EstadoVacio>
      )}

      {!cargando && !error && postulaciones.length > 0 && (
        <div className="lista-postulaciones">
          {postulaciones.map((postulacion) => (
            <article className="postulacion" key={postulacion.id}>
              <Avatar
                nombre={postulacion.oferta.empresa?.razonSocial || 'Empresa'}
                tamano="md"
              />

              <div className="postulacion__contenido">
                <div className="postulacion__cabecera">
                  <div>
                    <h2 className="postulacion__titulo">
                      <Link to={`/ofertas/${postulacion.oferta.id}`}>
                        {postulacion.oferta.titulo}
                      </Link>
                    </h2>
                    <p className="postulacion__empresa">
                      {postulacion.oferta.empresa?.razonSocial}
                    </p>
                  </div>
                  <Etiqueta variante={varianteEstado(postulacion.estado)}>
                    {ETIQUETA_ESTADO_POSTULACION[postulacion.estado] ||
                      postulacion.estado}
                  </Etiqueta>
                </div>

                <ul className="postulacion__meta">
                  <li>
                    <Icono nombre="maletin" tamano={15} />
                    {ETIQUETA_TIPO[postulacion.tipo] || postulacion.tipo}
                  </li>
                  <li>
                    <Icono nombre="calendario" tamano={15} />
                    {formatearFechaHora(postulacion.fechaPostulacion)}
                  </li>
                  <li>
                    <Icono nombre="empresa" tamano={15} />
                    Oferta:{' '}
                    {ETIQUETA_ESTADO_OFERTA[postulacion.oferta.estado] ||
                      postulacion.oferta.estado}
                  </li>
                </ul>
              </div>

              <Link
                to={`/ofertas/${postulacion.oferta.id}`}
                className="boton boton--secundario boton--pequeno postulacion__accion"
              >
                Ver oferta
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
