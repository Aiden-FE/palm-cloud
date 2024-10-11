import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ResourcesBodyDto {
  @IsOptional()
  @IsNumber()
  folderId?: number;
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

  @IsOptional()
  @IsNumber()
  folderId?: number;
}
