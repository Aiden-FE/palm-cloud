import { INestApplication, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { EmailTransporter } from './email.dto';

@Injectable()
export class EmailService implements OnModuleInit {
  public client: EmailTransporter;

  constructor(
    private option: any,
    private defaultOption?: any,
  ) {}

  async onModuleInit() {
    this.client = createTransport(this.option, this.defaultOption) as any;
    Logger.log('Email service is readied', 'EmailClient');
  }

  async enableShutdownHooks(app: INestApplication) {
    this.client.close();
    await app.close();
  }
}
