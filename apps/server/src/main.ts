import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as fastifyMultipart from '@fastify/multipart';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor, VALIDATION_OPTION, LoggerMiddleware } from '@app/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
      // trustProxy: true, // 当服务位于代理之后打开此配置
    }),
  );
  // 统一接口前缀
  app.setGlobalPrefix('api');
  // 接口多版本
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(
    // 入参数据验证
    new ValidationPipe(VALIDATION_OPTION),
  );
  // cors 保护
  app.enableCors({
    origin: '*',
  });
  // 响应拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.use(new LoggerMiddleware().use);
  // 注入文档
  const apiDocOptions = new DocumentBuilder()
    .setTitle('文档标题')
    .setDescription('文档描述')
    .setVersion('v1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, apiDocOptions);
  SwaggerModule.setup('/api/docs', app, document);
  app.register(fastifyMultipart);
  // 当部署在容器环境下,如果希望外部或其他容器访问,应当指定地址为0.0.0.0
  await app.listen(8080, '0.0.0.0');
}

bootstrap();
