import { ApiProperty } from '@nestjs/swagger';
import { TrimAndLowercase } from '@shared/decorators/sanitize-input';
import {
  IsString,
  IsOptional,
  IsObject,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class ImportTokenDto {
  @ApiProperty({
    description: 'Địa chỉ contract của token',
    example: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  })
  @IsString()
  @TrimAndLowercase()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Symbol của token (ví dụ: USDT, USDC)',
    example: 'USDT',
  })
  @IsString()
  @TrimAndLowercase()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty({
    description: 'Tên đầy đủ của token (tùy chọn)',
    example: 'Tether USD',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Số decimals của token (mặc định: 18)',
    example: 6,
    required: false,
    default: 18,
  })
  @IsNumber()
  @Min(0)
  @Max(18)
  @IsOptional()
  decimals?: number;

  @ApiProperty({
    description:
      'Chain ID (ví dụ: 1 cho Ethereum, 56 cho BSC). Lưu ý: Blockchain config với chainId này phải đã tồn tại trong hệ thống.',
    example: 1,
  })
  @IsNumber()
  chainId: number;

  @ApiProperty({
    description: 'Nhãn cho token (tùy chọn)',
    example: 'USDT trên Ethereum',
    required: false,
  })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty({
    description: 'Mô tả cho token (tùy chọn)',
    example: 'Tether USD stablecoin',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Metadata bổ sung (tùy chọn)',
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
