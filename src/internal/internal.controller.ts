import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { RoutesMetadataService } from '../common/metadata/routes-metadata.service';
import { RouteMetadata } from '../common/metadata/route-metadata.interface';

@ApiExcludeController()
@Controller('_internal')
export class InternalController {
  constructor(
    private readonly routesMetadataService: RoutesMetadataService,
  ) {}

  @Get('routes')
  getRoutes(): RouteMetadata[] {
    return this.routesMetadataService.getAllRoutes();
  }
}
