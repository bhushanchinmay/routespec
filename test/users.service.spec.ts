import { UsersService } from '../src/users/users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    service = new UsersService();
  });

  it('should return list of users', () => {
    const result = service.findAll();
    expect(result).toEqual(['user1', 'user2']);
  });
});