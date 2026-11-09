import { useEffect, useState } from 'react'
import { decidirEmpresa, listarEmpresas } from '../api/admin'
import Avatar from '../components/Avatar'
import Cargando from '../components/Cargando'
import EstadoVacio from '../components/EstadoVacio'
import Etiqueta from '../components/Etiqueta'
import Icono from '../components/Icono'
import Mensaje from '../components/Mensaje'
import { ETIQUETA_APROBACION, varianteEstado } from '../utils/formato'

export default function AdminEmpresas() {
  const [empresas, setEmpresas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [procesandoId, setProcesandoId] = useState(null)

  useEffect(() => {
    let activo = true

    listarEmpresas({ estado: 'PENDIENTE' })
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
  }, [])

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
    } finally {
      setProcesandoId(null)
    }
  }

  return (
    <section className="pagina">
      <header className="pagina__encabezado pagina__encabezado--fila">
        <div>
          <p className="pagina__etiqueta">Panel de administración</p>
          <h1>Empresas pendientes</h1>
          <p>Revisa y decide la aprobación de las empresas registradas.</p>
        </div>
        {!cargando && (
          <div className="pagina__resumen">
            <span className="resumen-dato__valor">{empresas.length}</span>
            <span className="resumen-dato__texto">
              {empresas.length === 1 ? 'empresa por revisar' : 'empresas por revisar'}
            </span>
          </div>
        )}
      </header>

      {mensaje && <Mensaje tipo="exito">{mensaje}</Mensaje>}
      {error && <Mensaje tipo="error">{error}</Mensaje>}

      {cargando && (
        <div className="cargando-pagina">
          <Cargando texto="Cargando empresas..." />
        </div>
      )}

      {!cargando && !error && empresas.length === 0 && (
        <EstadoVacio>No hay empresas pendientes de revisión.</EstadoVacio>
      )}

      {!cargando && !error && empresas.length > 0 && (
        <div className="lista-empresas">
          {empresas.map((empresa) => (
            <article className="empresa-pendiente panel" key={empresa.id}>
              <div className="empresa-pendiente__cabecera">
                <Avatar nombre={empresa.razonSocial} tamano="lg" />
                <div className="empresa-pendiente__identidad">
                  <h2>{empresa.razonSocial}</h2>
                  <p>{empresa.rubro}</p>
                </div>
                <Etiqueta variante={varianteEstado(empresa.estadoAprobacion)}>
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
    </section>
  )
}
