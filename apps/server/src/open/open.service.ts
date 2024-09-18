import { BusinessStatus, generateMD5, generateUUID, getEnvConfig, HttpResponse } from '@app/common';
import { EmailService } from '@app/email';
import { RedisService } from '@app/redis';
import { Injectable, Logger } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';
import { LoginEmailBodyDto, RegisterEmailBodyDto } from './open.dto';
import { MysqlService } from '@app/mysql';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class OpenService {
  constructor(
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
    private readonly mysqlService: MysqlService,
    private readonly usersService: UsersService,
  ) {}

  async loginByEmail(body: LoginEmailBodyDto) {
    const valid = await this.validateImageCaptcha(body.captcha, body.captchaKey);
    if (valid === -1) {
      return new HttpResponse({
        statusCode: BusinessStatus.BAD_REQUEST,
        message: '验证码已过期,请重新获取',
      });
    } else if (valid === 0) {
      return new HttpResponse({
        statusCode: BusinessStatus.BAD_REQUEST,
        message: '验证码错误',
      });
    }
    const user = await this.usersService.queryUserInfo({
      email: body.email,
      password: body.password,
    });
    return user;
  }

  async registerByEmail(body: RegisterEmailBodyDto) {
    const emailCode = await this.redisService.client.get(`open_captcha_email_${body.email}`);
    if (!emailCode) {
      return new HttpResponse({
        statusCode: BusinessStatus.BAD_REQUEST,
        message: '验证码已过期,请重新获取',
      });
    }

    if (emailCode !== body.captcha) {
      return new HttpResponse({
        statusCode: BusinessStatus.BAD_REQUEST,
        message: '验证码错误',
      });
    }

    // 已注册邮箱不允许注册
    const [result] = await this.mysqlService.client.query('SELECT email FROM users WHERE email = ?', [body.email]);
    if (result[0]) {
      return new HttpResponse({
        statusCode: BusinessStatus.BAD_REQUEST,
        message: '邮箱已注册',
      });
    }

    await this.mysqlService.client.query('INSERT INTO users (email, password) VALUES (?, ?)', [
      body.email,
      generateMD5(body.password),
    ]);

    return new HttpResponse({
      data: true,
      message: '注册成功',
    });
  }

  async sendEmailCaptcha(email: string) {
    const code = Math.floor(100000 + Math.random() * 900000);
    // 已发过验证码的5分钟内不允许重复发送
    if (await this.redisService.client.get(`open_captcha_email_${email}`)) {
      return new HttpResponse({
        statusCode: BusinessStatus.BAD_REQUEST,
        message: '已发送过验证码,请稍后再试',
      });
    }

    try {
      await this.emailService.client.sendMail({
        from: getEnvConfig('EMAIL_FROM'),
        to: email,
        subject: 'Palm cloud 验证码',
        html: `<strong>Palm cloud: </strong>
    <div>您正在请求邮件验证码,如果不是您本人申请,请忽略此邮件!</div>
    验证码五分钟内有效,您的验证码是: <strong style="font-size: 18px">${code}</strong>
  `,
      });
    } catch (e) {
      Logger.error(e, 'OpenService');
      return new HttpResponse({
        statusCode: BusinessStatus.INTERNAL_SERVER_ERROR,
        message: '邮件发送失败',
        details: e.message,
      });
    }

    // 验证码五分钟内有效
    await this.redisService.client.set(`open_captcha_email_${email}`, code, { PX: 1000 * 60 * 5 });

    return new HttpResponse({
      data: true,
      message: '邮件发送成功',
    });
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
