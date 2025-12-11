import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { DEFAULT_ROLES } from '@modules/system-roles/default-roles';
import { SystemRolesService } from '@modules/system-roles/system-roles.service';

import { METADATA_KEY } from '@shared/constants';

@Injectable()
export class UserRolesGuard implements CanActivate {
  protected logger = new Logger(UserRolesGuard.name);

  constructor(
    protected reflector: Reflector,
    protected systemRolesService: SystemRolesService,
  ) {}

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user || request.activeUser || request.systemUser;
    if (!user) {
      return false;
    }

    const userRole = user.role ?? DEFAULT_ROLES.USER.name;

    // Super admin is allowed to do anything
    if (userRole === DEFAULT_ROLES.SUPER_ADMIN.name) {
      return DEFAULT_ROLES.SUPER_ADMIN.isSuperAdmin;
    }

    const entityName = this.reflector.get(
      METADATA_KEY.PERMISSION_ENTITY,
      context.getHandler(),
    );
    const requiredPermissions: string[] =
      this.reflector.get(
        METADATA_KEY.REQUIRED_PERMISSIONS,
        context.getHandler(),
      ) ?? [];

    if (!entityName || !requiredPermissions.length) {
      return true;
    }

    const isRequireAllPermissions =
      this.reflector.get(
        METADATA_KEY.REQUIRE_ALL_PERMISSIONS,
        context.getHandler(),
      ) ?? false;

    const isUserAllowed = (permission: string) => {
      const canActivate = this.systemRolesService.canActivate(
        userRole,
        user.id,
        entityName,
        permission,
        user.loginAt ?? 0,
      );

      this.logger.debug(
        `canActivate: ${canActivate} userId: ${user.id} role: ${userRole} entity: ${entityName} permission: ${permission} isRequireAllPermissions: ${isRequireAllPermissions}`,
      );

      return canActivate;
    };

    const canActivate = isRequireAllPermissions
      ? requiredPermissions.every(isUserAllowed)
      : requiredPermissions.some(isUserAllowed);

    return canActivate;
  }
}
