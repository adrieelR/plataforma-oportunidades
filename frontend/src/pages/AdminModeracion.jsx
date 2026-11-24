import { useEffect, useState } from 'react'
import {
  listarOfertasAdmin,
  listarUsuariosAdmin,
  moderarOferta,
  suspenderCuenta,
} from '../api/admin'
import Avatar from '../components/Avatar'
import Cargando from '../components/Cargando'
import EstadoVacio from '../components/EstadoVacio'
import Etiqueta from '../components/Etiqueta'
import Mensaje from '../components/Mensaje'
import { solicitarMotivo } from '../utils/alertas'
import {
  ETIQUETA_ESTADO_CUENTA,
  ETIQUETA_ESTADO_OFERTA,
  ETIQUETA_TIPO,
  varianteEstado,
} from '../utils/formato'
import { ETIQUETA_ROL } from '../utils/roles'

const PESTANAS = [
  { id: 'ofertas', texto: 'Ofertas' },
  { id: 'cuentas', texto: 'Cuentas' },
]

export default function AdminModeracion() {
  const [pestana, setPestana] = useState('ofertas')
  const [ofertas, setOfertas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [estadoOferta, setEstadoOferta] = useState('')
  const [rol, setRol] = useState('')
  const [estadoCuenta, setEstadoCuenta] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [procesandoId, setProcesandoId] = useState(null)

  useEffect(() => {
    if (pestana !== 'ofertas') {
      return undefined
    }

    let activo = true

    listarOfertasAdmin({ estado: estadoOferta })
      .then((respuesta) => {
        if (activo) {
          setOfertas(respuesta.ofertas)
        }
      })
      .catch((fallo) => {
        if (activo) {
          setError(
            fallo?.mensaje || 'No se pudieron cargar las ofertas para moderar.',
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
  }, [pestana, estadoOferta])

  useEffect(() => {
    if (pestana !== 'cuentas') {
      return undefined
    }

    let activo = true

    listarUsuariosAdmin({ rol, estadoCuenta })
      .then((respuesta) => {
        if (activo) {
          setUsuarios(respuesta.usuarios)
        }
      })
      .catch((fallo) => {
        if (activo) {
          setError(fallo?.mensaje || 'No se pudieron cargar las cuentas.')
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
  }, [pestana, rol, estadoCuenta])

  const cambiarPestana = (nueva) => {
    if (nueva === pestana) {
      return
    }

    setPestana(nueva)
    setCargando(true)
    setMensaje('')
    setError('')
    setOfertas([])
    setUsuarios([])
  }

  const cambiarEstadoOferta = (evento) => {
    setCargando(true)
    setMensaje('')
    setError('')
    setOfertas([])
    setEstadoOferta(evento.target.value)
  }

  const cambiarRol = (evento) => {
    setCargando(true)
    setMensaje('')
    setError('')
    setUsuarios([])
    setRol(evento.target.value)
  }

  const cambiarEstadoCuenta = (evento) => {
    setCargando(true)
    setMensaje('')
    setError('')
    setUsuarios([])
    setEstadoCuenta(evento.target.value)
  }

  const moderar = async (oferta, decision) => {
    const eliminar = decision === 'ELIMINAR'
    const motivo = await solicitarMotivo({
      titulo: eliminar ? 'Eliminar oferta' : 'Ocultar oferta',
      texto: eliminar
        ? `La oferta "${oferta.titulo}" se marcará como eliminada y no podrá recuperarse. Esta acción no se puede deshacer.`
        : `La oferta "${oferta.titulo}" dejará de estar visible para los estudiantes. Esta acción no se puede deshacer.`,
      textoConfirmar: eliminar ? 'Eliminar' : 'Ocultar',
    })

    if (!motivo) {
      return
    }

    setMensaje('')
    setError('')
    setProcesandoId(oferta.id)

    try {
      const respuesta = await moderarOferta(oferta.id, { decision, motivo })

      setOfertas((actuales) =>
        actuales.map((item) =>
          item.id === respuesta.oferta.id
            ? { ...item, estado: respuesta.oferta.estado }
            : item,
        ),
      )
      setMensaje(
        eliminar
          ? `Oferta "${oferta.titulo}" eliminada.`
          : `Oferta "${oferta.titulo}" ocultada.`,
      )
    } catch (fallo) {
      setError(fallo?.mensaje || 'No se pudo moderar la oferta.')
    } finally {
      setProcesandoId(null)
    }
  }

  const suspender = async (usuario) => {
    const motivo = await solicitarMotivo({
      titulo: 'Suspender cuenta',
      texto: `La cuenta de ${usuario.nombre} (${usuario.correo}) quedará suspendida y no podrá acceder a la plataforma. Esta acción no se puede deshacer.`,
      textoConfirmar: 'Suspender',
    })

    if (!motivo) {
      return
    }

    setMensaje('')
    setError('')
    setProcesandoId(usuario.id)

    try {
      const respuesta = await suspenderCuenta(usuario.id, motivo)

      setUsuarios((actuales) =>
        actuales.map((item) =>
          item.id === respuesta.usuario.id
            ? { ...item, ...respuesta.usuario }
            : item,
        ),
      )
      setMensaje(`Cuenta de ${usuario.nombre} suspendida.`)
    } catch (fallo) {
      setError(fallo?.mensaje || 'No se pudo suspender la cuenta.')
    } finally {
      setProcesandoId(null)
    }
  }

  const total = pestana === 'ofertas' ? ofertas.length : usuarios.length
  let textoResumen = ''

  if (pestana === 'ofertas') {
    textoResumen = total === 1 ? 'oferta encontrada' : 'ofertas encontradas'
  } else {
    textoResumen = total === 1 ? 'cuenta encontrada' : 'cuentas encontradas'
  }

  return (
    <section className="pagina">
      <header className="pagina__encabezado pagina__encabezado--fila">
        <div>
          <p className="pagina__etiqueta">Panel de administración</p>
          <h1>Moderación</h1>
          <p>Revisa ofertas y cuentas, y aplica las medidas necesarias.</p>
        </div>
        {!cargando && (
          <div className="pagina__resumen" aria-live="polite">
            <span className="resumen-dato__valor">{total}</span>
            <span className="resumen-dato__texto">{textoResumen}</span>
          </div>
        )}
      </header>

      <div
        className="pestanas"
        role="tablist"
        aria-label="Secciones de moderación"
      >
        {PESTANAS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`pestana-${item.id}`}
            aria-selected={pestana === item.id}
            aria-controls={`panel-${item.id}`}
            className={`pestana${
              pestana === item.id ? ' pestana--activa' : ''
            }`}
            onClick={() => cambiarPestana(item.id)}
          >
            {item.texto}
          </button>
        ))}
      </div>

      {mensaje && <Mensaje tipo="exito">{mensaje}</Mensaje>}
      {error && <Mensaje tipo="error">{error}</Mensaje>}

      {pestana === 'ofertas' && (
        <div
          id="panel-ofertas"
          role="tabpanel"
          aria-labelledby="pestana-ofertas"
        >
          <div className="moderacion__filtros">
            <div className="campo">
              <label htmlFor="moderacion-estado-oferta">
                Estado de la oferta
              </label>
              <select
                id="moderacion-estado-oferta"
                value={estadoOferta}
                onChange={cambiarEstadoOferta}
              >
                <option value="">Todos los estados</option>
                {Object.entries(ETIQUETA_ESTADO_OFERTA).map(
                  ([valor, texto]) => (
                    <option key={valor} value={valor}>
                      {texto}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          {cargando && (
            <div className="cargando-pagina">
              <Cargando texto="Cargando ofertas..." />
            </div>
          )}

          {!cargando && !error && ofertas.length === 0 && (
            <EstadoVacio>
              {estadoOferta
                ? 'No hay ofertas con el estado seleccionado.'
                : 'Aún no hay ofertas para moderar.'}
            </EstadoVacio>
          )}

          {!cargando && ofertas.length > 0 && (
            <div className="moderacion__lista">
              {ofertas.map((oferta) => (
                <article className="moderacion-item panel" key={oferta.id}>
                  <div className="moderacion-item__cabecera">
                    <div className="moderacion-item__identidad">
                      <h2>{oferta.titulo}</h2>
                      <p>{oferta.empresa?.razonSocial}</p>
                    </div>
                    <div className="moderacion-item__etiquetas">
                      <Etiqueta variante="tipo">
                        {ETIQUETA_TIPO[oferta.tipo] || oferta.tipo}
                      </Etiqueta>
                      <Etiqueta variante={varianteEstado(oferta.estado)}>
                        {ETIQUETA_ESTADO_OFERTA[oferta.estado] ||
                          oferta.estado}
                      </Etiqueta>
                    </div>
                  </div>

                  <div className="moderacion-item__acciones">
                    {oferta.estado !== 'ELIMINADA' &&
                      oferta.estado !== 'OCULTA' && (
                        <button
                          type="button"
                          className="boton boton--secundario boton--pequeno"
                          onClick={() => moderar(oferta, 'OCULTAR')}
                          disabled={procesandoId === oferta.id}
                        >
                          Ocultar
                        </button>
                      )}
                    {oferta.estado !== 'ELIMINADA' && (
                      <button
                        type="button"
                        className="boton boton--peligro boton--pequeno"
                        onClick={() => moderar(oferta, 'ELIMINAR')}
                        disabled={procesandoId === oferta.id}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {pestana === 'cuentas' && (
        <div
          id="panel-cuentas"
          role="tabpanel"
          aria-labelledby="pestana-cuentas"
        >
          <div className="moderacion__filtros">
            <div className="campo">
              <label htmlFor="moderacion-rol">Rol</label>
              <select id="moderacion-rol" value={rol} onChange={cambiarRol}>
                <option value="">Todos los roles</option>
                {Object.entries(ETIQUETA_ROL).map(([valor, texto]) => (
                  <option key={valor} value={valor}>
                    {texto}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label htmlFor="moderacion-estado-cuenta">
                Estado de la cuenta
              </label>
              <select
                id="moderacion-estado-cuenta"
                value={estadoCuenta}
                onChange={cambiarEstadoCuenta}
              >
                <option value="">Todos los estados</option>
                {Object.entries(ETIQUETA_ESTADO_CUENTA).map(
                  ([valor, texto]) => (
                    <option key={valor} value={valor}>
                      {texto}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          {cargando && (
            <div className="cargando-pagina">
              <Cargando texto="Cargando cuentas..." />
            </div>
          )}

          {!cargando && !error && usuarios.length === 0 && (
            <EstadoVacio>
              {rol || estadoCuenta
                ? 'No hay cuentas que coincidan con los filtros.'
                : 'Aún no hay cuentas para moderar.'}
            </EstadoVacio>
          )}

          {!cargando && usuarios.length > 0 && (
            <div className="moderacion__lista">
              {usuarios.map((usuario) => {
                const puedeSuspender =
                  (usuario.rol === 'ESTUDIANTE' ||
                    usuario.rol === 'EMPRESA') &&
                  usuario.estadoCuenta !== 'SUSPENDIDA'

                return (
                  <article className="moderacion-item panel" key={usuario.id}>
                    <div className="moderacion-item__cabecera">
                      <Avatar
                        nombre={usuario.nombre || usuario.correo}
                        persona={usuario.rol === 'ESTUDIANTE'}
                      />
                      <div className="moderacion-item__identidad">
                        <h2>{usuario.nombre || usuario.correo}</h2>
                        <p>{usuario.correo}</p>
                      </div>
                      <div className="moderacion-item__etiquetas">
                        <Etiqueta variante="tipo">
                          {ETIQUETA_ROL[usuario.rol] || usuario.rol}
                        </Etiqueta>
                        <Etiqueta
                          variante={varianteEstado(usuario.estadoCuenta)}
                        >
                          {ETIQUETA_ESTADO_CUENTA[usuario.estadoCuenta] ||
                            usuario.estadoCuenta}
                        </Etiqueta>
                      </div>
                    </div>

                    {puedeSuspender && (
                      <div className="moderacion-item__acciones">
                        <button
                          type="button"
                          className="boton boton--peligro boton--pequeno"
                          onClick={() => suspender(usuario)}
                          disabled={procesandoId === usuario.id}
                        >
                          Suspender
                        </button>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
