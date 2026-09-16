---
name: prisma-dto-conventions
description: Convenciones para queries de Prisma y DTOs en este proyecto NestJS. Usar cuando se cree o modifique cualquier service, controller o DTO.
---

# Convenciones Prisma + NestJS de este proyecto

## Queries
- Usar `select` en vez de `include` cuando solo se necesitan campos puntuales
  de una relación (ej: `usuarios: { select: { id, nombre, email } }`).
- `include` solo cuando se necesita la relación completa.
- Nunca traer la columna `contrasena` de `usuarios` en ninguna respuesta,
  ni siquiera indirectamente vía `include`.

## DTOs de entrada
- Siempre clases con `class-validator` (@IsInt, @IsString, @IsOptional, etc.),
  nunca interfaces — los decoradores no funcionan en runtime sobre interfaces.
- Para updates, usar `PartialType(CreateXDto)` en vez de reescribir campos opcionales.
- Validar longitudes de string contra el `@db.VarChar(n)` real del schema.

## DTOs de respuesta
- Nunca devolver el objeto crudo de Prisma. Mapear siempre a un *ResponseDto.
- Si el mapeo se repite entre findOne/findAll, extraerlo a un método privado
  `toResponseDto()` en el service.

## Migraciones
- Después de cualquier cambio en schema.prisma, correr `npx prisma generate`
  antes de tocar el código que usa esos tipos.
- Nunca correr `migrate reset` sin confirmación explícita del usuario.