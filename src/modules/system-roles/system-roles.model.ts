import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { Audit } from '@shared/models/audit.model';

@Entity('system_roles')
@Unique(['name'])
export class SystemRole extends Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  name: string;

  @Column({ type: 'boolean', default: false })
  isSuperAdmin: boolean;
}

@Entity('system_entities')
@Unique(['name'])
export class SystemEntity extends Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  name: string;
}

@Entity('entity_permissions')
@Unique(['name'])
export class EntityPermission extends Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  name: string;
}

@Entity('role_permissions')
@Unique(['roleName', 'entityName'])
export class RolePermission extends Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  roleName: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  entityName: string;

  @Column({ type: 'text', array: true })
  permissions: string[];
}

@Entity('user_role_permissions')
@Unique(['userId', 'entityName', 'type'])
export class UserRolePermission extends Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  entityName: string;

  @Column({ type: 'varchar', length: 20 })
  type: 'allowed' | 'forbidden';

  @Column({ type: 'text', array: true })
  permissions: string[];
}
