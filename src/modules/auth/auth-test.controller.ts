import { Controller, Get, UseGuards } from '@nestjs/common';

import {
  DEFAULT_ENTITY_PERMISSIONS,
  DEFAULT_SYSTEM_ENTITIES,
} from '@modules/system-roles/default-roles';

import { RequiredEntityPermissions } from '@shared/decorators/roles';

import { AuthGuard } from './auth.guard';
import { UserRolesGuard } from './user-roles.guard';

@Controller('auth/tests')
@UseGuards(AuthGuard, UserRolesGuard)
export class AuthTestController {
  constructor() {}

  @RequiredEntityPermissions(DEFAULT_SYSTEM_ENTITIES.CARD_PURCHASE_HISTORY, [
    DEFAULT_ENTITY_PERMISSIONS.VIEW_SELF,
  ])
  @Get('test-view-self-success')
  public testUserViewSelfSuccess() {}

  @RequiredEntityPermissions(DEFAULT_SYSTEM_ENTITIES.CARD_PURCHASE_HISTORY, [
    DEFAULT_ENTITY_PERMISSIONS.VIEW_ALL,
  ])
  @Get('test-view-self-fail')
  public testUserViewAllFail() {}

  @RequiredEntityPermissions(DEFAULT_SYSTEM_ENTITIES.CARD_PURCHASE, [
    DEFAULT_ENTITY_PERMISSIONS.EDIT_SELF,
  ])
  @Get('test-edit-self-success')
  public testUserEditSelfSuccess() {}

  @RequiredEntityPermissions(DEFAULT_SYSTEM_ENTITIES.CARD_PURCHASE, [
    DEFAULT_ENTITY_PERMISSIONS.EDIT_ALL,
  ])
  @Get('test-view-self-fail')
  public testUserEditAllFail() {}

  @RequiredEntityPermissions(DEFAULT_SYSTEM_ENTITIES.SYSTEM_CONFIG, [
    DEFAULT_ENTITY_PERMISSIONS.VIEW_ALL,
  ])
  @Get('test-view-custom-success')
  public testUserViewCustomSuccess() {}
}
