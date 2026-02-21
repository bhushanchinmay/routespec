import { SetMetadata } from '@nestjs/common';

export const API_INFO_KEY = 'api_info';

export interface ApiInfoOptions {
  owner: string;
  domain: string;
}

export const ApiInfo = (options: ApiInfoOptions) =>
  SetMetadata(API_INFO_KEY, options);