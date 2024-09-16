import { createTransport } from 'nodemailer';
import type { EmailService } from './email.service';

// @ts-ignore 不需要将 createTransporter 暴露为public
export type EmailTransporter = ReturnType<typeof createTransport>;

// @ts-ignore 不需要将 createTransporter 暴露为public
export type EmailMailOption = Parameters<ReturnType<typeof EmailService.prototype.createTransporter>['sendMail']>[0];
