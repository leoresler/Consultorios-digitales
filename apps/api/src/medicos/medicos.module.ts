import { Module } from '@nestjs/common';
import { MedicosController } from './medicos.controller.js';
import { MedicosService } from './medicos.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [MedicosController],
  providers: [MedicosService],
  exports: [MedicosService],
})
export class UsuariosModule {}