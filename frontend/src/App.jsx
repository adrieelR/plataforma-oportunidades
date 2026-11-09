import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import RutaProtegida from './components/RutaProtegida'
import { useAuth } from './context/useAuth'
import AdminEmpresas from './pages/AdminEmpresas'
import DetalleOferta from './pages/DetalleOferta'
import EditarOferta from './pages/EditarOferta'
import EmpresaOfertas from './pages/EmpresaOfertas'
import InicioPublico from './pages/InicioPublico'
import Login from './pages/Login'
import MisPostulaciones from './pages/MisPostulaciones'
import NoEncontrada from './pages/NoEncontrada'
import NuevaOferta from './pages/NuevaOferta'
import Ofertas from './pages/Ofertas'
import PostulacionesDeOferta from './pages/PostulacionesDeOferta'
import RegistroEmpresa from './pages/RegistroEmpresa'
import RegistroEstudiante from './pages/RegistroEstudiante'
import Verificar from './pages/Verificar'
import { inicioSegunRol } from './utils/roles'

function Inicio() {
  const { estaAutenticado, rol } = useAuth()

  if (estaAutenticado) {
    return <Navigate to={inicioSegunRol(rol)} replace />
  }

  return <InicioPublico />
}

export default function App() {
  return (
    <>
      <a href="#contenido" className="saltar-contenido">
        Saltar al contenido
      </a>
      <Navbar />
      <main className="contenido" id="contenido">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<RegistroEstudiante />} />
          <Route path="/registro-empresa" element={<RegistroEmpresa />} />
          <Route path="/verificar" element={<Verificar />} />

          <Route
            path="/ofertas"
            element={
              <RutaProtegida roles={['ESTUDIANTE']}>
                <Ofertas />
              </RutaProtegida>
            }
          />
          <Route
            path="/ofertas/:id"
            element={
              <RutaProtegida roles={['ESTUDIANTE']}>
                <DetalleOferta />
              </RutaProtegida>
            }
          />
          <Route
            path="/mis-postulaciones"
            element={
              <RutaProtegida roles={['ESTUDIANTE']}>
                <MisPostulaciones />
              </RutaProtegida>
            }
          />

          <Route
            path="/empresa/ofertas"
            element={
              <RutaProtegida roles={['EMPRESA']}>
                <EmpresaOfertas />
              </RutaProtegida>
            }
          />
          <Route
            path="/empresa/ofertas/nueva"
            element={
              <RutaProtegida roles={['EMPRESA']}>
                <NuevaOferta />
              </RutaProtegida>
            }
          />
          <Route
            path="/empresa/ofertas/:id/editar"
            element={
              <RutaProtegida roles={['EMPRESA']}>
                <EditarOferta />
              </RutaProtegida>
            }
          />
          <Route
            path="/empresa/ofertas/:id/postulaciones"
            element={
              <RutaProtegida roles={['EMPRESA']}>
                <PostulacionesDeOferta />
              </RutaProtegida>
            }
          />

          <Route
            path="/admin/empresas"
            element={
              <RutaProtegida roles={['ADMINISTRADOR']}>
                <AdminEmpresas />
              </RutaProtegida>
            }
          />

          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </main>
    </>
  )
}
