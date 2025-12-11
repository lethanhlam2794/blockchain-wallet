import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { DEFAULT_ROLES } from '@modules/system-roles/default-roles';

import { ENTITY_STATUS } from '@shared/constants';
import { Audit } from '@shared/models/audit.model';

@Entity('system_users')
@Unique(['username'])
export class SystemUser extends Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fullName: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: DEFAULT_ROLES.OPERATOR.name,
  })
  role: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: ENTITY_STATUS.ACTIVE,
  })
  status: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deletedBy?: string;

  @Column({ type: 'text' })
  password: string;
}

export type SystemUserDocument = SystemUser;
