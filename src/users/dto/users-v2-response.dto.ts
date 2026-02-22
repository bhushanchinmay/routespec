import { ApiProperty } from '@nestjs/swagger';
import { UsersMetaDto } from './users-meta.dto';

export class UsersV2ResponseDto {
  @ApiProperty({
    type: [String],
    example: ['user1', 'user2'],
    description: 'List of user identifiers.',
  })
  data: string[];

  @ApiProperty({
    type: UsersMetaDto,
    description: 'Additional metadata available in v2.',
  })
  meta: UsersMetaDto;
}
