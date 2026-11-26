import { useCallback, useEffect, useState } from 'react'
import {
  decidirEmpresa,
  listarEmpresas,
  listarUsuariosAdmin,
  verificarEstudiante,
} from '../api/admin'
import Avatar from '../components/Avatar'
import Cargando from '../components/Cargando'
import EstadoVacio from '../components/EstadoVacio'
import Etiqueta from '../components/Etiqueta'
import Icono from '../components/Icono'
import Mensaje from '../components/Mensaje'
import { confirmarAccion } from '../utils/alertas'
import {
  ETIQUETA_APROBACION,
  ETIQUETA_ESTADO_CUENTA,
  varianteEstado,
} from '../utils/formato'

const PESTANAS = [
  { id: 'empresas', texto: 'Empresas pendientes' },
  { id: 'estudiantes', texto: 'Estudiantes' },
]

export default function AdminEmpresas() {
  const [pestana, setPestana] = useState('empresas')
  const [empresas, setEmpresas] = useState([])
  const [estudiantes, setEstudiantes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [procesandoId, setProcesandoId] = useState(null)

  const cargarEmpresas = useCallback(
    () => listarEmpresas({ estado: 'PENDIENTE' }),
    [],
  )

  useEffect(() => {
    if (pestana !== 'empresas') {
      return undefined
    }

    let activo = true

    cargarEmpresas()
      .then((respuesta) => {
        if (activo) {
          setEmpresas(respuesta.empresas)
        }
      })
      .catch((fallo) => {
        if (activo) {
          setError(
            fallo?.mensaje || 'No se pudieron cargar las empresas pendientes.',
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
  }, [pestana, cargarEmpresas])

  useEffect(() => {
    if (pestana !== 'estudiantes') {
      return undefined
    }

    let activo = true

    listarUsuariosAdmin({ rol: 'ESTUDIANTE' })
      .then((respuesta) => {
        if (activo) {
          setEstudiantes(respuesta.usuarios)
        }
      })
      .catch((fallo) => {
        if (activo) {
          setError(
            fallo?.mensaje ||
              'No se pudieron cargar los estudiantes.',
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
  }, [pestana])

  const cambiarPestana = (nueva) => {
    if (nueva === pestana) {
      return
    }

    setPestana(nueva)
    setCargando(true)
    setMensaje('')
    setError('')
    setEmpresas([])
    setEstudiantes([])
  }

  const decidir = async (empresa, decision) => {
    setMensaje('')
    setError('')
    setProcesandoId(empresa.id)

    try {
      await decidirEmpresa(empresa.id, decision)
      setEmpresas((actuales) =>
        actuales.filter((item) => item.id !== empresa.id),
      )
      setMensaje(
        decision === 'APROBAR'
          ? `Empresa "${empresa.razonSocial}" aprobada.`
          : `Empresa "${empresa.razonSocial}" rechazada.`,
      )
    } catch (fallo) {
      setError(fallo?.mensaje || 'No se pudo actualizar la empresa.')

      if (fallo?.estado === 409) {
        try {
          const respuesta = await cargarEmpresas()
          setEmpresas(respuesta.empresas)
        } catch (recarga) {
          setError(
            recarga?.mensaje ||
              'No se pudieron cargar las empresas pendientes.',
          )
        }
      }
    } finally {
      setProcesandoId(null)
    }
  }

  const verificar = async (usuario) => {
    const confirmado = await confirmarAccion({
      titulo: '¿Verificar y activar esta cuenta?',
      texto: `La cuenta de ${usuario.nombre || usuario.correo} quedará verificada y activa.`,
      textoConfirmar: 'Verificar / Activar',
      peligro: false,
    })

    if (!confirmado) {
      return
    }

    setMensaje('')
    setError('')
    setProcesandoId(usuario.id)

    try {
      const respuesta = await verificarEstudiante(usuario.id)
      setEstudiantes((actuales) =>
        actuales.map((item) =>
          item.id === usuario.id
            ? { ...item, estadoCuenta: respuesta.usuario.estadoCuenta }
            : item,
        ),
      )
      setMensaje(
        respuesta.mensaje ||
          `Cuenta de ${usuario.nombre || usuario.correo} verificada y activada.`,
      )
    } catch (fallo) {
      setError(fallo?.mensaje || 'No se pudo verificar la cuenta.')
    } finally {
      setProcesandoId(null)
    }
  }

  let total = empresas.length
  let textoResumen =
    total === 1 ? 'empresa por revisar' : 'empresas por revisar'

  if (pestana === 'estudiantes') {
    total = estudiantes.length
    textoResumen =
      total === 1 ? 'estudiante encontrado' : 'estudiantes encontrados'
  }

  return (
    <section className="pagina">
      <header className="pagina__encabezado pagina__encabezado--fila">
        <div>
          <p className="pagina__etiqueta">Panel de administración</p>
          <h1>
            {pestana === 'empresas'
              ? 'Empresas pendientes'
              : 'Verificación de estudiantes'}
          </h1>
          <p>
            {pestana === 'empresas'
              ? 'Revisa y decide la aprobación de las empresas registradas.'
              : 'Verifica y activa cuentas de estudiantes registrados.'}
          </p>
        </div>
        {!cargando && (
          <div className="pagina__resumen">
            <span className="resumen-dato__valor">{total}</span>
            <span className="resumen-dato__texto">{textoResumen}</span>
          </div>
        )}
      </header>

      <div
        className="pestanas"
        role="tablist"
        aria-label="Secciones de gestión"
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

      {pestana === 'empresas' && (
        <div
          id="panel-empresas"
          role="tabpanel"
          aria-labelledby="pestana-empresas"
        >
          {cargando && (
            <div className="cargando-pagina">
              <Cargando texto="Cargando empresas..." />
            </div>
          )}

          {!cargando && !error && empresas.length === 0 && (
            <EstadoVacio>
              No hay empresas pendientes de revisión.
            </EstadoVacio>
          )}

          {!cargando && !error && empresas.length > 0 && (
            <div className="lista-empresas">
              {empresas.map((empresa) => (
                <article
                  className="empresa-pendiente panel"
                  key={empresa.id}
                >
                  <div className="empresa-pendiente__cabecera">
                    <Avatar nombre={empresa.razonSocial} tamano="lg" />
                    <div className="empresa-pendiente__identidad">
                      <h2>{empresa.razonSocial}</h2>
                      <p>{empresa.rubro}</p>
                    </div>
                    <Etiqueta
                      variante={varianteEstado(empresa.estadoAprobacion)}
                    >
                      {ETIQUETA_APROBACION[empresa.estadoAprobacion] ||
                        empresa.estadoAprobacion}
                    </Etiqueta>
                  </div>

                  {empresa.descripcion && (
                    <p className="empresa-pendiente__descripcion">
                      {empresa.descripcion}
                    </p>
                  )}

                  <dl className="empresa-pendiente__datos">
                    <div>
                      <dt>
                        <Icono nombre="documento" tamano={14} /> RUT
                      </dt>
                      <dd>{empresa.rut}</dd>
                    </div>
                    <div>
                      <dt>
                        <Icono nombre="correo" tamano={14} /> Correo
                      </dt>
                      <dd>{empresa.correo}</dd>
                    </div>
                  </dl>

                  <div className="empresa-pendiente__acciones">
                    <button
                      type="button"
                      className="boton boton--exito"
                      onClick={() => decidir(empresa, 'APROBAR')}
                      disabled={procesandoId === empresa.id}
                    >
                      <Icono nombre="check" tamano={17} />
                      Aprobar
                    </button>
                    <button
                      type="button"
                      className="boton boton--peligro"
                      onClick={() => decidir(empresa, 'RECHAZAR')}
                      disabled={procesandoId === empresa.id}
                    >
                      <Icono nombre="cerrar" tamano={17} />
                      Rechazar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {pestana === 'estudiantes' && (
        <div
          id="panel-estudiantes"
          role="tabpanel"
          aria-labelledby="pestana-estudiantes"
        >
          {cargando && (
            <div className="cargando-pagina">
              <Cargando texto="Cargando estudiantes..." />
            </div>
          )}

          {!cargando && !error && estudiantes.length === 0 && (
            <EstadoVacio>
              No hay estudiantes registrados.
            </EstadoVacio>
          )}

          {!cargando && !error && estudiantes.length > 0 && (
            <div className="lista-empresas">
              {estudiantes.map((usuario) => {
                const puedeVerificar =
                  usuario.estadoCuenta !== 'ACTIVA'

                return (
                  <article
                    className="empresa-pendiente panel"
                    key={usuario.id}
                  >
                    <div className="empresa-pendiente__cabecera">
                      <Avatar
                        nombre={usuario.nombre || usuario.correo}
                        persona
                        tamano="lg"
                      />
                      <div className="empresa-pendiente__identidad">
                        <h2>{usuario.nombre || usuario.correo}</h2>
                        {usuario.carrera && <p>{usuario.carrera}</p>}
                      </div>
                      <Etiqueta
                        variante={varianteEstado(usuario.estadoCuenta)}
                      >
                        {ETIQUETA_ESTADO_CUENTA[usuario.estadoCuenta] ||
                          usuario.estadoCuenta}
                      </Etiqueta>
                    </div>

                    <dl className="empresa-pendiente__datos">
                      <div>
                        <dt>
                          <Icono nombre="correo" tamano={14} /> Correo
                        </dt>
                        <dd>{usuario.correo}</dd>
                      </div>
                      {usuario.institucion && (
                        <div>
                          <dt>
                            <Icono nombre="empresa" tamano={14} />{' '}
                            Institución
                          </dt>
                          <dd>{usuario.institucion}</dd>
                        </div>
                      )}
                    </dl>

                    <div className="empresa-pendiente__acciones">
                      {puedeVerificar ? (
                        <button
                          type="button"
                          className="boton boton--exito"
                          onClick={() => verificar(usuario)}
                          disabled={procesandoId === usuario.id}
                        >
                          <Icono nombre="check" tamano={17} />
                          {procesandoId === usuario.id
                            ? 'Verificando...'
                            : 'Verificar / Activar cuenta'}
                        </button>
                      ) : (
                        <Etiqueta variante="activa">
                          Cuenta activa
                        </Etiqueta>
                      )}
                    </div>
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
