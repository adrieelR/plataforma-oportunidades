-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ESTUDIANTE', 'EMPRESA', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "EstadoCuenta" AS ENUM ('PENDIENTE_VERIFICACION', 'ACTIVA', 'SUSPENDIDA');

-- CreateEnum
CREATE TYPE "EstadoAprobacion" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "TipoOferta" AS ENUM ('PRACTICA', 'EMPLEO', 'CAPACITACION', 'SERVICIO');

-- CreateEnum
CREATE TYPE "Modalidad" AS ENUM ('PRESENCIAL', 'REMOTA', 'HIBRIDA');

-- CreateEnum
CREATE TYPE "EstadoOferta" AS ENUM ('BORRADOR', 'PUBLICADA', 'CERRADA', 'VENCIDA', 'OCULTA', 'ELIMINADA');

-- CreateEnum
CREATE TYPE "TipoPostulacion" AS ENUM ('POSTULACION', 'INSCRIPCION');

-- CreateEnum
CREATE TYPE "EstadoPostulacion" AS ENUM ('ENVIADA', 'PRESELECCIONADA', 'ACEPTADA', 'RECHAZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('VERIFICACION_CORREO', 'CONFIRMACION_POSTULACION', 'CAMBIO_ESTADO_POSTULACION', 'APROBACION_EMPRESA', 'CAMBIO_ESTADO_CUENTA', 'RECUPERACION_CONTRASENA');

-- CreateEnum
CREATE TYPE "EstadoEnvio" AS ENUM ('PENDIENTE', 'ENVIADA', 'FALLIDA');

-- CreateEnum
CREATE TYPE "EstadoReporte" AS ENUM ('PENDIENTE', 'RESUELTO', 'DESCARTADO');

-- CreateEnum
CREATE TYPE "DecisionModeracion" AS ENUM ('MANTENER', 'OCULTAR', 'ELIMINAR');

-- CreateEnum
CREATE TYPE "TipoToken" AS ENUM ('VERIFICACION', 'RECUPERACION_CONTRASENA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasenaHash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "estadoCuenta" "EstadoCuenta" NOT NULL DEFAULT 'PENDIENTE_VERIFICACION',
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estudiante" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "carrera" TEXT NOT NULL,
    "descripcionPerfil" TEXT,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "institucionId" INTEGER,

    CONSTRAINT "Estudiante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "rubro" TEXT NOT NULL,
    "descripcion" TEXT,
    "estadoAprobacion" "EstadoAprobacion" NOT NULL DEFAULT 'PENDIENTE',
    "fechaAprobacion" TIMESTAMP(3),

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Administrador" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitucionEducativa" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "dominioCorreo" TEXT NOT NULL,

    CONSTRAINT "InstitucionEducativa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenVerificacion" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "tipo" "TipoToken" NOT NULL,
    "fechaExpiracion" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TokenVerificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Oferta" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo" "TipoOferta" NOT NULL,
    "modalidad" "Modalidad" NOT NULL,
    "area" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "cupos" INTEGER,
    "estado" "EstadoOferta" NOT NULL DEFAULT 'BORRADOR',
    "fechaPublicacion" TIMESTAMP(3),
    "fechaLimite" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Oferta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Postulacion" (
    "id" SERIAL NOT NULL,
    "estudianteId" INTEGER NOT NULL,
    "ofertaId" INTEGER NOT NULL,
    "tipo" "TipoPostulacion" NOT NULL DEFAULT 'POSTULACION',
    "estado" "EstadoPostulacion" NOT NULL DEFAULT 'ENVIADA',
    "fechaPostulacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Postulacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" SERIAL NOT NULL,
    "postulacionId" INTEGER NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "formato" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "ruta" TEXT NOT NULL,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensaje" (
    "id" SERIAL NOT NULL,
    "ofertaId" INTEGER NOT NULL,
    "remitenteId" INTEGER NOT NULL,
    "destinatarioId" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "fechaEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leido" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "asunto" TEXT NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "estadoEnvio" "EstadoEnvio" NOT NULL DEFAULT 'PENDIENTE',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reporte" (
    "id" SERIAL NOT NULL,
    "ofertaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "estado" "EstadoReporte" NOT NULL DEFAULT 'PENDIENTE',
    "fechaReporte" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Moderacion" (
    "id" SERIAL NOT NULL,
    "ofertaId" INTEGER NOT NULL,
    "administradorId" INTEGER NOT NULL,
    "reporteId" INTEGER,
    "decision" "DecisionModeracion" NOT NULL,
    "motivo" TEXT NOT NULL,
    "fechaDecision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Moderacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Estudiante_usuarioId_key" ON "Estudiante"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_usuarioId_key" ON "Empresa"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_rut_key" ON "Empresa"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_usuarioId_key" ON "Administrador"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "InstitucionEducativa_dominioCorreo_key" ON "InstitucionEducativa"("dominioCorreo");

-- CreateIndex
CREATE UNIQUE INDEX "TokenVerificacion_token_key" ON "TokenVerificacion"("token");

-- CreateIndex
CREATE INDEX "TokenVerificacion_usuarioId_idx" ON "TokenVerificacion"("usuarioId");

-- CreateIndex
CREATE INDEX "Oferta_estado_tipo_idx" ON "Oferta"("estado", "tipo");

-- CreateIndex
CREATE INDEX "Oferta_empresaId_idx" ON "Oferta"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Postulacion_estudianteId_ofertaId_key" ON "Postulacion"("estudianteId", "ofertaId");

-- CreateIndex
CREATE INDEX "Notificacion_usuarioId_idx" ON "Notificacion"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Moderacion_reporteId_key" ON "Moderacion"("reporteId");

-- AddForeignKey
ALTER TABLE "Estudiante" ADD CONSTRAINT "Estudiante_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estudiante" ADD CONSTRAINT "Estudiante_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionEducativa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empresa" ADD CONSTRAINT "Empresa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Administrador" ADD CONSTRAINT "Administrador_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenVerificacion" ADD CONSTRAINT "TokenVerificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oferta" ADD CONSTRAINT "Oferta_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulacion" ADD CONSTRAINT "Postulacion_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulacion" ADD CONSTRAINT "Postulacion_ofertaId_fkey" FOREIGN KEY ("ofertaId") REFERENCES "Oferta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_postulacionId_fkey" FOREIGN KEY ("postulacionId") REFERENCES "Postulacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_ofertaId_fkey" FOREIGN KEY ("ofertaId") REFERENCES "Oferta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_remitenteId_fkey" FOREIGN KEY ("remitenteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_ofertaId_fkey" FOREIGN KEY ("ofertaId") REFERENCES "Oferta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moderacion" ADD CONSTRAINT "Moderacion_ofertaId_fkey" FOREIGN KEY ("ofertaId") REFERENCES "Oferta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moderacion" ADD CONSTRAINT "Moderacion_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "Administrador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moderacion" ADD CONSTRAINT "Moderacion_reporteId_fkey" FOREIGN KEY ("reporteId") REFERENCES "Reporte"("id") ON DELETE SET NULL ON UPDATE CASCADE;
