import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { Audit } from '@shared/models/audit.model';
import { BLOCKCHAIN_CALL_STATUS } from '@shared/constants';

@Entity('blockchain_calls')
@Index('IDX_blockchain_calls_status', ['status'])
@Index('IDX_blockchain_calls_wallet_address', ['walletAddress'])
@Index('IDX_blockchain_calls_backend_path', ['backendPath', 'backendMethod'])
@Index('IDX_blockchain_calls_created_at', ['createdAt'])
@Index('IDX_blockchain_calls_ref_code', ['refCode'])
export class BlockchainCall extends Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, name: 'signature_type' })
  signatureType: 'ethereum' | 'hmac';

  @Column({ type: 'varchar', length: 10, name: 'backend_method' })
  backendMethod: string; // GET, POST, PUT, DELETE, etc.

  @Column({ type: 'varchar', length: 500, name: 'backend_path' })
  backendPath: string; // /api/endpoint

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'wallet_address',
  })
  walletAddress?: string; // Cho Ethereum signature

  @Column({ type: 'text', nullable: true })
  signature?: string; // Signature đã tạo

  @Column({ type: 'bigint', nullable: true })
  timestamp?: number; // Timestamp dùng để tạo signature

  @Column({ type: 'jsonb', nullable: true, name: 'request_body' })
  requestBody?: Record<string, any>; // Body của request

  @Column({ type: 'jsonb', nullable: true, name: 'request_query' })
  requestQuery?: Record<string, any>; // Query params

  @Column({ type: 'jsonb', nullable: true, name: 'request_headers' })
  requestHeaders?: Record<string, string>; // Headers đã gửi (cho HMAC)

  @Column({
    type: 'varchar',
    length: 50,
    default: BLOCKCHAIN_CALL_STATUS.SCHEDULED,
  })
  status: BLOCKCHAIN_CALL_STATUS;

  @Column({ type: 'text', nullable: true, name: 'backend_response' })
  backendResponse?: string; // Response từ backend (JSON string)

  @Column({ type: 'int', nullable: true, name: 'backend_status_code' })
  backendStatusCode?: number; // HTTP status code từ backend

  @Column({ type: 'text', nullable: true, name: 'error_message' })
  errorMessage?: string; // Lỗi nếu có

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'ref_code' })
  refCode?: string; // Reference code để link với các records khác

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>; // Thông tin bổ sung
}
