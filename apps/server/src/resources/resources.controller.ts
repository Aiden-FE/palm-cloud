import { Controller, Post, Headers, Body, Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ResourcesService } from './resources.service';
import { ResourceInfoBodyDto, ResourcesBodyDto, CreateUploadTaskBodyDto, MergeChunksBodyDto } from './resources.dto';
import { FastifyRequest } from 'fastify';
import { pipeline } from 'node:stream/promises';
import { createWriteStream, writeFileSync } from 'node:fs';
import { BusinessStatus, HttpResponse } from '@app/common';
import { MultipartValue } from '@fastify/multipart';

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
      chunkStatus: body.chunkStatus,
    });
  }

  @Post('upload/chunk')
  async uploadResource(@Req() req: FastifyRequest, @Headers('Authorization') token: string) {
    const { uid } = this.jwtService.decode(token);
    const data = await req.file({ limits: { fileSize: 1024 * 1024 * 2 } });
    if (!data) {
      return new HttpResponse({
        statusCode: BusinessStatus.BAD_REQUEST,
        message: '文件不存在',
      });
    }
    const taskId = (data.fields?.taskId as MultipartValue)?.value as string;
    const chunkIndex = (data.fields?.chunkIndex as MultipartValue)?.value as string;
    if (!taskId || !chunkIndex) {
      return new HttpResponse({
        statusCode: BusinessStatus.BAD_REQUEST,
        message: '参数错误',
      });
    }
    return await this.service.saveChunk({
      taskId,
      chunkIndex: Number(chunkIndex),
      buffer: await data.toBuffer(),
      ownerId: uid,
    });
  }

  @Post('upload/merge')
  async mergeResource(@Headers('Authorization') token: string, @Body() body: MergeChunksBodyDto) {
    const { uid } = this.jwtService.decode(token);
    return this.service.mergeChunks({
      taskId: body.taskId,
      ownerId: uid,
    });
  }
}
