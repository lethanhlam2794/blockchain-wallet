import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { TrimAndLowercase } from '@shared/decorators/sanitize-input';

export class SendTransactionDto {
  @ApiProperty({
    description: 'Địa chỉ nhận',
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  })
  @IsString()
  @TrimAndLowercase()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    description: 'Số lượng ETH cần gửi',
    example: '0.1',
  })
  @IsString()
  @IsNotEmpty()
  amount: string;
}
