export const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Interruptor por endpoint. Los endpoints marcados como PRÓXIMOS en el
// contrato siguen simulados hasta que el backend los implemente.
export const usarMock = {
  login: false,
  registro: false,
  registroEmpresa: false,
  verificar: true,
  perfil: false,
  // Detalle de oferta: GET /busqueda/ofertas/:id (ESTUDIANTE).
  ofertas: false,
  ofertasEmpresa: false,
  busqueda: false,
  postular: false,
  misPostulaciones: false,
  postulacionesDeOferta: false,
  cambiarEstadoPostulacion: false,
  admin: false,
  ofertasAdmin: false,
  moderarOferta: false,
  usuariosAdmin: false,
  suspenderCuenta: false,
  verificarEstudiante: false,
  // Reportes (RF-13): endpoints reales, sin simulación.
  reportar: false,
  reportesAdmin: false,
}

// HU-10: la API aún no expone endpoints para listar/leer notificaciones.
// Se mantiene en false para no llamar rutas inexistentes.
export const notificacionesDisponibles = false
