import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/interfaces/user.interface.js';

//Llave sobre la cual se guardan los roles en memoria
export const ROLES_KEY = 'roles';

//Decorator recibe una lista de roles ('ADMIN,' 'CUSTOMER') y los pega a la ruta
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);