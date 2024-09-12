import { Module } from '@nestjs/common';
import { OssController } from './oss.controller';
import { OssService } from './oss.service';
import { MinioModule } from '@app/minio';
import { getEnvConfig } from '@app/common';

@Module({
  imports: [
    MinioModule.forRoot({
      endPoint: getEnvConfig('MINIO_END_POINT'),
      accessKey: getEnvConfig('MINIO_ACCESS_KEY'),
      secretKey: getEnvConfig('MINIO_SECRET_KEY'),
      port: getEnvConfig('MINIO_PORT'),
      useSSL: getEnvConfig('MINIO_ENABLE_SSL'),
    }),
  ],
  controllers: [OssController],
  providers: [OssService],
})
export class OssModule {}
