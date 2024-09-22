import { IsNumber, IsOptional } from 'class-validator';

export class ResourcesBodyDto {
  @IsOptional()
  @IsNumber()
  folderId?: number;
}

export class ResourceInfoBodyDto {
  @IsNumber()
  id: number;
}
