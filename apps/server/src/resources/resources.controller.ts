import { Controller, Post, Headers, Body, Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ResourcesService } from './resources.service';
import { ResourceInfoBodyDto, ResourcesBodyDto, CreateUploadTaskBodyDto } from './resources.dto';
import { FastifyRequest } from 'fastify';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import { BusinessStatus, HttpResponse } from '@app/common';

@Controller('resources')
export class ResourcesController {
  constructor(
    private readonly service: ResourcesService,
    private readonly jwtService: JwtService,
  ) {}
  @Post('info')
  getResource(@Headers('Authorization') token: string, @Body() body: ResourceInfoBodyDto) {
    const { uid } = this.jwtService.decode(token);
    return this.service.getResourceById(uid, body.id);
  }

  @Post()
  getResourcesList(@Headers('Authorization') token: string, @Body() body: ResourcesBodyDto) {
    const { uid } = this.jwtService.decode(token);
    return this.service.getResourcesList(uid, body.folderId);
  }

  @Post('upload/create')
  async createUploadTask(@Headers('Authorization') token: string, @Body() body: CreateUploadTaskBodyDto) {
    const { uid } = this.jwtService.decode(token);
    // 不允许覆盖同文件夹下的文件
    if (
      await this.service.isResourceExistsInFolder({
        filename: body.filename,
        folderId: body.folderId,
        ownerId: uid,
      })
    ) {
      return new HttpResponse({
        statusCode: BusinessStatus.ER_DUP_ENTRY,
        message: '资源已存在于文件夹中',
      });
    }
    // 创建上传任务
    return await this.service.createUploadTask({
      filename: body.filename,
      folderId: body.folderId,
      ownerId: uid,
      size: body.filesize,
      type: body.filetype,
    });
  }

  @Post('upload')
  async uploadResource(@Req() req: FastifyRequest) {
    const data = await req.file();
    if (!data) {
      return new HttpResponse({
        statusCode: BusinessStatus.BAD_REQUEST,
        message: '文件不存在',
      });
    }
    await pipeline(data.file, createWriteStream(`./tmp/${data.filename}`, { flush: true }));
    return true;
  }
}
