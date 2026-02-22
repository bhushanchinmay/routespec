import { ApiProperty } from '@nestjs/swagger';

export class UsersMetaDto {
  @ApiProperty({
    example: 2,
    description: 'Total number of users in the response.',
  })
  count: number;
}
