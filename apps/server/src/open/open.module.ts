import { Module } from '@nestjs/common';
import { OpenController } from './open.controller';
import { OpenService } from './open.service';

@Module({
  controllers: [OpenController],
  providers: [OpenService],
})
export class OpenModule {}
