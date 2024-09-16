import { generateUUID, getEnvConfig } from '@app/common';
import { EmailService } from '@app/email';
import { RedisService } from '@app/redis';
import { Injectable, Logger } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';

@Injectable()
export class OpenService {
  constructor(
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) {}

  async sendEmailCaptcha(email: string) {
    const code = Math.floor(100000 + Math.random() * 900000);
    // 已发过验证码的5分钟内不允许重复发送
    if (await this.redisService.client.get(`open_captcha_email_${email}`)) {
      return -1;
    }

    const data = await this.emailService.client.sendMail({
      from: getEnvConfig('EMAIL_FROM'),
      to: email,
      subject: 'Palm cloud 验证码',
      html: `<strong>Palm cloud: </strong>
  <div>您正在请求邮件验证码,如果不是您本人申请,请忽略此邮件!</div>
  验证码五分钟内有效,您的验证码是: <strong style="font-size: 18px">${code}</strong>
`,
    });

    console.log('Debug: ', data);

    // 验证码五分钟内有效
    await this.redisService.client.set(`open_captcha_email_${email}`, code, { PX: 1000 * 60 * 5 });

    return code;
  }

  async validateImageCaptcha(value: string, key: string) {
    const code = await this.redisService.client.get(`open_captcha_image_${key}`);
    if (!code) {
      return -1;
    }
    return code === value ? 1 : 0;
  }

  async getImageCaptcha() {
    const captcha = svgCaptcha.create();

    if (getEnvConfig('NODE_ENV') === 'development') {
      Logger.debug('Captcha: ' + captcha.text, 'OpenService');
    }

    const key = await generateUUID(32);
    // 验证码五分钟内有效
    await this.redisService.client.set(`open_captcha_image_${key}`, captcha.text, { PX: 1000 * 60 * 5 });

    return { key, data: captcha.data };
  }
}
