import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { MedicosModule } from './medicos/medicos.module.js';
import { ConsultoriosModule } from './consultorios/consultorios.module.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    MedicosModule,
    ConsultoriosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}