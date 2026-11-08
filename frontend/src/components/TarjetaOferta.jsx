import { Link } from 'react-router-dom'
import {
  ETIQUETA_MODALIDAD,
  ETIQUETA_TIPO,
  formatearFecha,
} from '../utils/formato'
import Avatar from './Avatar'
import Etiqueta from './Etiqueta'
import Icono from './Icono'

export default function TarjetaOferta({ oferta }) {
  const empresa = oferta.empresa?.razonSocial || 'Empresa'

  return (
    <article className="tarjeta-oferta">
      <div className="tarjeta-oferta__cabecera">
        <Avatar nombre={empresa} tamano="md" />
        <div className="tarjeta-oferta__empresa-datos">
          <p className="tarjeta-oferta__empresa">{empresa}</p>
          <p className="tarjeta-oferta__ubicacion">
            <Icono nombre="ubicacion" tamano={15} />
            {oferta.ubicacion}
          </p>
        </div>
        <Etiqueta variante="tipo">
          {ETIQUETA_TIPO[oferta.tipo] || oferta.tipo}
        </Etiqueta>
      </div>

      <h2 className="tarjeta-oferta__titulo">
        <Link to={`/ofertas/${oferta.id}`}>{oferta.titulo}</Link>
      </h2>

      <p className="tarjeta-oferta__descripcion">{oferta.descripcion}</p>

      <ul className="tarjeta-oferta__datos">
        <li>
          <Icono nombre="reloj" tamano={15} />
          {ETIQUETA_MODALIDAD[oferta.modalidad] || oferta.modalidad}
        </li>
        <li>
          <Icono nombre="usuarios" tamano={15} />
          {oferta.cupos} {oferta.cupos === 1 ? 'cupo' : 'cupos'}
        </li>
      </ul>

      <footer className="tarjeta-oferta__pie">
        <span className="tarjeta-oferta__fecha">
          <Icono nombre="calendario" tamano={15} />
          Hasta {formatearFecha(oferta.fechaLimite)}
        </span>
        <Link
          to={`/ofertas/${oferta.id}`}
          className="boton boton--secundario boton--pequeno"
        >
          Ver detalle
        </Link>
      </footer>
    </article>
  )
}
