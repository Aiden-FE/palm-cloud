import { Body, Controller, Get, Post } from '@nestjs/common';
import { OpenService } from './open.service';
import { CaptchaEmailBodyDto, LoginEmailBodyDto, RegisterEmailBodyDto } from './open.dto';
import { BusinessStatus, HttpResponse, Public } from '@app/common';

@Public()
@Controller('open')
export class OpenController {
  constructor(private readonly service: OpenService) {}

  @Post('login/email')
  login(@Body() body: LoginEmailBodyDto) {
    return this.service.loginByEmail(body);
  }

  @Post('register/email')
  registerByEmail(@Body() body: RegisterEmailBodyDto) {
    return this.service.registerByEmail(body);
  }

  @Post('captcha/email')
  async getEmailCaptcha(@Body() body: CaptchaEmailBodyDto) {
    const result = await this.service.validateImageCaptcha(body.captcha, body.captchaKey);
    if (result === -1) {
      return new HttpResponse({
        statusCode: BusinessStatus.BAD_REQUEST,
        message: '未获取验证码或已过期',
      });
    }
    if (result === 0) {
      return new HttpResponse({
        statusCode: BusinessStatus.BAD_REQUEST,
        message: '验证码错误',
      });
    }

    return this.service.sendEmailCaptcha(body.email);
  }

  @Get('captcha/image')
  getImageCaptcha() {
    return this.service.getImageCaptcha();
  }
}
