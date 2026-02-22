import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { finalize, Observable } from 'rxjs';
import { API_INFO_KEY, ApiInfoOptions } from '../decorators/api-info.decorator';
import { DEFAULT_API_VERSION } from '../versioning/version.constants';
import { VersionedRequest } from '../versioning/version.types';

interface RequestLogPayload {
  event: 'http_request';
  method: string;
  path: string;
  route: string | null;
  version: string;
  owner: string | null;
  domain: string | null;
  statusCode: number;
  durationMs: number;
}

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const startedAt = Date.now();
    const http = context.switchToHttp();
    const req = http.getRequest<VersionedRequest>();
    const res = http.getResponse<{ statusCode?: number }>();
    const routeInfo = this.resolveRoutePath(req);

    const apiInfo = this.reflector.getAllAndOverride<ApiInfoOptions>(
      API_INFO_KEY,
      [context.getHandler(), context.getClass()],
    );

    return next.handle().pipe(
      finalize(() => {
        const durationMs = Date.now() - startedAt;

        const payload: RequestLogPayload = {
          event: 'http_request',
          method: req.method,
          path: req.originalUrl ?? req.url,
          route: routeInfo,
          version: this.resolveVersion(req),
          owner: apiInfo?.owner ?? null,
          domain: apiInfo?.domain ?? null,
          statusCode: res.statusCode ?? 0,
          durationMs,
        };

        this.writeLog(payload);
      }),
    );
  }

  private resolveRoutePath(req: VersionedRequest): string | null {
    const routePath = req.route?.path;
    if (typeof routePath === 'string') {
      return routePath;
    }

    if (Array.isArray(routePath)) {
      return routePath.join('|');
    }

    return null;
  }

  private resolveVersion(req: VersionedRequest): string {
    return req.apiVersion ?? DEFAULT_API_VERSION;
  }

  private writeLog(payload: RequestLogPayload): void {
    this.logger.log(JSON.stringify(payload));
  }
}
