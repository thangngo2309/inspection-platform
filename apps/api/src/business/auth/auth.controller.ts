import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { AccessTokenGuard } from './access-token.guard.js';
import type { AuthenticatedRequest } from './access-token.guard.js';
import {
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  RegisterDto,
} from './auth.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto, 'customer');
  }

  @Post('admin/login')
  adminLogin(@Body() dto: LoginDto) {
    return this.authService.login(dto, 'admin');
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  logout(@Body() dto: LogoutDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  me(@Req() req: AuthenticatedRequest) {
    return this.authService.me(req.authUser!.sub);
  }
}
