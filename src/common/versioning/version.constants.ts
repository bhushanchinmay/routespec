import { ApiVersion } from './version.types';

export const SUPPORTED_VERSIONS: readonly ApiVersion[] = ['1', '2'];
export const DEFAULT_API_VERSION: ApiVersion = '1';

export function isSupportedVersion(value: string): value is ApiVersion {
  return SUPPORTED_VERSIONS.includes(value as ApiVersion);
}
