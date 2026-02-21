import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { InternalModule } from './internal/internal.module';

@Module({
  imports: [UsersModule, InternalModule],
})
export class AppModule {}
