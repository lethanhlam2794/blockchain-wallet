import { Length, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserPasscodeDTO {
  @ApiProperty({
    example: '123456',
    description: '6-digit user passcode',
  })
  @IsNumberString()
  @Length(6, 6)
  passcode: string;
}

