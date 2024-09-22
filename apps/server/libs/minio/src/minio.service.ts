import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  client: Minio.Client;

  constructor(private options: Minio.ClientOptions) {}

  async onModuleInit() {
    this.client = new Minio.Client(this.options);
    Logger.log('Created MinIO client successfully', 'MinIO');
  }
}
