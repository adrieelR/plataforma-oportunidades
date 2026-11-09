import { useEffect, useState } from 'react'
import { listarOfertas } from '../api/ofertas'
import Cargando from '../components/Cargando'
import EstadoVacio from '../components/EstadoVacio'
import Icono from '../components/Icono'
import Mensaje from '../components/Mensaje'
import TarjetaOferta from '../components/TarjetaOferta'
import { useAuth } from '../context/useAuth'
import { ETIQUETA_MODALIDAD, ETIQUETA_TIPO } from '../utils/formato'

const FILTROS_INICIALES = {
  q: '',
  tipo: '',
  modalidad: '',
  area: '',
  ubicacion: '',
  pagina: 1,
}

export default function Ofertas() {
  const { usuario, perfil } = useAuth()
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [busqueda, setBusqueda] = useState('')
  const [area, setArea] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [ofertas, setOfertas] = useState([])
  const [paginacion, setPaginacion] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    listarOfertas(filtros)
      .then((respuesta) => {
        if (activo) {
          setOfertas(respuesta.ofertas)
          setPaginacion(respuesta.paginacion || null)
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
    setFiltros((actual) => ({
      ...actual,
      q: busqueda.trim(),
      area: area.trim(),
      ubicacion: ubicacion.trim(),
      pagina: 1,
    }))
  }

  const cambiarTipo = (evento) => {
    setCargando(true)
    setFiltros((actual) => ({
      ...actual,
      tipo: evento.target.value,
      pagina: 1,
    }))
  }

  const cambiarModalidad = (evento) => {
    setCargando(true)
    setFiltros((actual) => ({
      ...actual,
      modalidad: evento.target.value,
      pagina: 1,
    }))
  }

  const cambiarPagina = (nuevaPagina) => {
    setCargando(true)
    setFiltros((actual) => ({ ...actual, pagina: nuevaPagina }))
  }

  const limpiar = () => {
    setBusqueda('')
    setArea('')
    setUbicacion('')
    setCargando(true)
    setFiltros(FILTROS_INICIALES)
  }

  const hayFiltros = Boolean(
    filtros.q || filtros.tipo || filtros.modalidad || filtros.area || filtros.ubicacion,
  )
  const nombre = perfil?.nombres?.split(' ')[0]
  const totalResultados = paginacion?.total ?? ofertas.length
  const paginaActual = paginacion?.pagina ?? filtros.pagina
  const totalPaginas = paginacion?.totalPaginas ?? 1

  return (
    <section className="pagina">
      <header className="pagina__encabezado pagina__encabezado--bienvenida">
        <div>
          <p className="pagina__etiqueta">Panel de estudiante</p>
          <h1>{nombre ? `Hola, ${nombre}` : 'Hola'}</h1>
          <p>Encuentra prácticas, empleos, capacitaciones y servicios.</p>
        </div>
        <div className="pagina__resumen" aria-live="polite">
          <span className="resumen-dato__valor">{totalResultados}</span>
          <span className="resumen-dato__texto">
            {totalResultados === 1 ? 'oportunidad disponible' : 'oportunidades disponibles'}
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
                placeholder="Título o descripción"
              />
            </div>

            <div className="campo">
              <label htmlFor="area-oferta">Área</label>
              <input
                id="area-oferta"
                type="text"
                value={area}
                onChange={(evento) => setArea(evento.target.value)}
                placeholder="Tecnología, salud, educación..."
              />
            </div>

            <div className="campo">
              <label htmlFor="ubicacion-oferta">Ubicación</label>
              <input
                id="ubicacion-oferta"
                type="text"
                value={ubicacion}
                onChange={(evento) => setUbicacion(evento.target.value)}
                placeholder="Santiago, remoto, región..."
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

            <div className="campo">
              <label htmlFor="modalidad-oferta">Modalidad</label>
              <select
                id="modalidad-oferta"
                value={filtros.modalidad}
                onChange={cambiarModalidad}
              >
                <option value="">Todas</option>
                {Object.entries(ETIQUETA_MODALIDAD).map(([valor, texto]) => (
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

          {!cargando && !error && totalPaginas > 1 && (
            <nav className="paginacion" aria-label="Paginación de ofertas">
              <button
                type="button"
                className="boton boton--secundario"
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual <= 1}
              >
                Anterior
              </button>
              <span className="paginacion__estado">
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                type="button"
                className="boton boton--secundario"
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual >= totalPaginas}
              >
                Siguiente
              </button>
            </nav>
          )}
        </div>
      </div>
    </section>
  )
}
