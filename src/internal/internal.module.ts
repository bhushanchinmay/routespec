import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { RoutesMetadataService } from '../common/metadata/routes-metadata.service';
import { InternalController } from './internal.controller';

@Module({
  imports: [DiscoveryModule],
  controllers: [InternalController],
  providers: [RoutesMetadataService],
})
export class InternalModule {}
