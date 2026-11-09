# Frontend: plataforma web de oportunidades para estudiantes de educación superior

Aplicación web (React) que consume la API REST del backend (Node.js + Express + PostgreSQL).
Proyecto académico: es un PROTOTIPO que debe recorrer el flujo central de punta a punta.
Tres roles: ESTUDIANTE, EMPRESA y ADMINISTRADOR. El código se documenta y se evalúa: debe ser simple, ordenado y legible.

## Stack (no cambiar sin avisar)

- React 18 o superior con Vite, en JavaScript (no TypeScript).
- React Router para las rutas. Estado con `useState`, `useContext` y hooks propios. Sin Redux.
- Estilos con CSS simple (un archivo global y archivos por componente). Sin librerías de UI.
- Sin librerías extra salvo que se justifiquen y se avise antes.
- Crear el proyecto dentro de `frontend/` con: `npm create vite@latest . -- --template react`
- Variable de entorno: `VITE_API_URL=http://localhost:3000/api` (dejar `.env.example` sin datos sensibles; `.env` no se sube a Git).

## Estructura sugerida

```
frontend/src/
  api/           cliente.js (fetch con token y manejo de errores), auth.js, ofertas.js, postulaciones.js, admin.js, mocks.js
  context/       AuthContext.jsx (usuario, token, login, logout)
  components/    Navbar, RutaProtegida, TarjetaOferta, Formulario*, Mensaje, Cargando, EstadoVacio
  pages/         Login, RegistroEstudiante, RegistroEmpresa, Verificar, Ofertas, DetalleOferta,
                 MisPostulaciones, EmpresaOfertas, NuevaOferta, PostulacionesDeOferta, AdminEmpresas
  App.jsx, main.jsx, estilos.css
```

Regla: todas las llamadas HTTP salen SOLO de `src/api/`. Las páginas nunca usan `fetch` directamente.

## Pantallas por rol

Públicas:
- `/login`: correo y contraseña.
- `/registro`: registro de estudiante (nombres, apellidos, carrera, correo institucional, contraseña).
- `/registro-empresa`: registro de empresa (razón social, RUT, rubro, descripción, correo, contraseña).
- `/verificar?token=...`: lee el token de la URL, llama a la API y muestra el resultado.

ESTUDIANTE:
- `/ofertas`: lista de ofertas con buscador por palabra clave y filtro por tipo.
- `/ofertas/:id`: detalle y botón "Postular" (o "Inscribirme" si el tipo es CAPACITACION).
- `/mis-postulaciones`: lista con el estado de cada postulación.
- Si la cuenta está en `PENDIENTE_VERIFICACION`, mostrar un aviso: "Verifica tu correo para poder postular".

EMPRESA:
- `/empresa/ofertas`: sus ofertas, con cantidad de postulaciones y botón "Cerrar oferta".
- `/empresa/ofertas/nueva`: formulario de nueva oferta.
- `/empresa/ofertas/:id/postulaciones`: postulaciones recibidas y selector para cambiar su estado.
- Si `estadoAprobacion` no es `APROBADA`, mostrar un aviso y deshabilitar la creación de ofertas.

ADMINISTRADOR:
- `/admin/empresas`: empresas pendientes con botones "Aprobar" y "Rechazar".

La Navbar y las rutas protegidas dependen del rol. Un usuario sin sesión va a `/login`. Un rol no autorizado ve un mensaje de acceso denegado.

## Contrato de la API

Base: `VITE_API_URL` (por defecto `http://localhost:3000/api`). Formato JSON.
Autenticación: cabecera `Authorization: Bearer <token>` en todas las rutas salvo las públicas.
Forma de los errores: `{ "mensaje": "texto", "errores": [ { "campo": "correo", "mensaje": "texto" } ] }` (`errores` solo aparece en los 400 de validación).
Si la API responde 401, borrar la sesión y redirigir a `/login`. Mostrar siempre el `mensaje` que entrega la API.

Valores permitidos (enumeraciones):
- tipo de oferta: `PRACTICA`, `EMPLEO`, `CAPACITACION`, `SERVICIO`
- modalidad: `PRESENCIAL`, `REMOTA`, `HIBRIDA`
- estado de postulación: `ENVIADA`, `PRESELECCIONADA`, `ACEPTADA`, `RECHAZADA`, `CANCELADA`
- estado de oferta: `PUBLICADA`, `CERRADA`, `VENCIDA`
- estado de cuenta: `PENDIENTE_VERIFICACION`, `ACTIVA`, `SUSPENDIDA`
- aprobación de empresa: `PENDIENTE`, `APROBADA`, `RECHAZADA`

Estado: LISTO = ya existe en el backend. PRÓXIMO = se está programando; hasta que esté, usar `mocks.js`.

### Autenticación

| Método y ruta | Quién | Cuerpo | Respuesta exitosa | Errores | Estado |
|---|---|---|---|---|---|
| `POST /auth/registro` | público | `{ nombres, apellidos, carrera, correo, contrasena }` | 201 `{ mensaje, usuario: { id, correo, rol, estadoCuenta } }` | 400 datos inválidos o correo no institucional; 409 correo repetido | LISTO |
| `POST /auth/registro-empresa` | público | `{ razonSocial, rut, rubro, descripcion?, correo, contrasena }` | 201 `{ mensaje, usuario }` | 400, 409 | LISTO |
| `POST /auth/login` | público | `{ correo, contrasena }` | 200 `{ token, usuario: { id, correo, rol, estadoCuenta } }` | 401 credenciales incorrectas; 403 cuenta suspendida | LISTO |
| `POST /auth/verificar` | público | `{ token }` | 200 `{ mensaje }` | 400 enlace inválido, vencido o ya usado | PRÓXIMO |
| `GET /auth/perfil` | autenticado | (sin cuerpo) | 200 `{ usuario, perfil }` | 401 | LISTO |

`perfil` según el rol:
- ESTUDIANTE: `{ nombres, apellidos, carrera, institucion: { nombre } }`
- EMPRESA: `{ razonSocial, rut, rubro, descripcion, estadoAprobacion }`
- ADMINISTRADOR: `{ nombre }`

La contraseña y su hash NUNCA viajan en ninguna respuesta.

Verificación simulada: en este prototipo el correo no se envía. El backend imprime en su consola el enlace
`http://localhost:5173/verificar?token=<token>`. Quien prueba lo copia y lo abre en el navegador.

### Ofertas

| Método y ruta | Quién | Cuerpo o parámetros | Respuesta exitosa | Errores | Estado |
|---|---|---|---|---|---|
| `GET /ofertas` | cualquier usuario con sesión | query: `q` (palabra clave), `tipo` | 200 `{ ofertas: [ { id, titulo, descripcion, tipo, modalidad, area, ubicacion, cupos, fechaLimite, fechaPublicacion, empresa: { razonSocial } } ] }` solo vigentes | 401 | PRÓXIMO |
| `GET /ofertas/:id` | cualquier usuario con sesión | | 200 `{ oferta, yaPostulo }` (`yaPostulo` solo para estudiantes) | 404 | PRÓXIMO |
| `POST /ofertas` | EMPRESA aprobada | `{ titulo, descripcion, tipo, modalidad, area, ubicacion, cupos?, fechaLimite }` con `fechaLimite` en formato `AAAA-MM-DD` | 201 `{ oferta }` | 400 validación; 403 empresa no aprobada | PRÓXIMO |
| `GET /ofertas/mias` | EMPRESA | | 200 `{ ofertas: [ { ...campos, estado, totalPostulaciones } ] }` | 401, 403 | PRÓXIMO |
| `PATCH /ofertas/:id/cerrar` | EMPRESA dueña | | 200 `{ oferta: { id, estado } }` | 403 no es su oferta; 404 | PRÓXIMO |

### Postulaciones

| Método y ruta | Quién | Cuerpo o parámetros | Respuesta exitosa | Errores | Estado |
|---|---|---|---|---|---|
| `POST /ofertas/:id/postulaciones` | ESTUDIANTE verificado | (sin cuerpo) | 201 `{ postulacion: { id, ofertaId, estado, tipo, fechaPostulacion } }` | 403 cuenta no verificada; 404; 409 ya postuló; 400 oferta no vigente | PRÓXIMO |
| `GET /postulaciones/mias` | ESTUDIANTE | | 200 `{ postulaciones: [ { id, estado, tipo, fechaPostulacion, oferta: { id, titulo, estado, empresa: { razonSocial } } } ] }` | 401, 403 | PRÓXIMO |
| `GET /ofertas/:id/postulaciones` | EMPRESA dueña | | 200 `{ postulaciones: [ { id, estado, fechaPostulacion, estudiante: { nombres, apellidos, carrera, correo } } ] }` | 403; 404 | PRÓXIMO |
| `PATCH /postulaciones/:id/estado` | EMPRESA dueña de la oferta | `{ estado }` con `PRESELECCIONADA`, `ACEPTADA` o `RECHAZADA` | 200 `{ postulacion: { id, estado } }` | 400; 403; 404 | PRÓXIMO |

### Administración

| Método y ruta | Quién | Cuerpo o parámetros | Respuesta exitosa | Errores | Estado |
|---|---|---|---|---|---|
| `GET /admin/empresas` | ADMINISTRADOR | query: `estado` (por defecto `PENDIENTE`) | 200 `{ empresas: [ { id, razonSocial, rut, rubro, descripcion, estadoAprobacion, correo } ] }` | 401, 403 | LISTO |
| `PATCH /admin/empresas/:id/aprobacion` | ADMINISTRADOR | `{ decision }` con `APROBAR` o `RECHAZAR` | 200 `{ empresa: { id, estadoAprobacion } }` | 400; 403; 404; 409 solicitud ya resuelta | LISTO |

Cuentas de prueba (las crea un seed del backend, solo para desarrollo):
- Administrador: `admin@plataforma.cl` / `Admin1234`
- Institución registrada: INACAP, dominio `inacapmail.cl` (un estudiante debe registrarse con un correo `@inacapmail.cl`).

## Reglas de la interfaz

- Todo el texto de la interfaz en español.
- Las validaciones en el formulario son solo una comodidad. La API es la que decide; mostrar siempre sus mensajes.
- Mostrar estado de carga, mensajes de error y estados vacíos ("Aún no hay ofertas").
- Diseño responsivo: usable en el celular y en el computador (requerimiento RNF-03).
- Formularios con `label` asociado a cada campo y botones con texto claro (accesibilidad básica).
- El token se guarda en `localStorage` (decisión consciente para el prototipo; documentarla en un comentario).
- Nunca guardar ni mostrar contraseñas. No dejar `console.log` con datos sensibles.
- No inventar endpoints ni campos que no estén en este contrato. Si falta algo, avisar para ajustar el contrato.

## Modo sin backend (mocks)

Mientras un endpoint esté PRÓXIMO, `src/api/mocks.js` devuelve datos de ejemplo con la misma forma del contrato.
Se activa con `VITE_USE_MOCKS=true` en el `.env`. Con `false`, se usa la API real. Los mocks no se muestran al usuario final.

## Fuera del alcance del prototipo

No construir: mensajería, reportes de publicaciones, moderación, notificaciones reales, edición de perfil,
filtros avanzados ni borradores de ofertas. Estas funciones se programan en la entrega final.

## Git y forma de trabajar

- Rama de trabajo propia, por ejemplo `feature/SCRUM-XX-frontend-base`. No tocar la carpeta `backend/`.
- Commits en español con la clave de Jira: `SCRUM-XX feat: agrega pantalla de login`.
- Trabajar por pasos pequeños: base y login, luego estudiante, luego empresa, luego administrador.
- Antes de cambios grandes (dependencias, estructura), explicar el plan y esperar confirmación.
- Después de cada pantalla, ejecutar la aplicación y comprobar que funciona; sacar una captura para el informe.
