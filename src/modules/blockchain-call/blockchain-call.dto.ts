import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsNumber,
  IsIn,
} from 'class-validator';
import { BLOCKCHAIN_CALL_STATUS } from '@shared/constants';

export class CreateBlockchainCallDto {
  @ApiProperty({
    description: 'Loại signature',
    enum: ['ethereum', 'hmac'],
    example: 'ethereum',
  })
  @IsIn(['ethereum', 'hmac'])
  signatureType: 'ethereum' | 'hmac';

  @ApiProperty({
    description: 'HTTP method của backend API',
    example: 'POST',
  })
  @IsString()
  backendMethod: string;

  @ApiProperty({
    description: 'Path của backend API',
    example: '/api/transactions/create',
  })
  @IsString()
  backendPath: string;

  @ApiPropertyOptional({
    description: 'Wallet address (cho Ethereum signature)',
    example: '0xeb71Ee5D23C02B1D7B7983721F2BCC2B4A373485',
  })
  @IsString()
  @IsOptional()
  walletAddress?: string;

  @ApiPropertyOptional({
    description: 'Signature đã tạo',
  })
  @IsString()
  @IsOptional()
  signature?: string;

  @ApiPropertyOptional({
    description: 'Timestamp dùng để tạo signature',
  })
  @IsNumber()
  @IsOptional()
  timestamp?: number;

  @ApiPropertyOptional({
    description: 'Request body',
  })
  @IsObject()
  @IsOptional()
  requestBody?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Request query params',
  })
  @IsObject()
  @IsOptional()
  requestQuery?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Request headers (cho HMAC)',
  })
  @IsObject()
  @IsOptional()
  requestHeaders?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Trạng thái',
    enum: BLOCKCHAIN_CALL_STATUS,
    default: BLOCKCHAIN_CALL_STATUS.SCHEDULED,
  })
  @IsEnum(BLOCKCHAIN_CALL_STATUS)
  @IsOptional()
  status?: BLOCKCHAIN_CALL_STATUS;

  @ApiPropertyOptional({
    description: 'Metadata bổ sung',
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateBlockchainCallDto {
  @ApiPropertyOptional({
    description: 'Trạng thái',
    enum: BLOCKCHAIN_CALL_STATUS,
  })
  @IsEnum(BLOCKCHAIN_CALL_STATUS)
  @IsOptional()
  status?: BLOCKCHAIN_CALL_STATUS;

  @ApiPropertyOptional({
    description: 'Response từ backend',
  })
  @IsString()
  @IsOptional()
  backendResponse?: string;

  @ApiPropertyOptional({
    description: 'HTTP status code từ backend',
  })
  @IsNumber()
  @IsOptional()
  backendStatusCode?: number;

  @ApiPropertyOptional({
    description: 'Error message nếu có',
  })
  @IsString()
  @IsOptional()
  errorMessage?: string;

  @ApiPropertyOptional({
    description: 'Metadata bổ sung',
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

