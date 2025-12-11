import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { Audit } from '@shared/models/audit.model';
import { ENTITY_STATUS } from '@shared/constants';

@Entity('wallets')
@Unique(['address'])
@Index('IDX_wallets_status_address', ['status', 'address'])
export class Wallet extends Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'text', name: 'private_key' })
  privateKey: string;

  @Column({ type: 'varchar', length: 20, default: ENTITY_STATUS.ACTIVE })
  status: ENTITY_STATUS;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'label' })
  label?: string;

  @Column({ type: 'text', nullable: true, name: 'description' })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}

