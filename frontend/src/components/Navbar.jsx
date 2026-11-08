import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { ETIQUETA_ROL, inicioSegunRol } from '../utils/roles'
import './Navbar.css'

const ENLACES_POR_ROL = {
  ESTUDIANTE: [
    { to: '/ofertas', texto: 'Ofertas' },
    { to: '/mis-postulaciones', texto: 'Mis postulaciones' },
  ],
  EMPRESA: [
    { to: '/empresa/ofertas', texto: 'Mis ofertas' },
    { to: '/empresa/ofertas/nueva', texto: 'Nueva oferta' },
  ],
  ADMINISTRADOR: [
    { to: '/admin/empresas', texto: 'Empresas' },
  ],
}

export default function Navbar() {
  const { estaAutenticado, usuario, rol, logout } = useAuth()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const enlaces = rol ? ENLACES_POR_ROL[rol] || [] : []
  const destinoMarca = estaAutenticado ? inicioSegunRol(rol) : '/login'

  const manejarSalir = () => {
    logout()
    setMenuAbierto(false)
    navigate('/login', { replace: true })
  }

  return (
    <header className="navbar">
      <div className="navbar__contenido">
        <NavLink
          to={destinoMarca}
          className="navbar__marca"
          onClick={() => setMenuAbierto(false)}
        >
          Plataforma de Oportunidades
        </NavLink>

        <button
          type="button"
          className="navbar__toggle"
          aria-expanded={menuAbierto}
          aria-controls="menu-principal"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
        >
          {menuAbierto ? 'Cerrar menú' : 'Menú'}
        </button>

        <nav
          id="menu-principal"
          className={`navbar__menu${menuAbierto ? ' navbar__menu--abierto' : ''}`}
        >
          {estaAutenticado ? (
            <>
              <div className="navbar__enlaces">
                {enlaces.map((enlace) => (
                  <NavLink
                    key={enlace.to}
                    to={enlace.to}
                    className={({ isActive }) =>
                      `navbar__enlace${isActive ? ' navbar__enlace--activo' : ''}`
                    }
                    onClick={() => setMenuAbierto(false)}
                  >
                    {enlace.texto}
                  </NavLink>
                ))}
              </div>

              <div className="navbar__sesion">
                <span className="navbar__usuario">
                  <span className="navbar__correo">{usuario?.correo}</span>
                  <span className="navbar__rol">
                    {ETIQUETA_ROL[rol] || rol}
                  </span>
                </span>
                <button
                  type="button"
                  className="boton boton--secundario boton--pequeno"
                  onClick={manejarSalir}
                >
                  Cerrar sesión
                </button>
              </div>
            </>
          ) : (
            <div className="navbar__enlaces">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `navbar__enlace${isActive ? ' navbar__enlace--activo' : ''}`
                }
                onClick={() => setMenuAbierto(false)}
              >
                Iniciar sesión
              </NavLink>
              <NavLink
                to="/registro"
                className={({ isActive }) =>
                  `navbar__enlace${isActive ? ' navbar__enlace--activo' : ''}`
                }
                onClick={() => setMenuAbierto(false)}
              >
                Crear cuenta
              </NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
