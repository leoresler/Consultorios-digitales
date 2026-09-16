import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { SolicitarOtpDto } from './dto/solicitar-otp.dto.js';
import { VerificarOtpDto } from './dto/verificar-otp.dto.js';
import { CompletarPerfilDto } from './dto/completar-perfil.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { JwtUser } from './interfaces/jwt-user.interface.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('otp/solicitar')
  @HttpCode(200)
  solicitarOtp(@Body() dto: SolicitarOtpDto) {
    return this.authService.requestOtp(dto.telefono);
  }

  @Post('otp/verificar')
  @HttpCode(200)
  verificarOtp(@Body() dto: VerificarOtpDto) {
    return this.authService.verifyOtp(dto.telefono, dto.codigo);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: { user: JwtUser }) {
    return this.authService.getMe(req.user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@Req() req: { user: JwtUser }, @Body() dto: CompletarPerfilDto) {
    return this.authService.updateMe(req.user.id, dto);
  }
}