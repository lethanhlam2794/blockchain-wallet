import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { Audit } from '@shared/models/audit.model';
import { DEFAULT_ROLES } from '@modules/system-roles/default-roles';
import { ENTITY_STATUS } from '@shared/constants';

@Entity('users')
@Unique(['email'])
@Unique(['username'])
export class User extends Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 30 })
  @Index()
  username: string;

  @Column({ type: 'text' })
  password: string;

  @Column({ type: 'varchar', length: 20, default: DEFAULT_ROLES.USER.name })
  role: string;

  @Column({ type: 'varchar', length: 20, default: ENTITY_STATUS.ACTIVE })
  status: ENTITY_STATUS;

  @Column({ type: 'boolean', default: false, name: 'is_verified' })
  isVerified: boolean;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'referrer_code' })
  referrerCode?: string;

  @Column({ type: 'text', nullable: true })
  passcode?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  token?: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
    name: 'wallet_address',
  })
  walletAddress?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  toObject(): Record<string, any> {
    return { ...this };
  }
}

export type UserDocument = User;

export function extractPublicUserInfo(user: User) {
  const {
    id,
    email,
    username,
    code,
    role,
    isVerified,
    walletAddress,
    createdAt,
    updatedAt,
  } = user || {};

  return {
    id,
    email,
    username,
    code,
    role,
    isVerified,
    walletAddress,
    createdAt,
    updatedAt,
  };
}

