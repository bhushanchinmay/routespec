import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { DEFAULT_API_VERSION, isSupportedVersion } from './version.constants';
import { VersionedRequest } from './version.types';

@Injectable()
export class VersionMiddleware implements NestMiddleware {
  use(req: VersionedRequest, res: Response, next: NextFunction): void {
    const resolved = this.resolveVersion(req);

    if (!isSupportedVersion(resolved.version)) {
      res.status(400).json({
        message: `Unsupported API version: ${resolved.version}`,
      });
      return;
    }

    req.apiVersion = resolved.version;

    if (resolved.isFromUrl) {
      this.rewriteVersionPrefix(req);
    }

    next();
  }

  private resolveVersion(req: VersionedRequest): {
    version: string;
    isFromUrl: boolean;
  } {
    const urlVersion = this.extractVersionFromUrl(req.originalUrl ?? req.url);
    if (urlVersion) {
      return { version: urlVersion, isFromUrl: true };
    }

    const headerVersion = this.extractVersionFromHeader(
      req.headers['x-api-version'],
    );
    if (headerVersion) {
      return { version: headerVersion, isFromUrl: false };
    }

    return { version: DEFAULT_API_VERSION, isFromUrl: false };
  }

  private extractVersionFromUrl(url: string): string | undefined {
    const [pathname] = url.split('?');
    // TODO: If we add more versioned entities in the future, extract this URL rewrite logic into a shared configuration utility.
    const match = pathname.match(/^\/v(\d+)(?:\/|$)/);
    return match?.[1];
  }

  private extractVersionFromHeader(
    headerVersion: string | string[] | undefined,
  ): string | undefined {
    return Array.isArray(headerVersion) ? headerVersion[0] : headerVersion;
  }

  private rewriteVersionPrefix(req: VersionedRequest): void {
    const originalRequestUrl = req.url ?? req.originalUrl;
    const [pathname, querystring] = originalRequestUrl.split('?');
    const rewrittenPath = pathname.replace(/^\/v\d+(?=\/|$)/, '') || '/';

    req.url = querystring ? `${rewrittenPath}?${querystring}` : rewrittenPath;
  }
}
