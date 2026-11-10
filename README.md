<div align="center">

# 🎓 Plataforma de Oportunidades para Estudiantes

**Conecta empresas con estudiantes de educación superior: prácticas, empleos, capacitaciones y servicios en un solo lugar.**

![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)
![Jest](https://img.shields.io/badge/Tests-Jest-C21325?logo=jest&logoColor=white)
![Estado](https://img.shields.io/badge/Estado-MVP%20en%20desarrollo-orange)

</div>

---

## 📌 Sobre el proyecto

Esta plataforma propone un espacio **exclusivo para estudiantes de educación superior**, donde las empresas publican oportunidades pertinentes a su etapa formativa. Es un producto mínimo viable (MVP) desarrollado en la asignatura **Ingeniería de Software**.

El repositorio tiene dos partes:

- **`backend/`:** API REST con Node.js, Express y PostgreSQL.
- **`frontend/`:** aplicación web en React que consume la API.

## ✨ Funcionalidades

| | Funcionalidad | Estado |
|---|---|---|
| 🔐 | Registro e inicio de sesión con JWT | ✅ Listo |
| 🏢 | Registro de empresa con validación de RUT | ✅ Listo |
| 🛡️ | Aprobación o rechazo de empresas por el administrador | ✅ Listo (HU-03) |
| 📝 | Publicar, editar, cerrar y eliminar ofertas | ✅ Listo (HU-04) |
| 🔎 | Búsqueda de ofertas vigentes con filtros | ✅ Listo (HU-05) |
| 📄 | Detalle de oferta | 🚧 Interfaz lista, API pendiente |
| ✉️ | Verificación de correo institucional | 🚧 Interfaz lista, API pendiente |
| 📨 | Postulación e inscripción | 🚧 Interfaz lista, API pendiente |
| 👥 | Gestión de postulantes | 🚧 Interfaz lista, API pendiente |
| 💬 | Mensajería entre empresa y estudiante | 🔜 Próximamente |
| 🚩 | Moderación de publicaciones | 🔜 Próximamente |

> Las pantallas cuya API aún no existe funcionan con datos simulados (`frontend/src/api/mocks.js`).

## 🔄 Flujo principal

```mermaid
flowchart LR
    E[Empresa se registra] --> A{Administrador revisa}
    A -- Aprobada --> P[Empresa publica ofertas]
    A -- Rechazada --> X[No puede publicar]
    P --> S[Estudiante busca y filtra]
    S --> V[Solo ve ofertas vigentes]
```

## 👤 Roles

- **Estudiante:** se registra con correo institucional, busca y filtra ofertas.
- **Empresa:** se registra, espera aprobación y gestiona sus ofertas.
- **Administrador:** aprueba o rechaza empresas.

## 🛠️ Tecnologías

| Área | Herramientas |
|---|---|
| Frontend | React 19, React Router 7, Vite, SweetAlert2, CSS simple |
| Servidor | Node.js, Express 5 |
| Base de datos | PostgreSQL, Prisma ORM |
| Validación | Zod |
| Seguridad | JWT, bcryptjs, Helmet, CORS, express-rate-limit |
| Pruebas | Jest, Supertest |
| Calidad | Oxlint (frontend) |

## 🚀 Puesta en marcha

**Requisitos:** Node.js 22 o superior y PostgreSQL.

### Backend

```powershell
# 1. Instalar dependencias
cd backend
npm install

# 2. Crear el archivo de variables de entorno y completarlo
Copy-Item .env.example .env
```

Crea dos bases de datos en PostgreSQL, `plataforma_oportunidades` y `plataforma_test`, y completa el `.env`:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Base de datos de desarrollo |
| `DATABASE_URL_TEST` | Base de datos de pruebas |
| `JWT_SECRET` | Clave larga y aleatoria para firmar los tokens |

```powershell
# 3. Aplicar las migraciones a la base de desarrollo
npx prisma migrate deploy

# 4. Aplicar las migraciones a la base de pruebas
$env:DATABASE_URL = "postgresql://postgres:TU_CLAVE@localhost:5432/plataforma_test?schema=public"
npx prisma migrate deploy
Remove-Item Env:DATABASE_URL

# 5. Cargar datos iniciales (institución INACAP y usuario administrador)
npm run seed

# 6. Iniciar el servidor
npm run dev
```

El servidor queda en `http://localhost:3000`. Prueba que responde con `http://localhost:3000/api/salud`.

### Frontend

Requiere el backend corriendo en `http://localhost:3000`. En una segunda terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

El `.env` solo necesita una variable:

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL de la API del backend. Por defecto `http://localhost:3000/api` |

Vite muestra en la terminal la dirección de la app (normalmente `http://localhost:5173`).

Otros scripts: `npm run build` (compilación de producción), `npm run preview` (previsualizarla) y `npm run lint` (análisis con Oxlint). El detalle completo está en [`frontend/README.md`](frontend/README.md).

## 🧪 Pruebas

Las pruebas automatizadas cubren el backend. Se ejecutan dentro de `backend/`:

```powershell
npm test          # ejecuta las pruebas
npm run test:cov  # ejecuta las pruebas con tabla de cobertura
```

- 79 pruebas en 9 suites (12 unitarias y 67 de integración).
- Se ejecutan en serie (`--runInBand`) porque las pruebas de integración comparten la base `plataforma_test`.
- Cobertura de líneas: 94.4 % (según `npm run test:cov`).

## 📡 API

Las rutas protegidas exigen el encabezado `Authorization: Bearer <token>`.

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/salud` | Público | Estado del servidor |
| POST | `/api/auth/registro` | Público | Registro de estudiante |
| POST | `/api/auth/registro-empresa` | Público | Registro de empresa |
| POST | `/api/auth/login` | Público | Inicio de sesión |
| GET | `/api/auth/perfil` | Autenticado | Perfil del usuario |
| GET | `/api/admin/empresas` | Administrador | Lista empresas por estado |
| PATCH | `/api/admin/empresas/:id/aprobacion` | Administrador | Aprueba o rechaza una empresa |
| POST | `/api/ofertas` | Empresa aprobada | Publica una oferta |
| GET | `/api/ofertas/mias` | Empresa | Lista sus ofertas |
| PATCH | `/api/ofertas/:id` | Empresa | Edita una oferta |
| PATCH | `/api/ofertas/:id/estado` | Empresa | Cierra o reactiva una oferta |
| DELETE | `/api/ofertas/:id` | Empresa | Elimina una oferta |
| GET | `/api/busqueda/ofertas` | Estudiante | Busca ofertas vigentes |

**Filtros de búsqueda** (todos opcionales): `tipo`, `area`, `ubicacion`, `modalidad`, `q`, `pagina` y `limite`.

```
GET /api/busqueda/ofertas?tipo=PRACTICA&ubicacion=santiago&area=tecnolog
```

Tipos de oferta: `PRACTICA`, `EMPLEO`, `CAPACITACION` y `SERVICIO`.

## 🖥️ Pantallas del frontend

| Rol | Rutas |
|---|---|
| Público | `/`, `/login`, `/registro`, `/registro-empresa`, `/verificar` |
| Estudiante | `/ofertas`, `/ofertas/:id`, `/mis-postulaciones` |
| Empresa | `/empresa/ofertas`, `/empresa/ofertas/nueva`, `/empresa/ofertas/:id/editar`, `/empresa/ofertas/:id/postulaciones` |
| Administrador | `/admin/empresas` |

## 📂 Estructura del proyecto

```
plataforma-oportunidades/
├── backend/
│   ├── prisma/            # Esquema, migraciones y seed
│   ├── src/
│   │   ├── db/            # Cliente de Prisma
│   │   ├── middlewares/   # Autenticación, roles, validación y errores
│   │   ├── modules/
│   │   │   ├── auth/      # Registro, login y perfil
│   │   │   ├── admin/     # Aprobación de empresas
│   │   │   ├── ofertas/   # Gestión de ofertas
│   │   │   └── busqueda/  # Búsqueda para estudiantes
│   │   └── utils/
│   └── tests/
│       ├── unit/
│       └── integration/
├── frontend/
│   └── src/
│       ├── api/           # Llamadas HTTP (única capa que usa fetch) y mocks
│       ├── context/       # Sesión y autenticación
│       ├── components/    # Componentes reutilizables
│       ├── pages/         # Pantallas por ruta
│       └── utils/         # Roles, formato de fechas y alertas
└── docs/
    └── evidencia/         # Capturas de pruebas y de cada historia de usuario
```

## 🔒 Seguridad

- Contraseñas cifradas con bcrypt.
- Control de acceso por rol en cada ruta (OWASP A01).
- Límite de intentos de inicio de sesión (OWASP A07).
- Validación de todos los datos de entrada con Zod.
- Los errores internos no se exponen al cliente.
- El frontend guarda el token en `localStorage`, una decisión aceptada solo para este prototipo; en producción convendría una cookie `HttpOnly`.
- Las respuestas 401 cierran la sesión y redirigen al login.

## 🗺️ Roadmap

- [x] HU-03 Registro y aprobación de empresa
- [x] HU-04 Publicación y gestión de ofertas
- [x] HU-05 Búsqueda de ofertas
- [ ] Verificación de estudiantes por correo institucional (interfaz lista, falta la API)
- [ ] Postulación a ofertas (interfaz lista, falta la API)
- [ ] Gestión de postulantes (interfaz lista, falta la API)
- [ ] Mensajería
- [ ] Moderación de contenidos

## 👥 Equipo

| Nombre | Rol |
|---|---|
| Adrieel Rubilar | Desarrollo, pruebas y documentación |
| Renato Miranda | Desarrollo, pruebas y documentación |

---

<div align="center">
Proyecto académico · Ingeniería de Software · INACAP · 2026
</div>
