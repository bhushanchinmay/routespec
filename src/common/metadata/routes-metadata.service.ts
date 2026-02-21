import { Injectable, RequestMethod } from '@nestjs/common';
import { RouteMetadata } from './route-metadata.interface';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { API_INFO_KEY, ApiInfoOptions } from '../decorators/api-info.decorator';

@Injectable()
export class RoutesMetadataService {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
  ) {}

  getAllRoutes(): RouteMetadata[] {
    const routes: RouteMetadata[] = [];
    const controllers = this.discoveryService.getControllers();

    for (const controllerWrapper of controllers) {
      const instance = controllerWrapper.instance;
      const metatype = controllerWrapper.metatype as Function | undefined;

      // Guard against null or undefined wrappers.
      if (!instance || !metatype) continue;

      const controllerPath =
        (Reflect.getMetadata(PATH_METADATA, metatype) as string) ?? '';
      const prototype = Object.getPrototypeOf(instance);

      for (const methodName of Object.getOwnPropertyNames(prototype)) {
        if (methodName === 'constructor') continue;

        const methodRef = prototype[methodName] as (
          ...args: unknown[]
        ) => unknown;
        const requestMethod = Reflect.getMetadata(
          METHOD_METADATA,
          methodRef,
        ) as RequestMethod | undefined;

        if (requestMethod === undefined) continue;

        const routePathMeta = Reflect.getMetadata(PATH_METADATA, methodRef) as
          | string
          | string[]
          | undefined;

        const apiInfo = this.reflector.getAllAndOverride<ApiInfoOptions>(
          API_INFO_KEY,
          [methodRef, metatype],
        );

        for (const routePath of this.normalizeRoutePaths(routePathMeta)) {
          routes.push({
            path: this.buildPath(controllerPath, routePath),
            method: this.mapRequestMethod(requestMethod),
            owner: apiInfo?.owner,
            domain: apiInfo?.domain,
          });
        }
      }
    }

    return routes;
  }

  private buildPath(controllerPath: string, routePath: string): string {
    const normalizedSegments = [controllerPath, routePath]
      .map((segment) => segment.trim().replace(/^\/+|\/+$/g, ''))
      .filter(Boolean);

    return normalizedSegments.length > 0
      ? `/${normalizedSegments.join('/')}`
      : '/';
  }

  private mapRequestMethod(method: RequestMethod): string {
    const methodName = RequestMethod[method];
    return typeof methodName === 'string' ? methodName : 'UNKNOWN';
  }

  private normalizeRoutePaths(
    routePathMeta: string | string[] | undefined,
  ): string[] {
    if (Array.isArray(routePathMeta)) {
      return routePathMeta.length > 0 ? routePathMeta : [''];
    }

    if (typeof routePathMeta === 'string') {
      return [routePathMeta];
    }

    return [''];
  }
}
