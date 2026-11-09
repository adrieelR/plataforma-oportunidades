import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { editarOferta, listarMisOfertas } from '../api/ofertas'
import Cargando from '../components/Cargando'
import FormularioOferta from '../components/FormularioOferta'
import Icono from '../components/Icono'
import Mensaje from '../components/Mensaje'
import { useAuth } from '../context/useAuth'
import {
  ESTADOS_OFERTA_EDITABLES,
  mensajeAprobacionEmpresa,
} from '../utils/formato'

function valoresDesdeOferta(oferta) {
  return {
    titulo: oferta.titulo || '',
    descripcion: oferta.descripcion || '',
    tipo: oferta.tipo || 'PRACTICA',
    modalidad: oferta.modalidad || 'PRESENCIAL',
    area: oferta.area || '',
    ubicacion: oferta.ubicacion || '',
    cupos: oferta.cupos == null ? '' : String(oferta.cupos),
    fechaLimite: oferta.fechaLimite ? oferta.fechaLimite.slice(0, 10) : '',
  }
}

export default function EditarOferta() {
  const { id } = useParams()
  const { perfil, cargandoPerfil } = useAuth()
  const navigate = useNavigate()
  const [oferta, setOferta] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    listarMisOfertas()
      .then((respuesta) => {
        if (!activo) {
          return
        }

        const encontrada = respuesta.ofertas.find(
          (item) => item.id === Number(id),
        )

        if (encontrada) {
          setOferta(encontrada)
        } else {
          setError('La oferta no existe o no tienes permiso para editarla.')
        }
      })
      .catch((fallo) => {
        if (activo) {
          setError(fallo?.mensaje || 'No se pudo cargar la oferta.')
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
  }, [id])

  const guardar = async (datos) => {
    await editarOferta(id, datos)
    navigate('/empresa/ofertas', {
      replace: true,
      state: { mensaje: 'Oferta actualizada correctamente.' },
    })
  }

  if (cargandoPerfil || cargando) {
    return (
      <section className="pagina">
        <div className="cargando-pagina">
          <Cargando texto="Cargando oferta..." />
        </div>
      </section>
    )
  }

  if (perfil?.estadoAprobacion !== 'APROBADA') {
    const rechazada = perfil?.estadoAprobacion === 'RECHAZADA'

    return (
      <section className="pagina">
        <Mensaje tipo={rechazada ? 'error' : 'info'}>
          {mensajeAprobacionEmpresa(perfil?.estadoAprobacion)}
        </Mensaje>
        <Link to="/empresa/ofertas" className="boton boton--secundario">
          Volver a mis ofertas
        </Link>
      </section>
    )
  }

  if (error || !oferta) {
    return (
      <section className="pagina">
        <Mensaje tipo="error">{error || 'La oferta no existe.'}</Mensaje>
        <Link to="/empresa/ofertas" className="boton boton--secundario">
          Volver a mis ofertas
        </Link>
      </section>
    )
  }

  if (!ESTADOS_OFERTA_EDITABLES.includes(oferta.estado)) {
    return (
      <section className="pagina">
        <Mensaje tipo="info">
          Solo se pueden editar ofertas publicadas o en borrador.
        </Mensaje>
        <Link to="/empresa/ofertas" className="boton boton--secundario">
          Volver a mis ofertas
        </Link>
      </section>
    )
  }

  return (
    <section className="pagina">
      <Link to="/empresa/ofertas" className="enlace-volver">
        <Icono nombre="volver" tamano={17} />
        Volver a mis ofertas
      </Link>

      <header className="pagina__encabezado">
        <p className="pagina__etiqueta">Editar publicación</p>
        <h1>Editar oferta</h1>
        <p>Actualiza los datos de la oportunidad.</p>
      </header>

      <FormularioOferta
        valoresIniciales={valoresDesdeOferta(oferta)}
        onGuardar={guardar}
        textoBoton="Guardar cambios"
        textoEnviando="Guardando..."
        rutaCancelar="/empresa/ofertas"
      />
    </section>
  )
}
