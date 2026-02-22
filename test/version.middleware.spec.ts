import { VersionMiddleware } from '../src/common/versioning/version.middleware';
import { Response } from 'express';
import { VersionedRequest } from '../src/common/versioning/version.types';
import { DEFAULT_API_VERSION } from '../src/common/versioning/version.constants';

describe('VersionMiddleware', () => {
  let middleware: VersionMiddleware;
  let req: Partial<VersionedRequest>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    middleware = new VersionMiddleware();
    next = jest.fn();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should extract version from URL', () => {
    req = { originalUrl: '/v2/users', url: '/v2/users', headers: {} };

    middleware.use(req as VersionedRequest, res as Response, next);

    expect(req.apiVersion).toBe('2');
    expect(req.url).toBe('/users');
    expect(next).toHaveBeenCalled();
  });

  it('should preserve query string when rewriting URL version prefix', () => {
    req = {
      originalUrl: '/v2/users?active=true',
      url: '/v2/users?active=true',
      headers: {},
    };

    middleware.use(req as VersionedRequest, res as Response, next);

    expect(req.apiVersion).toBe('2');
    expect(req.url).toBe('/users?active=true');
    expect(next).toHaveBeenCalled();
  });

  it('should extract version from header', () => {
    req = {
      originalUrl: '/users',
      url: '/users',
      headers: { 'x-api-version': '2' },
    };

    middleware.use(req as VersionedRequest, res as Response, next);

    expect(req.apiVersion).toBe('2');
    expect(req.url).toBe('/users');
    expect(next).toHaveBeenCalled();
  });

  it('should default to v1 when URL and header version are missing', () => {
    req = { originalUrl: '/users', url: '/users', headers: {} };

    middleware.use(req as VersionedRequest, res as Response, next);

    expect(req.apiVersion).toBe(DEFAULT_API_VERSION);
    expect(req.url).toBe('/users');
    expect(next).toHaveBeenCalled();
  });

  it('should prioritize URL version over header version', () => {
    req = {
      originalUrl: '/v1/users',
      url: '/v1/users',
      headers: { 'x-api-version': '2' },
    };

    middleware.use(req as VersionedRequest, res as Response, next);

    expect(req.apiVersion).toBe('1');
    expect(req.url).toBe('/users');
    expect(next).toHaveBeenCalled();
  });

  it('should reject unsupported version', () => {
    req = { originalUrl: '/v9/users', url: '/v9/users', headers: {} };

    middleware.use(req as VersionedRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
