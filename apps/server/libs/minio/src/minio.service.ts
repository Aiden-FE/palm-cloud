import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  public client: Minio.Client;

  constructor(private options: Minio.ClientOptions) {
    this.client = new Minio.Client(this.options);
  }
}
