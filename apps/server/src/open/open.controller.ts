import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OpenService } from './open.service';
import { GetAuthTokenBody } from './open.dto';

@Controller('open')
export class OpenController {
  constructor(private readonly openService: OpenService) {}

  @Get('login-url')
  getLoginUrl(@Query('redirectUri') redirectUri: string) {
    return this.openService.getLoginUrl(redirectUri);
  }

  @Post('auth-token')
  getAuthToken(@Body() body: GetAuthTokenBody) {
    return this.openService.getAuthToken(body.code);
  }
}
