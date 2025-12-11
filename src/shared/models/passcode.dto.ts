import { IsNumberString, MaxLength, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class PassCodeRequiredDTO {
  @ApiProperty({
    example: '123456',
    description: '6-digit OTP passcode',
  })
  @MinLength(6)
  @MaxLength(6)
  @IsNumberString()
  passCode: string;
}
