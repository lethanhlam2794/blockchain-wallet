import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  EntityPermission,
  RolePermission,
  SystemEntity,
  SystemRole,
  UserRolePermission,
} from './system-roles.model';
import { SystemRolesService } from './system-roles.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SystemRole,
      SystemEntity,
      EntityPermission,
      RolePermission,
      UserRolePermission,
    ]),
  ],
  providers: [SystemRolesService],
  exports: [SystemRolesService],
})
export class SystemRolesModule {}
