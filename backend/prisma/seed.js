require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('El seed de desarrollo no se ejecuta en producción');
  }

  await prisma.institucionEducativa.upsert({
    where: { dominioCorreo: 'inacapmail.cl' },
    update: {},
    create: { nombre: 'INACAP', dominioCorreo: 'inacapmail.cl' },
  });

  const claveAdmin = process.env.ADMIN_PASSWORD || 'Admin1234';

  await prisma.usuario.upsert({
    where: { correo: 'admin@plataforma.cl' },
    update: {},
    create: {
      correo: 'admin@plataforma.cl',
      contrasenaHash: await bcrypt.hash(claveAdmin, 12),
      rol: 'ADMINISTRADOR',
      estadoCuenta: 'ACTIVA',
      administrador: { create: { nombre: 'Administrador' } },
    },
  });

  console.log('Datos iniciales listos: INACAP y admin@plataforma.cl');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());