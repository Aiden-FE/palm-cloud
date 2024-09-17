import { IsEmail, IsString } from 'class-validator';

export class CaptchaEmailBodyDto {
  /** 邮箱账号 */
  @IsString()
  @IsEmail()
  email: string;

  /** 验证码 */
  @IsString()
  captcha: string;

  /** 验证码 key */
  @IsString()
  captchaKey: string;
}

export class RegisterEmailBodyDto {
  /** 邮箱账号 */
  @IsString()
  @IsEmail()
  email: string;

  /** 密码 */
  @IsString()
  password: string;

  /** 验证码 */
  @IsString()
  captcha: string;
}

export class LoginEmailBodyDto extends RegisterEmailBodyDto {}
