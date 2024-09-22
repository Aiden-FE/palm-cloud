import { DynamicModule, Module } from '@nestjs/common';
import * as Minio from 'minio';
import { MinioService } from './minio.service';

@Module({
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {
  static forRoot(options: Minio.ClientOptions): DynamicModule {
    return {
      global: true,
      module: MinioModule,
      providers: [
        {
          provide: MinioService,
          useValue: new MinioService(options),
        },
      ],
      exports: [MinioService],
    };
  }
}
