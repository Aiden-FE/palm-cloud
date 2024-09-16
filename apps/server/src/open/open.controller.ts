import { Body, Controller, Get, Post } from '@nestjs/common';
import { OpenService } from './open.service';
import { CaptchaEmailBodyDto } from './open.dto';
import { BusinessStatus, HttpResponse } from '@app/common';

@Controller('open')
export class OpenController {
  constructor(private readonly service: OpenService) {}

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

    await this.service.sendEmailCaptcha(body.email);

    return new HttpResponse({
      message: '邮箱验证码已发送',
    });
  }

  @Get('captcha/image')
  getImageCaptcha() {
    return this.service.getImageCaptcha();
  }
}
