export const DEFAULT_ROLES = {
  SUPER_ADMIN: {
    name: 'super_admin',
    isSuperAdmin: true,
  },
  ADMIN: {
    name: 'admin',
    isSuperAdmin: false,
  },
  OPERATOR: {
    name: 'operator',
    isSuperAdmin: false,
  },
  USER: {
    name: 'user',
    isSuperAdmin: false,
  },
};

export const DEFAULT_SYSTEM_ENTITIES = {
  SYSTEM_USER: 'system_user',
  SYSTEM_PERMISSION: 'system_permission',
  SYSTEM_CONFIG: 'system_config',
  USER_DETAILS: 'user_details',
  CARD: 'card',
  CARD_PURCHASE: 'card_purchase',
  CARD_PURCHASE_HISTORY: 'card_purchase_history',
  CARD_KYC: 'card_kyc',
  USER: 'user',
  USER_KYC: 'user_kyc',
};

export const DEFAULT_ENTITY_PERMISSIONS = {
  VIEW_SELF: 'view_self',
  VIEW_ALL: 'view_all',
  CREATE_SELF: 'create_self',
  CREATE_ALL: 'create_all',
  EDIT_SELF: 'edit_self',
  EDIT_ALL: 'edit_all',
  DELETE_SELF: 'delete_self',
  DELETE_ALL: 'delete_all',
  ALL_SELF: 'all_self',
  ALL: 'all',
};

const SUPER_ADMIN_ONLY_ENTITIES = [
  DEFAULT_SYSTEM_ENTITIES.SYSTEM_USER,
  DEFAULT_SYSTEM_ENTITIES.SYSTEM_PERMISSION,
  DEFAULT_SYSTEM_ENTITIES.SYSTEM_CONFIG,
];

export const DEFAULT_ROLE_PERMISSIONS = [
  // Admin permission: All, but not admin tasks, and customized system permission
  ...Object.values(DEFAULT_SYSTEM_ENTITIES)
    .filter((i) => !SUPER_ADMIN_ONLY_ENTITIES.includes(i))
    .map((entity) => ({
      roleName: DEFAULT_ROLES.ADMIN.name,
      entityName: entity,
      permissions: [DEFAULT_ENTITY_PERMISSIONS.ALL],
    })),

  {
    roleName: DEFAULT_ROLES.ADMIN.name,
    entityName: DEFAULT_SYSTEM_ENTITIES.SYSTEM_USER,
    permissions: [
      DEFAULT_ENTITY_PERMISSIONS.VIEW_SELF,
      DEFAULT_ENTITY_PERMISSIONS.EDIT_SELF,
    ],
  },
  {
    roleName: DEFAULT_ROLES.ADMIN.name,
    entityName: DEFAULT_SYSTEM_ENTITIES.SYSTEM_CONFIG,
    permissions: [
      DEFAULT_ENTITY_PERMISSIONS.VIEW_ALL,
      DEFAULT_ENTITY_PERMISSIONS.EDIT_ALL,
    ],
  },
  {
    roleName: DEFAULT_ROLES.ADMIN.name,
    entityName: DEFAULT_SYSTEM_ENTITIES.SYSTEM_PERMISSION,
    permissions: [DEFAULT_ENTITY_PERMISSIONS.VIEW_SELF],
  },

  // Operators can view self & all, but not administration and system permission
  ...Object.values(DEFAULT_SYSTEM_ENTITIES)
    .filter((i) => !SUPER_ADMIN_ONLY_ENTITIES.includes(i))
    .map((entity) => ({
      roleName: DEFAULT_ROLES.OPERATOR.name,
      entityName: entity,
      permissions: [DEFAULT_ENTITY_PERMISSIONS.ALL_SELF],
    })),

  {
    roleName: DEFAULT_ROLES.OPERATOR.name,
    entityName: DEFAULT_SYSTEM_ENTITIES.SYSTEM_USER,
    permissions: [
      DEFAULT_ENTITY_PERMISSIONS.VIEW_SELF,
      DEFAULT_ENTITY_PERMISSIONS.EDIT_SELF,
    ],
  },

  // User can do all belong to self, and not allowed to CRUD administration or system permissions
  ...Object.values(DEFAULT_SYSTEM_ENTITIES)
    .filter((i) => !SUPER_ADMIN_ONLY_ENTITIES.includes(i))
    .map((entity) => ({
      roleName: DEFAULT_ROLES.USER.name,
      entityName: entity,
      permissions: [DEFAULT_ENTITY_PERMISSIONS.VIEW_SELF],
    })),
];
