import { IsString } from 'class-validator';

export class GetAuthTokenBody {
  @IsString()
  code: string;
}
