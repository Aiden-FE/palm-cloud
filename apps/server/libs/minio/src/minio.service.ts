import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  client: Minio.Client;
  intranetClient: Minio.Client;

  constructor(private options: Minio.ClientOptions) {}

  async onModuleInit() {
    this.client = new Minio.Client(this.options);
    this.intranetClient = new Minio.Client({
      ...this.options,
      endPoint: '192.168.31.226',
      port: 19010,
      useSSL: false,
    });
    Logger.log('Created MinIO client successfully', 'MinIO');
  }
}
