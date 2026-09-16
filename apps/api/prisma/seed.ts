import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

config();

const ROLE_NAMES = ['ADMIN', 'PACIENTE', 'MEDICO'] as const;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    for (const nombre of ROLE_NAMES) {
      const existe = await prisma.roles.findFirst({ where: { nombre } });
      if (!existe) {
        await prisma.roles.create({ data: { nombre } });
        console.log(`Rol "${nombre}" creado`);
      } else {
        console.log(`Rol "${nombre}" ya existe`);
      }
    }

    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@consultorios.com';
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123456';

    const adminExistente = await prisma.usuarios.findUnique({
      where: { email: adminEmail },
    });

    if (!adminExistente) {
      const rolAdmin = await prisma.roles.findFirst({ where: { nombre: 'ADMIN' } });
      if (!rolAdmin) {
        throw new Error('El rol ADMIN no fue creado');
      }

      await prisma.usuarios.create({
        data: {
          nombre: 'Admin',
          apellido: 'Principal',
          email: adminEmail,
          contrasena: await bcrypt.hash(adminPassword, 10),
          isApproved: true,
          roles_usuario: {
            create: { id_roles: rolAdmin.id },
          },
        },
      });
      console.log(`Usuario admin "${adminEmail}" creado`);
    } else {
      console.log(`Usuario admin "${adminEmail}" ya existe`);
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});