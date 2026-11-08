const PALETAS = [
  { fondo: '#e8f1fb', texto: '#0a4c91' },
  { fondo: '#e6f4f1', texto: '#0b5f58' },
  { fondo: '#f1edf9', texto: '#5b3f9e' },
  { fondo: '#fff1e3', texto: '#8a4b12' },
  { fondo: '#fdebec', texto: '#9b2c2c' },
  { fondo: '#edf4e8', texto: '#3f6b2a' },
]

function obtenerIniciales(nombre) {
  const limpio = nombre.trim()

  if (!limpio) {
    return '?'
  }

  const partes = limpio.split(/\s+/).filter(Boolean)

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase()
  }

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

function obtenerPaleta(nombre) {
  let hash = 0

  for (const caracter of nombre) {
    hash = (hash * 31 + caracter.charCodeAt(0)) >>> 0
  }

  return PALETAS[hash % PALETAS.length]
}

export default function Avatar({
  nombre = '',
  persona = false,
  tamano = 'md',
  className = '',
}) {
  const paleta = obtenerPaleta(nombre || '?')
  const clases = [
    'avatar',
    `avatar--${tamano}`,
    persona ? 'avatar--persona' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      className={clases}
      style={{ backgroundColor: paleta.fondo, color: paleta.texto }}
      aria-hidden="true"
    >
      {obtenerIniciales(nombre)}
    </span>
  )
}
