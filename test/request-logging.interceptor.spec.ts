import {
  CallHandler,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom, of } from 'rxjs';
import { RequestLoggingInterceptor } from '../src/common/logging/request-logging.interceptor';
import { API_INFO_KEY } from '../src/common/decorators/api-info.decorator';

describe('RequestLoggingInterceptor', () => {
  let reflector: { getAllAndOverride: jest.Mock };
  let interceptor: RequestLoggingInterceptor;
  let writeLogSpy: jest.SpyInstance;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };
    interceptor = new RequestLoggingInterceptor(
      reflector as unknown as Reflector,
    );
    writeLogSpy = jest
      .spyOn(interceptor as any, 'writeLog')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log version and route metadata for each HTTP request', async () => {
    reflector.getAllAndOverride.mockReturnValue({
      owner: 'api-team',
      domain: 'users',
    });

    const req = {
      method: 'GET',
      originalUrl: '/v2/users',
      url: '/v2/users',
      route: { path: 'v2/users' },
      apiVersion: '2',
    };

    const res = {
      statusCode: 200,
    };

    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
      getHandler: () => function handler() {},
      getClass: () => class TestController {},
    } as ExecutionContext;

    const next = {
      handle: () => of({ data: ['user1', 'user2'] }),
    } as CallHandler;

    await lastValueFrom(interceptor.intercept(context, next));

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      API_INFO_KEY,
      expect.any(Array),
    );
    expect(writeLogSpy).toHaveBeenCalledTimes(1);

    const payload = writeLogSpy.mock.calls[0][0];
    expect(payload).toMatchObject({
      event: 'http_request',
      method: 'GET',
      path: '/v2/users',
      route: 'v2/users',
      version: '2',
      owner: 'api-team',
      domain: 'users',
      statusCode: 200,
    });
    expect(typeof payload.durationMs).toBe('number');
  });

  it('should log default version and null metadata when not available', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const req = {
      method: 'GET',
      originalUrl: '/_internal/routes',
      url: '/_internal/routes',
      route: { path: '_internal/routes' },
    };

    const res = {
      statusCode: 200,
    };

    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
      getHandler: () => function handler() {},
      getClass: () => class TestController {},
    } as ExecutionContext;

    const next = {
      handle: () => of([]),
    } as CallHandler;

    await lastValueFrom(interceptor.intercept(context, next));

    expect(writeLogSpy).toHaveBeenCalledTimes(1);
    const payload = writeLogSpy.mock.calls[0][0];
    expect(payload).toMatchObject({
      path: '/_internal/routes',
      route: '_internal/routes',
      version: '1',
      owner: null,
      domain: null,
    });
  });
});
