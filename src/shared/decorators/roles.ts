import { SetMetadata, applyDecorators } from '@nestjs/common';

import { METADATA_KEY } from '@shared/constants';

const PermissionEntity = (entityName: string) =>
  SetMetadata(METADATA_KEY.PERMISSION_ENTITY, entityName);

const RequiredPermissions = (permissions: string[]) =>
  SetMetadata(METADATA_KEY.REQUIRED_PERMISSIONS, permissions);

export const RequireAllPermissions = () =>
  SetMetadata(METADATA_KEY.REQUIRE_ALL_PERMISSIONS, true);

export const RequiredEntityPermissions = (
  entityName: string,
  permissions?: string[],
) => {
  return applyDecorators(
    PermissionEntity(entityName),
    RequiredPermissions(permissions),
  );
};
