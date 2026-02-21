import { Request } from 'express';

export type ApiVersion = '1' | '2';

export type VersionedRequest = Request & {
  apiVersion?: ApiVersion;
};
