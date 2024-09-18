import { Module } from '@nestjs/common';
import { OpenController } from './open.controller';
import { OpenService } from './open.service';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [OpenController],
  providers: [OpenService, UsersService],
})
export class OpenModule {}
