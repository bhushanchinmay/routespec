import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly users = ['user1', 'user2'];

  findAll(): string[] {
    return this.users;
  }
}