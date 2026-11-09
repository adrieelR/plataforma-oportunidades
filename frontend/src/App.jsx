import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import RutaProtegida from './components/RutaProtegida'
import { useAuth } from './context/useAuth'
import EnConstruccion from './pages/EnConstruccion'
import Login from './pages/Login'
import NoEncontrada from './pages/NoEncontrada'
import RegistroEstudiante from './pages/RegistroEstudiante'
import { inicioSegunRol } from './utils/roles'

function Inicio() {
  const { estaAutenticado, rol } = useAuth()
  const destino = estaAutenticado ? inicioSegunRol(rol) : '/login'
  return <Navigate to={destino} replace />
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="contenido">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<RegistroEstudiante />} />

          <Route
            path="/ofertas"
            element={
              <RutaProtegida roles={['ESTUDIANTE']}>
                <EnConstruccion
                  titulo="Ofertas"
                  descripcion="Aquí verás las prácticas, empleos, capacitaciones y servicios disponibles."
                />
              </RutaProtegida>
            }
          />
          <Route
            path="/mis-postulaciones"
            element={
              <RutaProtegida roles={['ESTUDIANTE']}>
                <EnConstruccion
                  titulo="Mis postulaciones"
                  descripcion="Aquí podrás revisar el estado de cada postulación."
                />
              </RutaProtegida>
            }
          />

          <Route
            path="/empresa/ofertas"
            element={
              <RutaProtegida roles={['EMPRESA']}>
                <EnConstruccion
                  titulo="Mis ofertas"
                  descripcion="Aquí administrarás las ofertas publicadas por tu empresa."
                />
              </RutaProtegida>
            }
          />
          <Route
            path="/empresa/ofertas/nueva"
            element={
              <RutaProtegida roles={['EMPRESA']}>
                <EnConstruccion
                  titulo="Nueva oferta"
                  descripcion="Aquí crearás una nueva oferta para los estudiantes."
                />
              </RutaProtegida>
            }
          />

          <Route
            path="/admin/empresas"
            element={
              <RutaProtegida roles={['ADMINISTRADOR']}>
                <EnConstruccion
                  titulo="Empresas"
                  descripcion="Aquí aprobarás o rechazarás las empresas registradas."
                />
              </RutaProtegida>
            }
          />

          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </main>
    </>
  )
}
