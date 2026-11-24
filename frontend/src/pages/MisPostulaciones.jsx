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
  ETIQUETA_ESTADO_POSTULACION,
  ETIQUETA_MODALIDAD,
  ETIQUETA_TIPO_POSTULACION,
  formatearFechaHora,
  varianteEstado,
} from '../utils/formato'

function obtenerAvisoOferta(oferta) {
  const hoy = new Date().toISOString().slice(0, 10)
  const fechaLimite = oferta.fechaLimite?.slice(0, 10)

  if (oferta.estado === 'VENCIDA' || (fechaLimite && fechaLimite < hoy)) {
    return { texto: 'Oferta vencida', variante: 'vencida' }
  }

  if (oferta.estado !== 'PUBLICADA') {
    return { texto: 'Oferta cerrada', variante: 'cerrada' }
  }

  return null
}

export default function MisPostulaciones() {
  const { usuario } = useAuth()
  const [postulaciones, setPostulaciones] = useState([])
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    listarMisPostulaciones(estadoFiltro || undefined)
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
  }, [estadoFiltro])

  const cambiarFiltro = (evento) => {
    setCargando(true)
    setError('')
    setEstadoFiltro(evento.target.value)
  }

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

      <div className="campo postulaciones__filtro">
        <label htmlFor="filtro-mis-postulaciones">
          Filtrar por estado
        </label>
        <select
          id="filtro-mis-postulaciones"
          value={estadoFiltro}
          onChange={cambiarFiltro}
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

      {error && <Mensaje tipo="error">{error}</Mensaje>}

      {cargando && (
        <div className="cargando-pagina">
          <Cargando texto="Cargando postulaciones..." />
        </div>
      )}

      {!cargando && !error && postulaciones.length === 0 && (
        <EstadoVacio>
          {estadoFiltro
            ? 'No tienes postulaciones con el estado seleccionado.'
            : 'Aún no tienes postulaciones.'}{' '}
          <Link to="/ofertas">Busca oportunidades disponibles</Link>.
        </EstadoVacio>
      )}

      {!cargando && !error && postulaciones.length > 0 && (
        <div className="lista-postulaciones">
          {postulaciones.map((postulacion) => {
            const oferta = postulacion.oferta
            const empresa = oferta.empresa?.razonSocial || 'Empresa'
            const empresaUsuarioId = oferta.empresa?.usuarioId
            const avisoOferta = obtenerAvisoOferta(oferta)

            return (
              <article className="postulacion" key={postulacion.id}>
                <Avatar nombre={empresa} tamano="md" />

                <div className="postulacion__contenido">
                  <div className="postulacion__cabecera">
                    <div>
                      <h2 className="postulacion__titulo">
                        {oferta.titulo}
                      </h2>
                      <p className="postulacion__empresa">
                        {oferta.empresa?.razonSocial}
                      </p>
                    </div>
                    <div className="postulacion__etiquetas">
                      {avisoOferta && (
                        <Etiqueta variante={avisoOferta.variante}>
                          {avisoOferta.texto}
                        </Etiqueta>
                      )}
                      <Etiqueta
                        variante={varianteEstado(postulacion.estado)}
                      >
                        {ETIQUETA_ESTADO_POSTULACION[postulacion.estado] ||
                          postulacion.estado}
                      </Etiqueta>
                    </div>
                  </div>

                  <ul className="postulacion__meta">
                    <li>
                      <Icono nombre="documento" tamano={15} />
                      {ETIQUETA_TIPO_POSTULACION[postulacion.tipo] ||
                        postulacion.tipo}
                    </li>
                    <li>
                      <Icono nombre="reloj" tamano={15} />
                      {ETIQUETA_MODALIDAD[oferta.modalidad] ||
                        oferta.modalidad}
                    </li>
                    <li>
                      <Icono nombre="ubicacion" tamano={15} />
                      {oferta.ubicacion}
                    </li>
                    <li>
                      <Icono nombre="calendario" tamano={15} />
                      {formatearFechaHora(postulacion.fechaPostulacion)}
                    </li>
                  </ul>

                  {empresaUsuarioId && (
                    <div className="postulacion__acciones">
                      <Link
                        to={`/mensajes/${oferta.id}/${empresaUsuarioId}`}
                        state={{
                          ofertaTitulo: oferta.titulo,
                          contactoNombre: oferta.empresa?.razonSocial,
                          contactoRol: 'EMPRESA',
                        }}
                        className="boton boton--secundario boton--pequeno"
                      >
                        <Icono nombre="correo" tamano={16} />
                        Enviar mensaje
                      </Link>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
