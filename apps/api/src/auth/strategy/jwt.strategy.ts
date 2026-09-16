import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface.js';
import {
  rolesDeUsuario,
  UsuariosService,
} from '../../users/usuarios.service.js';
import { ConfigService } from '@nestjs/config';
import { JwtUser } from '../interfaces/jwt-user.interface.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtUser> {
    if (payload.sub === undefined) {
      throw new UnauthorizedException('Token inválido');
    }

    const user = await this.usuariosService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email ?? undefined,
      telefono: user.telefono ?? undefined,
      roles_usuario: rolesDeUsuario(user.roles_usuario),
      isApproved: user.isApproved,
    };
  }
}