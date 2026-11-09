import { Link, useNavigate } from 'react-router-dom'
import { crearOferta } from '../api/ofertas'
import Cargando from '../components/Cargando'
import FormularioOferta from '../components/FormularioOferta'
import Icono from '../components/Icono'
import Mensaje from '../components/Mensaje'
import { useAuth } from '../context/useAuth'
import { mensajeAprobacionEmpresa } from '../utils/formato'

const FORMULARIO_OFERTA_INICIAL = {
  titulo: '',
  descripcion: '',
  tipo: 'PRACTICA',
  modalidad: 'PRESENCIAL',
  area: '',
  ubicacion: '',
  cupos: '',
  fechaLimite: '',
}

export default function NuevaOferta() {
  const { perfil, cargandoPerfil } = useAuth()
  const navigate = useNavigate()
  const empresaAprobada = perfil?.estadoAprobacion === 'APROBADA'

  const guardar = async (datos) => {
    await crearOferta(datos)
    navigate('/empresa/ofertas', {
      replace: true,
      state: { mensaje: 'Oferta publicada correctamente.' },
    })
  }

  if (cargandoPerfil) {
    return (
      <section className="pagina">
        <div className="cargando-pagina">
          <Cargando texto="Cargando perfil de la empresa..." />
        </div>
      </section>
    )
  }

  if (!empresaAprobada) {
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

  return (
    <section className="pagina">
      <Link to="/empresa/ofertas" className="enlace-volver">
        <Icono nombre="volver" tamano={17} />
        Volver a mis ofertas
      </Link>

      <header className="pagina__encabezado">
        <p className="pagina__etiqueta">Nueva publicación</p>
        <h1>Nueva oferta</h1>
        <p>Completa los datos para publicar una nueva oportunidad.</p>
      </header>

      <FormularioOferta
        valoresIniciales={FORMULARIO_OFERTA_INICIAL}
        onGuardar={guardar}
        textoBoton="Publicar oferta"
        textoEnviando="Publicando..."
        rutaCancelar="/empresa/ofertas"
      />
    </section>
  )
}
