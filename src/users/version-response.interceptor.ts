import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { DEFAULT_API_VERSION } from '../common/versioning/version.constants';
import {
  ApiVersion,
  VersionedRequest,
} from '../common/versioning/version.types';
import { UsersV1ResponseDto } from './dto/users-v1-response.dto';
import { UsersV2ResponseDto } from './dto/users-v2-response.dto';

@Injectable()
export class VersionResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<VersionedRequest>();
    const version = req.apiVersion ?? DEFAULT_API_VERSION;

    return next
      .handle()
      .pipe(map((payload) => this.formatPayload(payload, version)));
  }

  private formatPayload(
    payload: unknown,
    version: ApiVersion,
  ): UsersV1ResponseDto | UsersV2ResponseDto | unknown {
    if (!this.isStringArray(payload)) {
      return payload;
    }

    if (version === '2') {
      return {
        data: payload,
        meta: {
          count: payload.length,
        },
      };
    }

    return {
      data: payload,
    };
  }

  private isStringArray(payload: unknown): payload is string[] {
    return (
      Array.isArray(payload) &&
      payload.every((entry) => typeof entry === 'string')
    );
  }
}
