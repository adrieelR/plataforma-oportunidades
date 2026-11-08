import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import Mensaje from './Mensaje'

export default function RutaProtegida({ roles, children }) {
  const { estaAutenticado, rol } = useAuth()
  const location = useLocation()

  if (!estaAutenticado) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ desde: `${location.pathname}${location.search}` }}
      />
    )
  }

  if (roles && !roles.includes(rol)) {
    return (
      <section className="pagina">
        <Mensaje tipo="error" titulo="Acceso denegado">
          Tu rol no tiene permiso para entrar a esta sección.
        </Mensaje>
      </section>
    )
  }

  return children
}
