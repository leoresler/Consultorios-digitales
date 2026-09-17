import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ConsultoriosController } from './consultorios.controller.js';
import { ConsultoriosService } from './consultorios.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [ConsultoriosController],
  providers: [ConsultoriosService],
  exports: [ConsultoriosService],
})
export class ConsultoriosModule {}