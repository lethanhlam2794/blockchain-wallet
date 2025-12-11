import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsNotEmpty } from 'class-validator';

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
