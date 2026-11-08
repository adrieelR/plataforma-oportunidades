export const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Interruptor por endpoint. El login seguirá simulado hasta que el backend
// implemente POST /auth/login. El registro ya usa la API real.
export const usarMock = {
  login: true,
  registro: false,
}
