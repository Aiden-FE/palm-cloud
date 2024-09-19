import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { OpenController } from './open.controller';
import { OpenService } from './open.service';
import { getEnvConfig } from '@app/common';

@Module({
  imports: [
    JwtModule.register({
      secret: getEnvConfig('APP_SALT_SECRET'),
    }),
  ],
  controllers: [OpenController],
  providers: [OpenService, UsersService],
})
export class OpenModule {}
