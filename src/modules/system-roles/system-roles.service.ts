import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

type ModifyRolePermissionDTO = {
  roleName: string;
  entityName: string;
  permissions: string[];
};

type ModifyUserPermissionDTO = {
  userId: string;
  entityName: string;
  permissions: string[];
  type: 'allowed' | 'forbidden';
};

import {
  DEFAULT_ENTITY_PERMISSIONS,
  DEFAULT_ROLES,
  DEFAULT_ROLE_PERMISSIONS,
  DEFAULT_SYSTEM_ENTITIES,
} from './default-roles';
import {
  EntityPermission,
  RolePermission,
  SystemEntity,
  SystemRole,
  UserRolePermission,
} from './system-roles.model';

@Injectable()
export class SystemRolesService
  implements OnApplicationBootstrap, OnModuleInit
{
  protected logger = new Logger(SystemRolesService.name);

  protected systemRolesMapping: Map<string, any> = new Map();
  protected userRolesMapping: Map<string, any> = new Map();
  protected systemRolesUpdatedAtMapping: Map<string, number> = new Map();
  protected userRolesPermissionUpdatedAtMapping: Map<string, number> =
    new Map();

  constructor(
    @InjectRepository(SystemRole)
    protected systemRoleRepository: Repository<SystemRole>,

    @InjectRepository(SystemEntity)
    protected systemEntityRepository: Repository<SystemEntity>,

    @InjectRepository(EntityPermission)
    protected entityPermissionRepository: Repository<EntityPermission>,

    @InjectRepository(RolePermission)
    protected rolePermissionRepository: Repository<RolePermission>,

    @InjectRepository(UserRolePermission)
    protected userRolePermissionRepository: Repository<UserRolePermission>,
  ) {}

  public async onModuleInit() {
    await Promise.all([
      this.systemRoleRepository.count().then((countRoles) => {
        if (countRoles) return;

        return this.systemRoleRepository.save(
          Object.values(DEFAULT_ROLES).map((i) => ({
            name: i.name,
            isSuperAdmin: i.isSuperAdmin,
          })),
        );
      }),
      this.systemEntityRepository.count().then((countEntities) => {
        if (countEntities) return;

        return this.systemEntityRepository.save(
          Object.values(DEFAULT_SYSTEM_ENTITIES).map((entityName) => ({
            name: entityName,
          })),
        );
      }),
      this.entityPermissionRepository.count().then((countEntityPermissions) => {
        if (countEntityPermissions) return;

        return this.entityPermissionRepository.save(
          Object.values(DEFAULT_ENTITY_PERMISSIONS).map((permissionName) => ({
            name: permissionName,
          })),
        );
      }),
      this.rolePermissionRepository.count().then((countRolePermissions) => {
        if (countRolePermissions) return;

        return this.rolePermissionRepository.save(
          Object.values(DEFAULT_ROLE_PERMISSIONS).map((item) => ({
            roleName: item.roleName,
            entityName: item.entityName,
            permissions: item.permissions,
          })),
        );
      }),
    ]);

    this.logger.debug(
      `finished init system roles/entities/permissions defaults (if missing)`,
    );
  }

  public async onApplicationBootstrap() {
    try {
      this.logger.debug('begin loading system permissions...');
      await this.initSystemPermissions();
      this.logger.debug('finished loading system permissions into registries');
    } catch (error) {
      this.logger.error(error.message, error.stack);

      throw error;
    }
  }

  public async deleteAll() {
    return Promise.all([
      this.systemRoleRepository.clear(),
      this.systemEntityRepository.clear(),
      this.rolePermissionRepository.clear(),
      this.userRolePermissionRepository.clear(),
    ]);
  }

  public async initSystemPermissions(): Promise<void> {
    this.systemRolesMapping.clear();
    this.userRolesMapping.clear();
    this.systemRolesUpdatedAtMapping.clear();
    this.userRolesPermissionUpdatedAtMapping.clear();

    const { allEntities, allRoles, allRolesPermissions, allUserPermissions } =
      await this.viewAll();

    for (const role of allRoles) {
      this.systemRolesUpdatedAtMapping.set(
        role.name,
        role.updatedAt?.valueOf?.() ?? 0,
      );
      this.systemRolesMapping.set(role.name, new Map());
      for (const entity of allEntities) {
        this.systemRolesMapping.get(role.name).set(entity.name, new Map());
      }
    }

    for (const rolePermission of allRolesPermissions) {
      // Mark: Moderator => Card Purchase Histories => View All => true
      for (const eachPermission of rolePermission.permissions) {
        this.systemRolesMapping
          .get(rolePermission.roleName)
          .get(rolePermission.entityName)
          .set(eachPermission, true);
      }
    }

    for (const userPermission of allUserPermissions) {
      this.userRolesPermissionUpdatedAtMapping.set(
        userPermission.userId,
        userPermission.updatedAt.valueOf(),
      );

      this.userRolesMapping.set(userPermission.userId, new Map());

      // Set: UserID => Card Purchase Histories
      this.userRolesMapping
        .get(userPermission.userId)
        .set(userPermission.entityName, new Map());

      for (const permission of userPermission.permissions) {
        // Set: UserID => Card Purchase Histories => View ALL => true|false
        this.userRolesMapping
          .get(userPermission.userId)
          .get(userPermission.entityName)
          .set(permission, userPermission.type === 'allowed');
      }
    }
  }

  public viewUserPermissionsForEntity(
    userId: string,
    roleName: string,
    entityName: string,
  ): Map<string, boolean> {
    const rolePermissions: Map<string, boolean> =
      this.systemRolesMapping.get(roleName)?.get(entityName) ?? new Map();
    const userCustomPermissions: Map<string, boolean> =
      this.userRolesMapping.get(userId)?.get(entityName) ?? new Map();

    return new Map([...rolePermissions, ...userCustomPermissions]);
  }

  public async upsertRolePermissions(dto: ModifyRolePermissionDTO) {
    const existing = await this.rolePermissionRepository.findOne({
      where: { roleName: dto.roleName, entityName: dto.entityName },
    });

    if (existing) {
      return this.rolePermissionRepository.save({
        ...existing,
        permissions: dto.permissions,
      });
    }

    return this.rolePermissionRepository.save({
      roleName: dto.roleName,
      entityName: dto.entityName,
      permissions: dto.permissions,
    });
  }

  public async upsertUserPermissions(dto: ModifyUserPermissionDTO) {
    const existing = await this.userRolePermissionRepository.findOne({
      where: {
        userId: dto.userId,
        type: dto.type,
        entityName: dto.entityName,
      },
    });

    if (existing) {
      return this.userRolePermissionRepository.save({
        ...existing,
        permissions: dto.permissions,
      });
    }

    return this.userRolePermissionRepository.save({
      userId: dto.userId,
      type: dto.type,
      entityName: dto.entityName,
      permissions: dto.permissions,
    });
  }

  public canActivate(
    roleName: string,
    userId: string,
    entityName: string,
    permission: string,
    issuedAt: number,
  ): boolean {
    const isRoleUpdatedNewerThanIssueTime =
      this.systemRolesUpdatedAtMapping.get(roleName) > issuedAt;

    const isUserPermissionUpdatedNewerThanIssueTime =
      this.userRolesPermissionUpdatedAtMapping.get(userId) > issuedAt;

    const canUserActivate = this.userRolesMapping
      .get(userId)
      ?.get(entityName)
      ?.get(permission);

    this.logger.debug(`canUserActivate: ${canUserActivate}`);

    if (typeof canUserActivate === 'boolean') {
      return !isUserPermissionUpdatedNewerThanIssueTime && canUserActivate;
    }

    const isRoleAllowAll =
      this.systemRolesMapping
        .get(roleName)
        ?.get(entityName)
        ?.get(DEFAULT_ENTITY_PERMISSIONS.ALL) ?? false;

    const isRoleAllowAllSelf =
      this.systemRolesMapping
        .get(roleName)
        ?.get(entityName)
        ?.get(DEFAULT_ENTITY_PERMISSIONS.ALL_SELF) ?? false;

    this.logger.debug(
      `isRoleAllowAll: ${isRoleAllowAll}, isRoleAllowAllSelf: ${isRoleAllowAllSelf}`,
    );

    if (isRoleAllowAll) return true;
    if (isRoleAllowAllSelf && permission.includes('self')) return true;

    const canRoleActivate =
      this.systemRolesMapping.get(roleName)?.get(entityName)?.get(permission) ??
      false;

    this.logger.debug(`canRoleActivate: ${canRoleActivate}`);

    return !isRoleUpdatedNewerThanIssueTime && canRoleActivate;
  }

  public async viewAll() {
    const [allRoles, allEntities, allRolesPermissions, allUserPermissions] =
      await Promise.all([
        this.systemRoleRepository.find(),
        this.systemEntityRepository.find(),
        this.rolePermissionRepository.find(),
        this.userRolePermissionRepository.find(),
      ]);

    return {
      allRoles,
      allEntities,
      allRolesPermissions,
      allUserPermissions,
    };
  }
}
