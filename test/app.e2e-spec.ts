import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupSwagger } from '../src/common/openapi/swagger.setup';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupSwagger(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/v1/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/v1/users')
      .expect(200)
      .expect({
        data: ['user1', 'user2'],
      });
  });

  it('/v2/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/v2/users')
      .expect(200)
      .expect({
        data: ['user1', 'user2'],
        meta: { count: 2 },
      });
  });

  it('/users with header version 2', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('x-api-version', '2')
      .expect(200)
      .expect({
        data: ['user1', 'user2'],
        meta: { count: 2 },
      });
  });

  it('/users without header should default to version 1', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect({
        data: ['user1', 'user2'],
      });
  });

  it('should reject unsupported version', () => {
    return request(app.getHttpServer()).get('/v9/users').expect(400);
  });

  it('/_internal/routes should return metadata', () => {
    return request(app.getHttpServer())
      .get('/_internal/routes')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/docs-json should include public users contract details', () => {
    return request(app.getHttpServer())
      .get('/docs-json')
      .expect(200)
      .expect((res) => {
        const document = res.body;
        const paths = document.paths ?? {};
        const usersOperation = paths['/users']?.get;
        const usersParameters = usersOperation?.parameters ?? [];
        const okSchema =
          usersOperation?.responses?.['200']?.content?.['application/json']
            ?.schema;
        const oneOfRefs = (okSchema?.oneOf ?? []).map(
          (entry: { $ref?: string }) => entry.$ref,
        );
        const headerParameter = usersParameters.find(
          (entry: { in?: string; name?: string }) =>
            entry?.in === 'header' && entry?.name === 'x-api-version',
        );

        expect(paths['/users']).toBeDefined();
        expect(paths['/v1/users']).toBeUndefined();
        expect(paths['/v2/users']).toBeUndefined();
        expect(paths['/_internal/routes']).toBeUndefined();

        expect(headerParameter).toBeDefined();
        expect(Array.isArray(okSchema?.oneOf)).toBe(true);
        expect(oneOfRefs).toContain('#/components/schemas/UsersV1ResponseDto');
        expect(oneOfRefs).toContain('#/components/schemas/UsersV2ResponseDto');
      });
  });
});
