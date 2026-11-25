<div align="center">

# 🎓 PrimeraPega

**De la sala de clases a la pega.** Una plataforma que conecta empresas con estudiantes de educación superior: prácticas, empleos, capacitaciones y servicios en un solo lugar.

![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)
![Jest](https://img.shields.io/badge/Tests-192%20pasan-C21325?logo=jest&logoColor=white)
![Cobertura](https://img.shields.io/badge/Cobertura-94%25-brightgreen)
![Estado](https://img.shields.io/badge/Estado-MVP-orange)

</div>

---

## 📌 Sobre el proyecto

En Chile, el estudio *Empleo Joven en Chile 2026* (Cadem & Arcos Dorados, 2026) indica que el 64 % de los jóvenes identifica la falta de experiencia como la principal barrera para acceder a su primer empleo. Las redes profesionales existentes son generalistas: los estudiantes compiten con profesionales con experiencia y las empresas deben filtrar perfiles que no corresponden a lo que buscan.

**PrimeraPega** propone un espacio exclusivo para estudiantes de educación superior, donde las empresas publican oportunidades pertinentes a su etapa formativa. Es un producto mínimo viable (MVP) desarrollado en la asignatura **Ingeniería de Software**.

El repositorio tiene dos partes:

- **`backend/`:** API REST con Node.js, Express y PostgreSQL.
- **`frontend/`:** aplicación web en React que consume la API.

## ✨ Funcionalidades

| | Funcionalidad | Estado |
|---|---|---|
| 🔐 | Registro e inicio de sesión con JWT | ✅ Listo |
| 🏢 | Registro de empresa con validación de RUT | ✅ Listo |
| 🛡️ | Aprobación o rechazo de empresas por el administrador (HU-03) | ✅ Listo |
| 📝 | Publicar, editar, cerrar y eliminar ofertas (HU-04) | ✅ Listo |
| 🔎 | Búsqueda de ofertas vigentes con filtros y detalle de oferta (HU-05) | ✅ Listo |
| 📨 | Postulación e inscripción, una sola vez por oferta vigente (HU-06) | ✅ Listo |
| 👥 | Gestión de postulaciones: preseleccionar, aceptar o rechazar (HU-07) | ✅ Listo |
| 💬 | Mensajería entre estudiante y empresa (HU-08) | ✅ Listo |
| 🚩 | Moderación de ofertas y suspensión de cuentas con motivo registrado (HU-09) | ✅ Listo |
| 📧 | Notificaciones por correo: registro, cambio de estado de postulación y aprobación de empresa (HU-10) | ✅ Listo |
| 📊 | Seguimiento de postulaciones del estudiante (HU-12) | ✅ Listo |
| ⚠️ | Reporte de publicaciones inapropiadas, con lista de pendientes para el administrador (HU-13) | ✅ Listo |
| ✉️ | Verificación del estudiante por correo institucional | 🚧 Pendiente |

## 🔄 Flujo principal

```mermaid
flowchart LR
    E[Empresa se registra] --> A{Administrador revisa}
    A -- Aprobada --> P[Empresa publica ofertas]
    A -- Rechazada --> X[No puede publicar]
    P --> S[Estudiante busca ofertas vigentes]
    S --> PO[Estudiante postula]
    PO --> G{Empresa gestiona}
    G --> R[Preselecciona, acepta o rechaza]
    R --> N[Estudiante ve el estado y recibe un correo]
    P --> RP[Usuarios reportan publicaciones]
    RP --> M[Administrador oculta o elimina]
```

## 👤 Roles

- **Estudiante:** busca ofertas, postula, sigue sus postulaciones, mensajea con empresas y reporta publicaciones.
- **Empresa:** se registra, espera aprobación, publica ofertas y gestiona a sus postulantes.
- **Administrador:** aprueba empresas, modera ofertas, suspende cuentas y revisa los reportes.

## 🛠️ Tecnologías

| Área | Herramientas |
|---|---|
| Frontend | React 19, React Router 7, Vite, SweetAlert2, CSS simple |
| Servidor | Node.js, Express 5 |
| Base de datos | PostgreSQL, Prisma ORM |
| Validación | Zod |
| Seguridad | JWT, bcryptjs, Helmet, CORS, express-rate-limit |
| Correo | Nodemailer |
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

El servidor queda en `http://localhost:3000`. Prueba que responde con `http://localhost:3000/api/salud`. El administrador inicial es `admin@plataforma.cl`; su contraseña se define con la variable `ADMIN_PASSWORD` al ejecutar el seed.

### Frontend

Requiere el backend corriendo en `http://localhost:3000`. En una segunda terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL de la API del backend. Por defecto `http://localhost:3000/api` |

Vite muestra en la terminal la dirección de la app (normalmente `http://localhost:5173`). Otros scripts: `npm run build`, `npm run preview` y `npm run lint`. El detalle del frontend está en [`frontend/README.md`](frontend/README.md).

## 🧪 Pruebas

Las pruebas automatizadas cubren el backend y se ejecutan dentro de `backend/`:

```powershell
npm test          # ejecuta las pruebas
npm run test:cov  # ejecuta las pruebas con tabla de cobertura
```

| Métrica | Resultado |
|---|---|
| Suites | 17 |
| Pruebas | **192**, todas pasan |
| Cobertura de líneas | **94,22 %** |
| Cobertura de sentencias | 93,83 % |
| Cobertura de ramas | 85,52 % |
| Cobertura de funciones | 96,84 % |

Las pruebas incluyen unitarias (esquemas de validación) y de integración (rutas, roles, reglas de negocio y base de datos). Se ejecutan en serie (`--runInBand`) porque las de integración comparten la base `plataforma_test`.

## 📡 API

Las rutas protegidas exigen el encabezado `Authorization: Bearer <token>`.

**General y autenticación**

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/salud` | Público | Estado del servidor |
| GET | `/api/salud/db` | Público | Estado de la conexión con la base de datos |
| GET | `/api/instituciones` | Público | Instituciones registradas |
| POST | `/api/auth/registro` | Público | Registro de estudiante |
| POST | `/api/auth/registro-empresa` | Público | Registro de empresa |
| POST | `/api/auth/login` | Público | Inicio de sesión |
| GET | `/api/auth/perfil` | Autenticado | Perfil del usuario |

**Ofertas y búsqueda**

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/api/ofertas` | Empresa aprobada | Publica una oferta |
| GET | `/api/ofertas/mias` | Empresa | Lista sus ofertas |
| PATCH | `/api/ofertas/:id` | Empresa | Edita una oferta |
| PATCH | `/api/ofertas/:id/estado` | Empresa | Cierra o reactiva una oferta |
| DELETE | `/api/ofertas/:id` | Empresa | Elimina una oferta |
| GET | `/api/ofertas/:id/postulaciones` | Empresa | Lista las postulaciones de su oferta |
| GET | `/api/busqueda/ofertas` | Estudiante | Busca ofertas vigentes |
| GET | `/api/busqueda/ofertas/:id` | Estudiante | Detalle de una oferta vigente |

Filtros de búsqueda (todos opcionales): `tipo`, `area`, `ubicacion`, `modalidad`, `q`, `pagina` y `limite`. Tipos de oferta: `PRACTICA`, `EMPLEO`, `CAPACITACION` y `SERVICIO`.

```
GET /api/busqueda/ofertas?tipo=PRACTICA&ubicacion=santiago&area=tecnolog
```

**Postulaciones, mensajes y reportes**

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/api/postulaciones` | Estudiante verificado | Postula a una oferta vigente |
| GET | `/api/postulaciones/mias` | Estudiante | Lista sus postulaciones con su estado |
| PATCH | `/api/postulaciones/:id/estado` | Empresa | Preselecciona, acepta o rechaza |
| POST | `/api/mensajes` | Estudiante / Empresa | Envía un mensaje |
| GET | `/api/mensajes` | Estudiante / Empresa | Lista los mensajes |
| PATCH | `/api/mensajes/:id/leer` | Estudiante / Empresa | Marca un mensaje como leído |
| POST | `/api/reportes` | Estudiante / Empresa | Reporta una publicación |
| GET | `/api/reportes` | Administrador | Lista los reportes (por defecto, los pendientes) |

**Administración**

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/admin/empresas` | Administrador | Lista empresas por estado |
| PATCH | `/api/admin/empresas/:id/aprobacion` | Administrador | Aprueba o rechaza una empresa |
| GET | `/api/admin/ofertas` | Administrador | Lista las ofertas con su estado |
| PATCH | `/api/admin/ofertas/:id/moderacion` | Administrador | Oculta o elimina una oferta, con motivo |
| GET | `/api/admin/usuarios` | Administrador | Lista los usuarios |
| PATCH | `/api/admin/usuarios/:id/suspension` | Administrador | Suspende una cuenta, con motivo |

## 📂 Estructura del proyecto

```
plataforma-oportunidades/
├── backend/
│   ├── prisma/              # Esquema, migraciones y seed
│   ├── src/
│   │   ├── db/              # Cliente de Prisma
│   │   ├── middlewares/     # Autenticación, roles, validación, límites y errores
│   │   ├── modules/
│   │   │   ├── auth/            # Registro, login y perfil
│   │   │   ├── admin/           # Aprobación de empresas y rutas de administración
│   │   │   ├── ofertas/         # Gestión de ofertas
│   │   │   ├── busqueda/        # Búsqueda y detalle para estudiantes
│   │   │   ├── postulaciones/   # Postulación, gestión y seguimiento
│   │   │   ├── mensajes/        # Mensajería
│   │   │   ├── moderacion/      # Moderación de ofertas y suspensión de cuentas
│   │   │   ├── reportes/        # Reporte de publicaciones
│   │   │   └── notificaciones/  # Avisos por correo
│   │   ├── services/        # Envío de correo
│   │   └── utils/
│   └── tests/
│       ├── unit/
│       └── integration/
├── frontend/
│   └── src/
│       ├── api/             # Llamadas HTTP (única capa que usa fetch) y mocks
│       ├── context/         # Sesión y autenticación
│       ├── components/      # Componentes reutilizables
│       ├── pages/           # Pantallas por ruta
│       └── utils/           # Roles, formato de fechas y alertas
└── docs/
    └── evidencia/           # Capturas de pruebas y de cada historia de usuario
```

## 🔒 Seguridad

- Contraseñas cifradas con bcrypt; el login responde igual si el correo no existe o la clave es incorrecta.
- Tokens JWT con expiración de 8 horas.
- Control de acceso por rol en cada ruta, y verificación de que cada empresa solo gestiona sus propias ofertas y postulaciones (OWASP A01).
- Las cuentas suspendidas no pueden iniciar sesión, y una sesión abierta queda bloqueada en la siguiente petición.
- Límite de intentos de inicio de sesión (OWASP A07).
- Validación de todos los datos de entrada con Zod y consultas parametrizadas con Prisma (OWASP A05).
- Cabeceras de seguridad con Helmet.
- Registro de cada moderación y suspensión con el administrador y el motivo.
- Los errores internos no se exponen al cliente.
- El frontend guarda el token en `localStorage`, una decisión aceptada solo para este prototipo; en producción convendría una cookie `HttpOnly`.

## 🗺️ Roadmap

- [x] Registro, aprobación de empresas y publicación de ofertas
- [x] Búsqueda, postulación y seguimiento
- [x] Gestión de postulaciones y mensajería
- [x] Moderación, reportes y notificaciones por correo
- [ ] Verificación de estudiantes por correo institucional
- [ ] Reactivar ofertas ocultas y levantar suspensiones
- [ ] Resolver reportes desde el panel de administración
- [ ] Despliegue con Docker

## 👥 Equipo

| Nombre | Rol |
|---|---|
| Adrieel Rubilar | Desarrollo, pruebas y documentación |
| Renato Miranda | Desarrollo, pruebas y documentación |

---

<div align="center">
Proyecto académico · Ingeniería de Software · INACAP · 2026
</div>
