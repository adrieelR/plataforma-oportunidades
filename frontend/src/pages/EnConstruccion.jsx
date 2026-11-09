export default function EnConstruccion({ titulo, descripcion }) {
  return (
    <section className="pagina">
      <header className="pagina__encabezado">
        <h1>{titulo}</h1>
        {descripcion && <p>{descripcion}</p>}
      </header>

      <div className="panel">
        <p>Esta sección está en construcción.</p>
      </div>
    </section>
  )
}
