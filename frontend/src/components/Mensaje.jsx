export default function Mensaje({ tipo = 'info', titulo, children }) {
  return (
    <div
      className={`mensaje mensaje--${tipo}`}
      role={tipo === 'error' ? 'alert' : 'status'}
    >
      {titulo && <strong className="mensaje__titulo">{titulo}</strong>}
      {children && <div className="mensaje__texto">{children}</div>}
    </div>
  )
}
