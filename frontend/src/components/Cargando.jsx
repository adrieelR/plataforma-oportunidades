export default function Cargando({ texto = 'Cargando...' }) {
  return (
    <span className="cargando" role="status">
      {texto}
    </span>
  )
}
