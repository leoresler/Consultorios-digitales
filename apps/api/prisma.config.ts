import { config } from 'dotenv';
config();

import { defineConfig } from 'prisma/config';

export default defineConfig({
  migrations: {
    seed: 'node prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});