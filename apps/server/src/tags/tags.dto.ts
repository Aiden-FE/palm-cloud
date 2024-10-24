import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class TagsQueryDto {
  @IsOptional()
  @IsString()
  keyword?: string;
}

export class CreateTagBodyDto {
  @IsString()
  @MaxLength(12)
  name: string;

  @IsOptional()
  @IsString()
  color?: string;
}

export class DeleteTagsBodyDto {
  @IsArray()
  ids: number[];
}
