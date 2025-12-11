import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsObject,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';

import { ENTITY_STATUS } from '@shared/constants';
import { TrimAndLowercase } from '@shared/decorators/sanitize-input';

export class CreateBlockchainConfigDto {
  @ApiProperty({ description: 'Tên blockchain (unique)', example: 'ethereum' })
  @IsString()
  @TrimAndLowercase()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Tên hiển thị',
    example: 'Ethereum Mainnet',
  })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiProperty({
    description: 'RPC URL',
    example: 'https://eth.llamarpc.com',
  })
  @IsString()
  @IsNotEmpty()
  rpcUrl: string;

  @ApiProperty({ description: 'Chain ID', example: 1 })
  @IsNumber()
  chainId: number;

  @ApiProperty({ description: 'Network name', example: 'mainnet' })
  @IsString()
  @TrimAndLowercase()
  @IsNotEmpty()
  network: string;

  @ApiProperty({
    description: 'Trạng thái',
    enum: ENTITY_STATUS,
    default: ENTITY_STATUS.ACTIVE,
  })
  @IsEnum(ENTITY_STATUS)
  @IsOptional()
  status?: ENTITY_STATUS;

  @ApiProperty({
    description: 'Native currency',
    example: 'ETH',
    required: false,
  })
  @IsString()
  @IsOptional()
  nativeCurrency?: string;

  @ApiProperty({
    description: 'Currency symbol',
    example: 'ETH',
    required: false,
  })
  @IsString()
  @IsOptional()
  currencySymbol?: string;

  @ApiProperty({
    description: 'Block time (seconds)',
    example: 12,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  blockTime?: number;

  @ApiProperty({
    description: 'Explorer URL',
    example: 'https://etherscan.io',
    required: false,
  })
  @IsString()
  @IsOptional()
  explorerUrl?: string;

  @ApiProperty({
    description: 'Metadata (JSON)',
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateBlockchainConfigDto extends PartialType(
  CreateBlockchainConfigDto,
) {}
