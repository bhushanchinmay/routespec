import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { InternalModule } from './internal/internal.module';
import { RequestLoggingInterceptor } from './common/logging/request-logging.interceptor';
import { VersionMiddleware } from './common/versioning/version.middleware';

@Module({
  imports: [UsersModule, InternalModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(VersionMiddleware)
      .forRoutes(
        { path: 'users', method: RequestMethod.ALL },
        { path: 'v:version/users', method: RequestMethod.ALL },
      );
  }
}
