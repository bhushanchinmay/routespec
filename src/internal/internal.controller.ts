import { Controller, Get } from '@nestjs/common';
import { RoutesMetadataService } from '../common/metadata/routes-metadata.service';
import { RouteMetadata } from '../common/metadata/route-metadata.interface';

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