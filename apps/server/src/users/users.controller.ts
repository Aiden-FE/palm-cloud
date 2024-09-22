import { Controller, Post, Headers } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Controller('users')
export class UsersController {
  constructor(private readonly jwtService: JwtService) {}

  @Post('info')
  async getUserInfo(@Headers('Authorization') token: string) {
    return this.jwtService.decode(token);
  }
}
