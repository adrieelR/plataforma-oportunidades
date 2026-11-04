# Proyecto: plataforma web de oportunidades para estudiantes de educación superior

Plataforma donde empresas publican prácticas, empleos, capacitaciones y servicios, y estudiantes
verificados (correo institucional) postulan. Proyecto académico (MVP) de Ingeniería de Software.
El código se evalúa y se documenta en un informe: debe ser claro, ordenado y verificable.

## Stack (no cambiar sin avisar)

- Backend: Node.js + Express (JavaScript, módulos CommonJS)
- Base de datos: PostgreSQL con Prisma 5.22 (`prisma` y `@prisma/client` en 5.22.0; NO usar Prisma 6 ni 7)
- Frontend: React con Vite
- Pruebas: Jest + supertest
- Contraseñas: bcryptjs. Sesión: JWT. Validación: zod. Correo: nodemailer.
- El esquema de la base está en `backend/prisma/schema.prisma` y NO se modifica sin acordarlo.

## Estructura del backend

```
backend/
  src/
    app.js            (configura Express; no hace listen)
    server.js         (levanta el servidor)
    config/env.js     (lectura de variables de entorno)
    db/prisma.js      (instancia única de PrismaClient)
    middlewares/
      auth.js         (verifica el JWT)            <- evidencia de control de acceso
      roles.js        (requireRole)                <- evidencia de control de acceso
      validate.js     (valida entradas con zod)    <- evidencia de validación de entradas
      rateLimit.js    (límite de intentos)         <- evidencia contra fuerza bruta
      errorHandler.js (errores sin detalles internos)
    modules/<nombre>/ (auth, empresas, ofertas, postulaciones, admin, notificaciones)
      <nombre>.routes.js | .controller.js | .service.js | .schema.js
    services/correo.js (clase ServicioCorreo; en desarrollo imprime o usa Ethereal)
  tests/unit/  tests/integration/
```

Regla: las rutas solo enrutan, los controladores traducen HTTP, y la lógica de negocio vive en `service.js`.

## Seguridad (obligatoria; cada punto debe poder señalarse en un archivo concreto)

- Contraseñas con bcryptjs, costo 12. Nunca guardar ni devolver la contraseña en claro ni el hash.
- JWT con expiración corta; el secreto sale de variables de entorno.
- Todas las entradas se validan con zod en `.schema.js` antes de llegar al servicio.
- Solo consultas de Prisma (parametrizadas). Prohibido `$queryRaw` con texto concatenado.
- Control de acceso por rol en `roles.js` y comprobación de propiedad (una empresa solo edita SUS ofertas; un estudiante solo ve SUS postulaciones).
- `helmet` y `cors` configurados; límite de intentos en el login.
- Tokens de verificación y de recuperación con `crypto.randomBytes`, con vencimiento y de un solo uso.
- Mensajes de error genéricos hacia el cliente; el detalle va solo al log del servidor.
- Secretos solo en `.env` (fuera de Git). Mantener `.env.example` sin valores reales.
- Comentar cada control de seguridad con la referencia, por ejemplo `// OWASP A07: fallas de autenticación`.

## Alcance del MVP

Implementar (Sí o Parcial):
- RF-01 gestión de estudiantes (registro y perfil)
- RF-02 verificación por correo institucional (dominio contra la tabla InstitucionEducativa, enlace con token)
- RF-03 registro de empresa y aprobación por el administrador
- RF-04 y RF-14 publicar, editar y cerrar ofertas
- RF-05 buscar ofertas con filtros
- RF-06 postular o inscribirse (sin duplicados; solo estudiantes verificados; oferta vigente)
- RF-07 gestionar postulaciones (preseleccionar, aceptar, rechazar)
- RF-11 inicio de sesión con roles (ESTUDIANTE, EMPRESA, ADMINISTRADOR)
- RF-12 consultar estado de postulaciones
- RF-09 moderación básica y RF-10 notificaciones por correo (si alcanza el tiempo)

NO implementar: mensajería (RF-08), reportes de publicaciones (RF-13). No agregar funciones fuera de esta lista.

## Pruebas

- Escribir pruebas junto con cada módulo: unitarias para `service.js`, de integración para las rutas.
- Las pruebas usan una base distinta (`DATABASE_URL_TEST`); nunca la base de desarrollo.
- Medir cobertura (`jest --coverage`) y mantenerla visible; apuntar a 70% o más.
- Cada requerimiento implementado debe tener al menos una prueba.

## Git y trabajo en equipo

- Rama `main` siempre estable. Una rama por tarea: `feature/<clave-jira>-<descripcion>`.
- Mensajes de commit en español con la clave de Jira: `SCRUM-12 feat: agrega registro de estudiante`.
- Cada cambio entra por Pull Request revisado por la otra persona.

## Forma de trabajar con el agente

- Trabajar en pasos pequeños. Después de cada paso, ejecutar las pruebas.
- Antes de cambios grandes (esquema, estructura, dependencias nuevas), explicar y pedir confirmación.
- Nombres del dominio en español, iguales a los del esquema (Usuario, Oferta, Postulacion, etc.).
- Comentarios y mensajes al usuario en español. Código claro antes que ingenioso.
- No inventar endpoints ni campos que no estén en el esquema o en esta lista.
