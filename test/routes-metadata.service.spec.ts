import { Test } from '@nestjs/testing';
import { RoutesMetadataService } from '../src/common/metadata/routes-metadata.service';
import { InternalModule } from '../src/internal/internal.module';
import { UsersModule } from '../src/users/users.module';

describe('RoutesMetadataService', () => {
  let service: RoutesMetadataService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UsersModule, InternalModule],
    }).compile();

    service = moduleRef.get(RoutesMetadataService);
  });

  it('should return route metadata with api ownership details', () => {
    const routes = service.getAllRoutes();

    expect(routes.length).toBeGreaterThan(0);
    expect(routes.some((r) => r.path.includes('users'))).toBe(true);

    const usersRoute = routes.find(
      (route) => route.path === '/users' && route.method === 'GET',
    );

    expect(usersRoute).toBeDefined();
    expect(usersRoute).toMatchObject({
      owner: 'api-team',
      domain: 'users',
    });
  });
});
