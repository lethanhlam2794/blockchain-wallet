import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { Audit } from '@shared/models/audit.model';
import { ENTITY_STATUS } from '@shared/constants';

@Entity('blockchain_configs')
@Unique(['name'])
@Index('IDX_blockchain_configs_status_name', ['status', 'name'])
export class BlockchainConfig extends Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, name: 'display_name' })
  displayName: string;

  @Column({ type: 'text', name: 'rpc_url' })
  rpcUrl: string;

  @Column({ type: 'bigint', name: 'chain_id' })
  chainId: number;

  @Column({ type: 'varchar', length: 50 })
  network: string;

  @Column({ type: 'varchar', length: 20, default: ENTITY_STATUS.ACTIVE })
  status: ENTITY_STATUS;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'native_currency',
  })
  nativeCurrency: string;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
    name: 'currency_symbol',
  })
  currencySymbol: string;

  @Column({ type: 'int', nullable: true, name: 'block_time' })
  blockTime: number;

  @Column({ type: 'text', nullable: true, name: 'explorer_url' })
  explorerUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
