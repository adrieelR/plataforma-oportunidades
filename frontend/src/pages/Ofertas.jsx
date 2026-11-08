import { useEffect, useState } from 'react'
import { listarOfertas } from '../api/ofertas'
import Cargando from '../components/Cargando'
import EstadoVacio from '../components/EstadoVacio'
import Icono from '../components/Icono'
import Mensaje from '../components/Mensaje'
import TarjetaOferta from '../components/TarjetaOferta'
import { useAuth } from '../context/useAuth'
import { ETIQUETA_TIPO } from '../utils/formato'

const FILTROS_INICIALES = { q: '', tipo: '' }

export default function Ofertas() {
  const { usuario, perfil } = useAuth()
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [busqueda, setBusqueda] = useState('')
  const [ofertas, setOfertas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    listarOfertas(filtros)
      .then((respuesta) => {
        if (activo) {
          setOfertas(respuesta.ofertas)
          setError('')
        }
      })
      .catch((fallo) => {
        if (activo) {
          setError(fallo?.mensaje || 'No se pudieron cargar las ofertas.')
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
  }, [filtros])

  const buscar = (evento) => {
    evento.preventDefault()
    setCargando(true)
    setFiltros((actual) => ({ ...actual, q: busqueda.trim() }))
  }

  const cambiarTipo = (evento) => {
    setCargando(true)
    setFiltros((actual) => ({ ...actual, tipo: evento.target.value }))
  }

  const limpiar = () => {
    setBusqueda('')
    setCargando(true)
    setFiltros(FILTROS_INICIALES)
  }

  const hayFiltros = Boolean(filtros.q || filtros.tipo)
  const nombre = perfil?.nombres?.split(' ')[0]

  return (
    <section className="pagina">
      <header className="pagina__encabezado pagina__encabezado--bienvenida">
        <div>
          <p className="pagina__etiqueta">Panel de estudiante</p>
          <h1>{nombre ? `Hola, ${nombre}` : 'Hola'}</h1>
          <p>Encuentra prácticas, empleos, capacitaciones y servicios.</p>
        </div>
        <div className="pagina__resumen" aria-live="polite">
          <span className="resumen-dato__valor">{ofertas.length}</span>
          <span className="resumen-dato__texto">
            {ofertas.length === 1 ? 'oportunidad disponible' : 'oportunidades disponibles'}
          </span>
        </div>
      </header>

      {usuario?.estadoCuenta === 'PENDIENTE_VERIFICACION' && (
        <Mensaje tipo="info">
          Verifica tu correo para poder postular.
        </Mensaje>
      )}

      <div className="ofertas">
        <aside className="panel ofertas__filtros">
          <div className="panel__encabezado">
            <span className="panel__icono">
              <Icono nombre="buscar" tamano={18} />
            </span>
            <div>
              <h2 className="panel__titulo">Buscar oportunidades</h2>
              <p className="panel__texto">Ajusta los resultados a lo que buscas.</p>
            </div>
          </div>

          <form className="formulario formulario--compacto" onSubmit={buscar}>
            <div className="campo">
              <label htmlFor="buscar-ofertas">Palabra clave</label>
              <input
                id="buscar-ofertas"
                type="search"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Área, cargo o empresa"
              />
            </div>

            <div className="campo">
              <label htmlFor="tipo-oferta">Tipo de oportunidad</label>
              <select
                id="tipo-oferta"
                value={filtros.tipo}
                onChange={cambiarTipo}
              >
                <option value="">Todos</option>
                {Object.entries(ETIQUETA_TIPO).map(([valor, texto]) => (
                  <option key={valor} value={valor}>
                    {texto}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtros__acciones">
              <button type="submit" className="boton boton--primario boton--bloque">
                Buscar
              </button>
              {hayFiltros && (
                <button
                  type="button"
                  className="boton boton--secundario boton--bloque"
                  onClick={limpiar}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </form>

          <p className="filtros__nota">
            Solo se muestran ofertas vigentes.
          </p>
        </aside>

        <div className="ofertas__resultados">
          <div className="resultados__cabecera">
            <div>
              <h2>Oportunidades</h2>
              <p>
                {hayFiltros
                  ? 'Resultados para tu búsqueda'
                  : 'Publicaciones recientes'}
              </p>
            </div>
          </div>

          {error && <Mensaje tipo="error">{error}</Mensaje>}

          {cargando && (
            <div className="cargando-pagina">
              <Cargando texto="Cargando ofertas..." />
            </div>
          )}

          {!cargando && !error && ofertas.length === 0 && (
            <EstadoVacio>
              {hayFiltros
                ? 'No hay ofertas que coincidan con tu búsqueda.'
                : 'Aún no hay ofertas disponibles.'}
            </EstadoVacio>
          )}

          {!cargando && !error && ofertas.length > 0 && (
            <div className="rejilla-ofertas">
              {ofertas.map((oferta) => (
                <TarjetaOferta key={oferta.id} oferta={oferta} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
