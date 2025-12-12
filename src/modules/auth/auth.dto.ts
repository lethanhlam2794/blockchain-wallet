import {
  IsAlphanumeric,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { OperationResult, stringUtils } from 'mvc-common-toolkit';

import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserPasscodeDTO } from '@modules/user/user.dto';

import { ERR_CODE } from '@shared/constants';

export class RedeemLoginTokenDTO {
  @MinLength(6)
  @MaxLength(60)
  @IsAlphanumeric()
  loginToken: string;
}

export class RegisterDTO extends UserPasscodeDTO {
  public validate(): OperationResult {
    if (this.email) {
      const isEmailValid =
        /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(this.email);
      if (!isEmailValid) {
        return {
          success: false,
          message: 'invalid email format',
          code: ERR_CODE.INVALID_EMAIL_FORMAT,
          httpCode: HttpStatus.BAD_REQUEST,
        };
      }
    }

    if (this.username) {
      const isUsernameValid = /^[^\d][a-zA-Z0-9_]*$/;
      if (!isUsernameValid) {
        return {
          success: false,
          message: 'username is invalid',
          code: ERR_CODE.INVALID_USERNAME_FORMAT,
          httpCode: HttpStatus.BAD_REQUEST,
        };
      }
    }

    const errorMsg = stringUtils.validatePasswordStrengthWithMessage(
      this.password,
    );

    if (errorMsg) {
      return {
        success: false,
        message: errorMsg,
        code: ERR_CODE.INVALID_PASSWORD_FORMAT,
        httpCode: HttpStatus.BAD_REQUEST,
      };
    }

    return {
      success: true,
    };
  }

  @ApiProperty({
    example: 'abc@gmail.com',
  })
  @IsOptional()
  @MaxLength(100)
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'user123',
  })
  @MinLength(5)
  @MaxLength(30)
  @IsAlphanumeric()
  username: string;

  @ApiProperty({
    example: 'Abcd@1234',
  })
  @MinLength(8)
  @MaxLength(60)
  password: string;
}

export class RegisterFirstUserDTO {
  @ApiProperty({
    example: 'abc@gmail.com',
  })
  @IsOptional()
  @MaxLength(100)
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'user123',
  })
  @MinLength(5)
  @MaxLength(30)
  @IsAlphanumeric()
  username: string;

  @ApiProperty({
    example: 'Abcd@1234',
  })
  @MinLength(8)
  @MaxLength(60)
  password: string;
}

export class CheckValidationDTO {
  @IsOptional()
  @MaxLength(100)
  @IsEmail()
  email: string;

  @MinLength(5)
  @MaxLength(30)
  @IsAlphanumeric()
  username: string;
}

export class AdminLoginDTO {
  @ApiPropertyOptional({
    example: 'user1234',
  })
  @MinLength(5)
  @MaxLength(100)
  @IsString()
  username: string;

  @ApiProperty({
    example: 'Abcd@1234',
  })
  @MinLength(8)
  @MaxLength(60)
  password: string;
}

export class LoginDTO {
  @ApiPropertyOptional({
    example: 'user1234',
  })
  @MinLength(5)
  @MaxLength(100)
  @IsString()
  usernameOrEmail: string;

  @ApiProperty({
    example: 'Abcd@1234',
  })
  @MinLength(8)
  @MaxLength(60)
  password: string;
}

export class VerifyEmailDto {
  @ApiProperty({
    example: 'abc',
  })
  @MinLength(8)
  @MaxLength(255)
  token: string;
}

export class ResendEmailDto {
  @ApiProperty({
    example: 'abc@gmail.com',
  })
  @IsEmail()
  @MinLength(3)
  @MaxLength(255)
  email: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'abc@gmail.com',
  })
  @IsEmail()
  @MinLength(3)
  @MaxLength(255)
  email: string;
}
