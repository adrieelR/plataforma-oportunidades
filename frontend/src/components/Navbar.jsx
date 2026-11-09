import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { ETIQUETA_ROL, inicioSegunRol } from '../utils/roles'
import Avatar from './Avatar'
import Icono from './Icono'
import './Navbar.css'

const ENLACES_POR_ROL = {
  ESTUDIANTE: [
    { to: '/ofertas', texto: 'Ofertas', icono: 'maletin' },
    { to: '/mis-postulaciones', texto: 'Mis postulaciones', icono: 'documento' },
  ],
  EMPRESA: [
    { to: '/empresa/ofertas', texto: 'Mis ofertas', icono: 'empresa' },
    { to: '/empresa/ofertas/nueva', texto: 'Nueva oferta', icono: 'mas' },
  ],
  ADMINISTRADOR: [
    { to: '/admin/empresas', texto: 'Empresas', icono: 'escudo' },
  ],
}

export default function Navbar() {
  const { estaAutenticado, usuario, perfil, rol, logout } = useAuth()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const enlaces = rol ? ENLACES_POR_ROL[rol] || [] : []
  const destinoMarca = estaAutenticado ? inicioSegunRol(rol) : '/'
  const nombreVisible = perfil?.nombres
    ? `${perfil.nombres} ${perfil.apellidos}`
    : perfil?.razonSocial ||
      perfil?.nombre ||
      usuario?.correo ||
      'Mi cuenta'

  const manejarSalir = () => {
    logout()
    setMenuAbierto(false)
    navigate('/login', { replace: true })
  }

  const cerrarMenu = () => setMenuAbierto(false)

  return (
    <header className="navbar">
      <div className="navbar__contenido">
        <NavLink
          to={destinoMarca}
          className="navbar__marca"
          onClick={cerrarMenu}
          aria-label="Ir al inicio de la plataforma"
        >
          <span className="navbar__logo" aria-hidden="true">
            PO
          </span>
          <span className="navbar__marca-texto">
            <span className="navbar__marca-prefijo">Plataforma&nbsp;</span>
            <strong>Oportunidades</strong>
          </span>
        </NavLink>

        <button
          type="button"
          className="navbar__toggle"
          aria-expanded={menuAbierto}
          aria-controls="menu-principal"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
        >
          <Icono nombre={menuAbierto ? 'cerrar' : 'menu'} tamano={18} />
          <span>{menuAbierto ? 'Cerrar' : 'Menú'}</span>
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
                    onClick={cerrarMenu}
                  >
                    <Icono nombre={enlace.icono} tamano={17} />
                    {enlace.texto}
                  </NavLink>
                ))}
              </div>

              <div className="navbar__sesion">
                <div className="navbar__usuario" title={usuario?.correo}>
                  <Avatar
                    nombre={nombreVisible}
                    persona={rol === 'ESTUDIANTE'}
                    tamano="sm"
                  />
                  <span className="navbar__usuario-datos">
                    <span className="navbar__correo">{nombreVisible}</span>
                    <span className="navbar__rol">
                      {ETIQUETA_ROL[rol] || rol}
                    </span>
                  </span>
                </div>
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
            <div className="navbar__enlaces navbar__enlaces--publico">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `navbar__enlace${isActive ? ' navbar__enlace--activo' : ''}`
                }
                onClick={cerrarMenu}
              >
                Inicio
              </NavLink>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `navbar__enlace${isActive ? ' navbar__enlace--activo' : ''}`
                }
                onClick={cerrarMenu}
              >
                Iniciar sesión
              </NavLink>
              <NavLink
                to="/registro"
                className={({ isActive }) =>
                  `navbar__enlace${isActive ? ' navbar__enlace--activo' : ''}`
                }
                onClick={cerrarMenu}
              >
                Crear cuenta
              </NavLink>
              <NavLink
                to="/registro-empresa"
                className={({ isActive }) =>
                  `navbar__enlace${isActive ? ' navbar__enlace--activo' : ''}`
                }
                onClick={cerrarMenu}
              >
                Soy empresa
              </NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
