---
name: nestjs-module-scaffold
description: Cómo estructurar un módulo nuevo en este proyecto (controller, service, DTOs). Usar al crear cualquier entidad nueva del schema de Prisma.
---

# Estructura de módulo nuevo

Por cada modelo de Prisma, crear:
- `<modelo>.module.ts`
- `<modelo>.controller.ts` — usar ParseIntPipe en los :id de rutas GET/DELETE
- `<modelo>.service.ts` — inyectar PrismaService, nunca instanciar PrismaClient directo
- `dto/create-<modelo>.dto.ts`
- `dto/update-<modelo>.dto.ts` (extends PartialType del create)
- `dto/<modelo>-response.dto.ts`

Registrar el módulo en AppModule. Exportar el service si otro módulo
va a necesitarlo (ej: turnos necesita MedicosService y PacientesService).