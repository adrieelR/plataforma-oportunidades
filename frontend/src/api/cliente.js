import { API_URL } from './config'

export const CLAVE_TOKEN = 'plataforma_token'
export const CLAVE_USUARIO = 'plataforma_usuario'

export class ErrorApi extends Error {
  constructor(mensaje, estado, errores = []) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.mensaje = mensaje
    this.estado = estado
    this.errores = errores
  }
}

export function obtenerToken() {
  return localStorage.getItem(CLAVE_TOKEN)
}

export function obtenerUsuarioGuardado() {
  const guardado = localStorage.getItem(CLAVE_USUARIO)
  if (!guardado) {
    return null
  }

  try {
    return JSON.parse(guardado)
  } catch {
    localStorage.removeItem(CLAVE_USUARIO)
    return null
  }
}

export function guardarSesion({ token, usuario }) {
  // En este prototipo el token se guarda en localStorage de forma consciente.
  // No se deben guardar contraseñas ni datos sensibles en el navegador.
  localStorage.setItem(CLAVE_TOKEN, token)
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario))
}

export function borrarSesion() {
  localStorage.removeItem(CLAVE_TOKEN)
  localStorage.removeItem(CLAVE_USUARIO)
}

function construirUrl(ruta, params) {
  const base = API_URL.replace(/\/$/, '')
  const rutaLimpia = ruta.startsWith('/') ? ruta : `/${ruta}`
  const url = new URL(`${base}${rutaLimpia}`)

  if (params) {
    Object.entries(params).forEach(([clave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== '') {
        url.searchParams.set(clave, valor)
      }
    })
  }

  return url.toString()
}

async function leerCuerpo(respuesta) {
  const texto = await respuesta.text()
  if (!texto) {
    return null
  }

  try {
    return JSON.parse(texto)
  } catch {
    return { mensaje: texto }
  }
}

export async function peticion(
  ruta,
  { metodo = 'GET', cuerpo, params, noExpirarSesion = false } = {},
) {
  const token = obtenerToken()
  const headers = { Accept: 'application/json' }

  if (cuerpo !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let respuesta
  try {
    respuesta = await fetch(construirUrl(ruta, params), {
      method: metodo,
      headers,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    })
  } catch {
    throw new ErrorApi(
      'No se pudo conectar con la API. Revisa que el backend esté disponible.',
      0,
    )
  }

  const datos = await leerCuerpo(respuesta)

  if (!respuesta.ok) {
    if (respuesta.status === 401 && token && !noExpirarSesion) {
      borrarSesion()
      window.dispatchEvent(new CustomEvent('sesion-expirada'))
    }

    throw new ErrorApi(
      datos?.mensaje || 'Ocurrió un error inesperado.',
      respuesta.status,
      datos?.errores || [],
    )
  }

  return datos
}
