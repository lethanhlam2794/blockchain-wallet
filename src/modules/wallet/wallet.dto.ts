import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsObject,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { SWEEP_TYPE } from '@shared/constants';

export class CreateWalletDto {
  @ApiProperty({
    description: 'Nhãn cho ví (tùy chọn)',
    example: 'Ví chính',
    required: false,
  })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty({
    description: 'Mô tả cho ví (tùy chọn)',
    example: 'Ví dùng cho giao dịch chính',
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

export class ImportWalletDto {
  @ApiProperty({
    description: 'Private key của ví cần import',
    example:
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  privateKey: string;

  @ApiProperty({
    description: 'Nhãn cho ví (tùy chọn)',
    example: 'Ví đã import',
    required: false,
  })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty({
    description: 'Mô tả cho ví (tùy chọn)',
    example: 'Ví được import từ private key',
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

export class TransferTokenDto {
  @ApiProperty({
    description: 'Địa chỉ ví nguồn (from)',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsString()
  @IsNotEmpty()
  fromAddress: string;

  @ApiProperty({
    description: 'Địa chỉ ví đích (to)',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  @IsString()
  @IsNotEmpty()
  toAddress: string;

  @ApiProperty({
    description: 'Số lượng token cần chuyển',
    example: '1.5',
  })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({
    description: 'Chain ID',
    example: 97,
  })
  @IsNumber()
  @Min(1)
  chainId: number;

  @ApiProperty({
    description: 'Loại token: native hoặc token',
    enum: SWEEP_TYPE,
    example: SWEEP_TYPE.NATIVE,
  })
  @IsEnum(SWEEP_TYPE)
  type: SWEEP_TYPE;

  @ApiProperty({
    description: 'Địa chỉ contract token (bắt buộc nếu type = token)',
    example: '0x55d398326f99059fF775485246999027B3197955',
    required: false,
  })
  @IsString()
  @IsOptional()
  tokenContractAddress?: string;
}

export class SweepTokensDto {
  @ApiProperty({
    description: 'Địa chỉ ví đích (ví nhận tất cả token)',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  })
  @IsString()
  @IsNotEmpty()
  targetAddress: string;

  @ApiProperty({
    description: 'Chain ID',
    example: 97,
  })
  @IsNumber()
  @Min(1)
  chainId: number;

  @ApiProperty({
    description: 'Loại token cần gom: native hoặc token',
    enum: SWEEP_TYPE,
    example: SWEEP_TYPE.NATIVE,
  })
  @IsEnum(SWEEP_TYPE)
  type: SWEEP_TYPE;

  @ApiProperty({
    description: 'Địa chỉ contract token (bắt buộc nếu type = token)',
    example: '0x55d398326f99059fF775485246999027B3197955',
    required: false,
  })
  @IsString()
  @IsOptional()
  tokenContractAddress?: string;
}
