import { ApiProperty } from '@nestjs/swagger';

export class UsersV1ResponseDto {
  @ApiProperty({
    type: [String],
    example: ['user1', 'user2'],
    description: 'List of user identifiers.',
  })
  data: Array<string>;
}
