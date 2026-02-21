import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiInfo } from '../common/decorators/api-info.decorator';
import {
  ApiExtraModels,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { UsersV1ResponseDto } from './dto/users-v1-response.dto';
import { UsersV2ResponseDto } from './dto/users-v2-response.dto';
import { VersionResponseInterceptor } from './version-response.interceptor';

@ApiTags('users')
@UseInterceptors(VersionResponseInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiInfo({ owner: 'api-team', domain: 'users' })
  @ApiOperation({
    summary: 'List users',
    description:
      'Supports URI versioning (/v1/users, /v2/users) and optional x-api-version header on /users.',
  })
  @ApiHeader({
    name: 'x-api-version',
    required: false,
    description: 'Optional API version header. Supported values: 1 or 2.',
    schema: {
      type: 'string',
      enum: ['1', '2'],
      default: '1',
    },
  })
  @ApiExtraModels(UsersV1ResponseDto, UsersV2ResponseDto)
  @ApiOkResponse({
    description: 'Header-versioned users response.',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(UsersV1ResponseDto) },
        { $ref: getSchemaPath(UsersV2ResponseDto) },
      ],
    },
  })
  getUsers(): string[] {
    return this.usersService.findAll();
  }
}
