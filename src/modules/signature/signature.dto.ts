import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsObject,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

export enum SignatureType {
  HMAC = 'hmac',
  ETHEREUM = 'ethereum',
}

export class GenerateSignatureDto {
  @ApiProperty({
    description: 'Loại signature (hmac hoặc ethereum)',
    enum: SignatureType,
    example: SignatureType.ETHEREUM,
  })
  @IsEnum(SignatureType)
  @IsNotEmpty()
  type: SignatureType;

  @ApiProperty({
    description: 'HTTP method',
    example: 'POST',
  })
  @IsString()
  @IsNotEmpty()
  method: string;

  @ApiProperty({
    description: 'API path',
    example: '/api/endpoint',
  })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiPropertyOptional({
    description: 'Request body (nếu có)',
    example: { data: 'test' },
  })
  @IsObject()
  @IsOptional()
  body?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Query parameters (nếu có)',
    example: { page: 1, limit: 10 },
  })
  @IsObject()
  @IsOptional()
  query?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Timestamp (nếu không có sẽ dùng thời gian hiện tại)',
    example: 1234567890,
  })
  @IsOptional()
  timestamp?: number;

  @ApiPropertyOptional({
    description:
      'Private key (chỉ dùng cho Ethereum signature, nếu không có sẽ dùng wallet từ config)',
    example: '0x...',
  })
  @IsString()
  @IsOptional()
  privateKey?: string;
}

export class GenerateMessageSignatureDto {
  @ApiProperty({
    description: 'Message cần sign',
    example: 'Hello, this is a message to sign',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    description: 'Private key (nếu không có sẽ dùng wallet từ config)',
    example: '0x...',
  })
  @IsString()
  @IsOptional()
  privateKey?: string;
}
