export default function Etiqueta({ variante = 'neutro', children }) {
  return <span className={`etiqueta etiqueta--${variante}`}>{children}</span>
}
