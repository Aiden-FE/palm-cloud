import { Controller, Post, Headers, Body, Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ResourcesService } from './resources.service';
import { ResourceInfoBodyDto, ResourcesBodyDto } from './resources.dto';
import { FastifyRequest } from 'fastify';

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

  @Post('upload')
  async uploadResource(@Req() req: FastifyRequest) {
    const file = await req.file();
    console.log('file: ', file);
    return true;
  }
}
