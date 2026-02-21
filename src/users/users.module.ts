import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { VersionResponseInterceptor } from './version-response.interceptor';

@Module({
  controllers: [UsersController],
  providers: [UsersService, VersionResponseInterceptor],
})
export class UsersModule {}
