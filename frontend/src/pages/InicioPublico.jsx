import { Link } from 'react-router-dom'
import Avatar from '../components/Avatar'
import Etiqueta from '../components/Etiqueta'
import Icono from '../components/Icono'
import './InicioPublico.css'

const PASOS = [
  {
    titulo: 'Crea tu cuenta',
    texto:
      'Regístrate con tus datos y, si eres estudiante, usa tu correo institucional.',
  },
  {
    titulo: 'Explora y postula',
    texto:
      'Revisa las oportunidades vigentes y envía tu postulación o inscripción.',
  },
  {
    titulo: 'Sigue el proceso',
    texto:
      'Consulta el estado de cada postulación desde tu panel personal.',
  },
]

const TIPOS = [
  {
    icono: 'maletin',
    titulo: 'Prácticas',
    texto: 'Primera experiencia profesional con acompañamiento.',
  },
  {
    icono: 'empresa',
    titulo: 'Empleos',
    texto: 'Oportunidades laborales para comenzar o avanzar.',
  },
  {
    icono: 'documento',
    titulo: 'Capacitaciones',
    texto: 'Cursos y programas para desarrollar nuevas habilidades.',
  },
  {
    icono: 'usuarios',
    titulo: 'Servicios',
    texto: 'Proyectos y servicios puntuales para sumar experiencia.',
  },
]

const CONFIANZA = [
  {
    icono: 'correo',
    titulo: 'Correo institucional',
    texto:
      'Los estudiantes se registran con su correo de educación superior.',
  },
  {
    icono: 'escudo',
    titulo: 'Empresas revisadas',
    texto:
      'Cada empresa pasa por aprobación antes de publicar ofertas.',
  },
  {
    icono: 'check',
    titulo: 'Estados claros',
    texto: 'Cada postulación muestra su avance en todo momento.',
  },
]

export default function InicioPublico() {
  return (
    <div className="inicio">
      <section className="inicio-hero">
        <div className="inicio-hero__contenido">
          <p className="inicio-hero__etiqueta">
            Oportunidades para estudiantes de educación superior
          </p>
          <h1>Tu primera oportunidad empieza aquí</h1>
          <p className="inicio-hero__texto">
            Prácticas, empleos, capacitaciones y servicios en un solo lugar.
            Conecta con empresas y sigue cada postulación de forma simple.
          </p>

          <div className="inicio-hero__acciones">
            <Link
              to="/registro"
              className="boton boton--primario"
            >
              Crear cuenta
            </Link>
            <Link
              to="/registro-empresa"
              className="boton boton--secundario"
            >
              Soy empresa
            </Link>
          </div>

          <p className="inicio-hero__sesion">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>

        <div className="inicio-hero__visual" aria-hidden="true">
          <div className="inicio-mock__oferta">
            <div className="inicio-mock__cabecera">
              <Avatar nombre="Innovación Digital SpA" tamano="md" />
              <div className="inicio-mock__empresa">
                <strong>Innovación Digital SpA</strong>
                <span>
                  <Icono nombre="ubicacion" tamano={14} /> Santiago
                </span>
              </div>
              <Etiqueta variante="tipo">Práctica</Etiqueta>
            </div>
            <strong className="inicio-mock__titulo">
              Práctica en Desarrollo Web
            </strong>
            <div className="inicio-mock__meta">
              <span>
                <Icono nombre="reloj" tamano={14} /> Híbrida
              </span>
              <span>
                <Icono nombre="usuarios" tamano={14} /> 3 cupos
              </span>
            </div>
            <span className="inicio-mock__boton">Postular</span>
          </div>

          <div className="inicio-mock__estado">
            <span className="inicio-mock__estado-icono">
              <Icono nombre="check" tamano={18} />
            </span>
            <div>
              <strong>Postulación enviada</strong>
              <span>Tu postulación fue registrada.</span>
            </div>
          </div>

          <div className="inicio-mock__verificada">
            <Avatar nombre="Innova Capacita" tamano="sm" />
            <div>
              <strong>Empresa verificada</strong>
              <span>Revisada por administración</span>
            </div>
          </div>
        </div>
      </section>

      <section className="inicio-seccion" aria-labelledby="inicio-para-quien">
        <header className="inicio-seccion__cabecera">
          <p className="pagina__etiqueta">Para estudiantes y empresas</p>
          <h2 id="inicio-para-quien">Una plataforma pensada para ambos lados</h2>
          <p>
            Estudiantes encuentran oportunidades; empresas encuentran talento.
          </p>
        </header>

        <div className="inicio-roles">
          <article className="inicio-rol panel">
            <span className="inicio-rol__icono">
              <Icono nombre="documento" tamano={22} />
            </span>
            <h3>Para estudiantes</h3>
            <p>
              Crea tu cuenta con correo institucional, explora ofertas vigentes
              y postula en pocos pasos.
            </p>
            <ul>
              <li>
                <Icono nombre="check" tamano={15} />
                Prácticas, empleos y capacitaciones
              </li>
              <li>
                <Icono nombre="check" tamano={15} />
                Postulación simple desde el detalle
              </li>
              <li>
                <Icono nombre="check" tamano={15} />
                Seguimiento de cada estado
              </li>
            </ul>
            <Link to="/registro" className="inicio-rol__enlace">
              Crear cuenta de estudiante
            </Link>
          </article>

          <article className="inicio-rol panel">
            <span className="inicio-rol__icono">
              <Icono nombre="empresa" tamano={22} />
            </span>
            <h3>Para empresas</h3>
            <p>
              Registra tu empresa, publica oportunidades y gestiona las
              postulaciones que recibes.
            </p>
            <ul>
              <li>
                <Icono nombre="check" tamano={15} />
                Publica ofertas con fecha límite
              </li>
              <li>
                <Icono nombre="check" tamano={15} />
                Revisa los datos de cada candidato
              </li>
              <li>
                <Icono nombre="check" tamano={15} />
                Actualiza el estado de las postulaciones
              </li>
            </ul>
            <Link to="/registro-empresa" className="inicio-rol__enlace">
              Registrar mi empresa
            </Link>
          </article>
        </div>
      </section>

      <section className="inicio-seccion" aria-labelledby="inicio-como-funciona">
        <header className="inicio-seccion__cabecera">
          <p className="pagina__etiqueta">Cómo funciona</p>
          <h2 id="inicio-como-funciona">Tres pasos para comenzar</h2>
          <p>
            Un flujo claro para que puedas concentrarte en la oportunidad, no
            en la plataforma.
          </p>
        </header>

        <ol className="inicio-pasos">
          {PASOS.map((paso, indice) => (
            <li className="inicio-paso panel" key={paso.titulo}>
              <span className="inicio-paso__numero">{indice + 1}</span>
              <h3>{paso.titulo}</h3>
              <p>{paso.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="inicio-seccion" aria-labelledby="inicio-tipos">
        <header className="inicio-seccion__cabecera">
          <p className="pagina__etiqueta">Tipos de oportunidad</p>
          <h2 id="inicio-tipos">Encuentra la experiencia que buscas</h2>
          <p>
            Desde tu primera práctica hasta capacitaciones para seguir
            creciendo.
          </p>
        </header>

        <div className="inicio-tipos">
          {TIPOS.map((tipo) => (
            <article className="inicio-tipo panel" key={tipo.titulo}>
              <span className="inicio-tipo__icono">
                <Icono nombre={tipo.icono} tamano={20} />
              </span>
              <h3>{tipo.titulo}</h3>
              <p>{tipo.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="inicio-confianza panel" aria-labelledby="inicio-confianza">
        <div className="inicio-confianza__texto">
          <p className="pagina__etiqueta">Confianza</p>
          <h2 id="inicio-confianza">Información clara desde el primer paso</h2>
          <p>
            La plataforma está pensada para que estudiantes y empresas se
            conecten con reglas simples y visibles.
          </p>
        </div>

        <ul className="inicio-confianza__lista">
          {CONFIANZA.map((item) => (
            <li key={item.titulo}>
              <span className="inicio-confianza__icono">
                <Icono nombre={item.icono} tamano={19} />
              </span>
              <div>
                <strong>{item.titulo}</strong>
                <span>{item.texto}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="inicio-cta">
        <div>
          <p className="inicio-cta__etiqueta">Da el siguiente paso</p>
          <h2>¿Listo para comenzar?</h2>
          <p>
            Crea tu cuenta o registra tu empresa y empieza a conectar con
            nuevas oportunidades.
          </p>
        </div>
        <div className="inicio-cta__acciones">
          <Link to="/registro" className="boton boton--primario">
            Crear cuenta
          </Link>
          <Link to="/registro-empresa" className="boton boton--secundario">
            Registrar empresa
          </Link>
        </div>
      </section>
    </div>
  )
}
