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
  ofertas: true,
  postulaciones: true,
  admin: false,
}
