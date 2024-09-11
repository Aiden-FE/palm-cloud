import { Controller, Get } from '@nestjs/common';
import { OssService } from './oss.service';

@Controller('oss')
export class OssController {
  constructor(private readonly ossService: OssService) {}

  @Get('videos')
  getVideos() {
    return this.ossService.getVideos();
  }
}
