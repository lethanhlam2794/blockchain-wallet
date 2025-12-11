import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { Audit } from '@shared/models/audit.model';
import { ENTITY_STATUS } from '@shared/constants';

@Entity('tokens')
@Unique(['address', 'chainId'])
@Index('IDX_tokens_status_chainId', ['status', 'chainId'])
@Index('IDX_tokens_symbol', ['symbol'])
export class Token extends Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 50 })
  symbol: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name?: string;

  @Column({ type: 'int', default: 18, name: 'decimals' })
  decimals: number;

  @Column({ type: 'bigint', name: 'chain_id' })
  chainId: number;

  @Column({ type: 'varchar', length: 20, default: ENTITY_STATUS.ACTIVE })
  status: ENTITY_STATUS;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'label' })
  label?: string;

  @Column({ type: 'text', nullable: true, name: 'description' })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
