-- CreateTable
CREATE TABLE "SuspensionCuenta" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "administradorId" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "fechaSuspension" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuspensionCuenta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SuspensionCuenta" ADD CONSTRAINT "SuspensionCuenta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuspensionCuenta" ADD CONSTRAINT "SuspensionCuenta_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "Administrador"("id") ON DELETE CASCADE ON UPDATE CASCADE;
