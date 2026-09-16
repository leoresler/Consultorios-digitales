import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ConsultoriosService } from './consultorios.service.js';

@Module({
  imports: [PrismaModule],
  providers: [ConsultoriosService],
  exports: [ConsultoriosService],
})
export class ConsultoriosModule {}