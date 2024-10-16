import { IsArray, IsNumber, IsNumberString, IsOptional, IsString, MaxLength } from 'class-validator';

export class ResourcesBodyDto {
  @IsOptional()
  @IsNumber()
  folderId?: number;

  @IsOptional()
  @IsString()
  filetype?: string;
}

export class ResourceInfoBodyDto {
  @IsNumber()
  id: number;
}

export class CreateUploadTaskBodyDto {
  @IsString()
  filename: string;

  @IsNumber()
  filesize: number;

  @IsString()
  filetype: string;

  @IsArray()
  chunkStatus: (0 | 1)[];

  @IsOptional()
  @IsNumber()
  folderId?: number;
}

export class MergeChunksBodyDto {
  @IsString()
  taskId: string;
}

export class CreateFolderBodyDto {
  @IsString()
  @MaxLength(32)
  name: string;

  @IsOptional()
  @IsNumber()
  parentId?: number;
}

export class GetFoldersQueryDto {
  @IsOptional()
  @IsNumberString()
  folderId?: number;
}

export class GenerateUploadUrlBodyDto {
  @IsString()
  filepath: string;

  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsNumber()
  folderId?: number;
}

export class FinishUploadBodyDto extends GenerateUploadUrlBodyDto {}
