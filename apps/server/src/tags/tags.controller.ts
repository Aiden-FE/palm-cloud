import { Controller, Get, Query, Headers, Post, Body } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TagsService } from './tags.service';
import { CreateTagBodyDto, DeleteTagsBodyDto, TagsQueryDto } from './tags.dto';

@Controller('tags')
export class TagsController {
  constructor(
    private readonly service: TagsService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('delete')
  async deleteTags(@Headers('Authorization') token: string, @Body() body: DeleteTagsBodyDto) {
    if (!body.ids.length) {
      return true;
    }
    const { uid } = this.jwtService.decode(token);
    return this.service.deleteTags({
      ownerId: uid,
      ids: body.ids,
    });
  }

  @Post('create')
  async createTag(@Headers('Authorization') token: string, @Body() body: CreateTagBodyDto) {
    const { uid } = this.jwtService.decode(token);
    return this.service.createTag({
      ownerId: uid,
      name: body.name,
      color: body.color,
    });
  }

  @Get()
  async getTags(@Headers('Authorization') token: string, @Query() query: TagsQueryDto) {
    const { uid } = this.jwtService.decode(token);
    return this.service.getTags({
      ownerId: uid,
      keyword: query.keyword,
    });
  }
}
