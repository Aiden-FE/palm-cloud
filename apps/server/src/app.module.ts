import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { getEnvConfig, JWTAuthGuard, ThrottlerBehindProxyGuard } from '@app/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MysqlModule } from '@app/mysql';
import { EmailModule } from '@app/email';
import { RedisModule } from '@app/redis';
import { MinioModule } from '@app/minio';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OpenModule } from './open/open.module';
import { UsersModule } from './users/users.module';
import { ResourcesModule } from './resources/resources.module';

@Module({
  imports: [
    // 局部可以通过 SkipThrottle Throttle 跳过或覆盖全局配置
    ThrottlerModule.forRoot([
      {
        // 单位毫秒
        ttl: getEnvConfig('APP_THROTTLE_TTL'),
        // 单位时间内限制的次数
        limit: getEnvConfig('APP_THROTTLE_LIMIT'),
      },
    ]),
    EmailModule.forRoot({
      host: getEnvConfig('EMAIL_HOST'),
      port: getEnvConfig('EMAIL_PORT'),
      secure: getEnvConfig('EMAIL_SECURE'),
      auth: {
        user: getEnvConfig('EMAIL_USER'),
        pass: getEnvConfig('EMAIL_PASSWORD'),
      },
      from: getEnvConfig('EMAIL_FROM'),
    }),
    RedisModule.forRoot({
      url: getEnvConfig('REDIS_CONNECTION_URL'),
    }),
    MysqlModule.forRoot({
      host: getEnvConfig('MYSQL_HOST'),
      port: getEnvConfig('MYSQL_PORT'),
      user: getEnvConfig('MYSQL_USER'),
      password: getEnvConfig('MYSQL_PASSWORD'),
      database: getEnvConfig('MYSQL_DATABASE'),
      multipleStatements: true, // 允许多语句,以便读取sql文件执行
    }),
    JwtModule.register({
      global: true,
      secret: getEnvConfig('APP_SALT_SECRET'),
    }),
    MinioModule.forRoot({
      endPoint: getEnvConfig('MINIO_ENDPOINT'),
      port: getEnvConfig('MINIO_PORT'),
      accessKey: getEnvConfig('MINIO_ACCESS_KEY'),
      secretKey: getEnvConfig('MINIO_SECRET_KEY'),
      useSSL: getEnvConfig('MINIO_USE_SSL'),
    }),
    OpenModule,
    UsersModule,
    ResourcesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JWTAuthGuard,
    },
  ],
})
export class AppModule {}
