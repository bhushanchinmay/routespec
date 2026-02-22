import { CallHandler, ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { VersionResponseInterceptor } from '../src/users/version-response.interceptor';

describe('VersionResponseInterceptor', () => {
  let interceptor: VersionResponseInterceptor;

  beforeEach(() => {
    interceptor = new VersionResponseInterceptor();
  });

  it('should format a v1 users response', async () => {
    const context = createHttpContext('1');
    const next = {
      handle: () => of(['user1', 'user2']),
    } as CallHandler;

    const result = await lastValueFrom(interceptor.intercept(context, next));

    expect(result).toEqual({
      data: ['user1', 'user2'],
    });
  });

  it('should format a v2 users response with metadata', async () => {
    const context = createHttpContext('2');
    const next = {
      handle: () => of(['user1', 'user2']),
    } as CallHandler;

    const result = await lastValueFrom(interceptor.intercept(context, next));

    expect(result).toEqual({
      data: ['user1', 'user2'],
      meta: { count: 2 },
    });
  });

  it('should default to v1 when apiVersion is not set', async () => {
    const context = createHttpContext();
    const next = {
      handle: () => of(['user1', 'user2']),
    } as CallHandler;

    const result = await lastValueFrom(interceptor.intercept(context, next));

    expect(result).toEqual({
      data: ['user1', 'user2'],
    });
  });

  it('should keep non-users payload unchanged', async () => {
    const context = createHttpContext('2');
    const payload = { ok: true };
    const next = {
      handle: () => of(payload),
    } as CallHandler;

    const result = await lastValueFrom(interceptor.intercept(context, next));

    expect(result).toEqual(payload);
  });
});

function createHttpContext(apiVersion?: '1' | '2'): ExecutionContext {
  return {
    getType: () => 'http',
    switchToHttp: () => ({
      getRequest: () => ({
        apiVersion,
      }),
    }),
  } as ExecutionContext;
}
