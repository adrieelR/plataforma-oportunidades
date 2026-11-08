import { Link } from 'react-router-dom'

export default function NoEncontrada() {
  return (
    <section className="pagina">
      <header className="pagina__encabezado">
        <h1>Página no encontrada</h1>
        <p>La dirección que abriste no existe o fue movida.</p>
      </header>

      <Link to="/" className="boton boton--primario">
        Volver al inicio
      </Link>
    </section>
  )
}
