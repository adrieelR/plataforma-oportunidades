import { Link } from 'react-router-dom'
import Icono from './Icono'
import '../pages/auth.css'

const BENEFICIOS = [
  { icono: 'empresa', texto: 'Empresas y ofertas verificadas' },
  { icono: 'maletin', texto: 'Prácticas, empleos y capacitaciones' },
  { icono: 'check', texto: 'Postula y sigue cada estado en un solo lugar' },
]

export default function AuthLayout({
  titulo,
  descripcion,
  ancho = false,
  marcaTitulo = 'Tu próxima oportunidad empieza aquí',
  marcaTexto = 'Un espacio simple para conectar estudiantes con empresas que están buscando talento.',
  children,
}) {
  return (
    <section className="auth">
      <aside className="auth__marca">
        <Link to="/login" className="auth__marca-logo">
          <span className="auth__marca-icono" aria-hidden="true">
            PO
          </span>
          <span>Plataforma de Oportunidades</span>
        </Link>

        <div className="auth__marca-contenido">
          <p className="auth__marca-etiqueta">Comunidad de oportunidades</p>
          <h2>{marcaTitulo}</h2>
          <p>{marcaTexto}</p>
          <ul className="auth__beneficios">
            {BENEFICIOS.map((beneficio) => (
              <li key={beneficio.texto}>
                <Icono nombre={beneficio.icono} tamano={18} />
                {beneficio.texto}
              </li>
            ))}
          </ul>
        </div>

        <p className="auth__marca-pie">
          Prototipo académico para estudiantes de educación superior.
        </p>
      </aside>

      <div className={`auth__panel${ancho ? ' auth__panel--ancho' : ''}`}>
        <header className="auth__encabezado">
          <h1>{titulo}</h1>
          {descripcion && <p>{descripcion}</p>}
        </header>
        {children}
      </div>
    </section>
  )
}
