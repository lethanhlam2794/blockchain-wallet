import dayjs from 'dayjs';
import * as ejs from 'ejs';
import { readFileSync } from 'fs';
import { HttpResponse, MailService, stringUtils } from 'mvc-common-toolkit';

import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserPasscodeDTO } from '@modules/user/user.dto';
import { UserDocument, extractPublicUserInfo } from '@modules/user/user.model';
import { UserService } from '@modules/user/user.service';

import {
  ENV_KEY,
  ERR_CODE,
  INJECTION_TOKEN,
  MAX_SEND_EMAIL_RECORDS_PER_MINUTE,
} from '@shared/constants';
import { RequestUser } from '@shared/decorators/request-user';
import {
  CallQueueInterceptor,
  MaxConcurrencyCall,
  UseCallQueue,
} from '@shared/interceptors/call-queue.interceptor';
import { UseCaptcha } from '@shared/interceptors/google-captcha-validation.interceptor';
import { ApplyRateLimiting } from '@shared/interceptors/rate-limiting.interceptor';
import { UserAuthProfile } from '@shared/interfaces';

import {
  LoginDTO,
  RedeemLoginTokenDTO,
  RegisterDTO,
  ResendEmailDto,
  VerifyEmailDto,
} from './auth.dto';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@ApiTags('user/authentication')
@Controller('auth')
export class AuthController {
  constructor(
    protected authService: AuthService,
    protected jwtService: JwtService,
    protected userService: UserService,
    protected configService: ConfigService,

    @Inject(INJECTION_TOKEN.MAILER_SERVICE)
    protected mailService: MailService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'register user' })
  @UseCaptcha()
  @UseInterceptors(CallQueueInterceptor)
  @MaxConcurrencyCall(10)
  public async register(@Body() dto: RegisterDTO): Promise<HttpResponse> {
    const validationResult = dto.validate();
    if (!validationResult.success) {
      return validationResult;
    }

    const duplicationCheck = await this.userService.verifyUserUniqueness(dto);
    if (!duplicationCheck.success) {
      return duplicationCheck;
    }

    const validateReferrerResult = await this.userService.isReferrerValid(
      dto.refCode,
    );
    if (!validateReferrerResult.success) {
      return validateReferrerResult;
    }

    if (!validateReferrerResult.data.isValid) {
      return {
        success: false,
        message: 'invalid referral data',
        code: validateReferrerResult.data.code,
      };
    }

    const registerResult = await this.authService.register(
      stringUtils.generateRandomId(),
      dto,
    );

    if (!registerResult.success) {
      return registerResult;
    }

    const token = this.authService.generateOtpToken();

    await this.userService.updateById(registerResult.data.id, { token });

    const template = readFileSync('templates/verify-email.ejs', 'utf-8');
    const compiledTemplate = ejs.render(template, {
      verifyUrl: `${this.configService.getOrThrow(ENV_KEY.APP_PUBLIC_URL)}/verify-email?token=${token}`,
    });

    this.mailService.send({
      to: dto.email,
      subject: '[Vinachain] Please verify your email',
      html: compiledTemplate,
    });

    return {
      success: true,
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'login user' })
  @UseCaptcha()
  @UseInterceptors(CallQueueInterceptor)
  @MaxConcurrencyCall(20)
  public async login(@Body() dto: LoginDTO): Promise<HttpResponse> {
    const loginResult = await this.authService.login(
      stringUtils.generateRandomId(),
      dto,
    );

    if (!loginResult.success) {
      return loginResult;
    }

    const { data } = loginResult;

    const hasPasscode = !!data.passcode;
    return {
      success: true,
      data: {
        access_token: await this.jwtService.signAsync({
          id: data.id,
          role: data.role,
          loginAt: dayjs().unix(),
          hasPasscode,
        }),
        user: extractPublicUserInfo(data),
        hasPasscode,
      },
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'user info' })
  @Get('whoami')
  public async whoami(
    @RequestUser() user: UserDocument,
  ): Promise<HttpResponse> {
    return {
      success: true,
      data: extractPublicUserInfo(user),
    };
  }

  @ApiOperation({
    summary: 'redeem login token as user',
  })
  @Post('redeem-login-token')
  @UseCaptcha()
  @UseInterceptors(CallQueueInterceptor)
  public async redeemLoginToken(
    @Body() dto: RedeemLoginTokenDTO,
  ): Promise<HttpResponse> {
    const loginResult = await this.authService.getUserByLoginToken(
      dto.loginToken,
    );

    if (!loginResult.success) {
      return loginResult;
    }

    return {
      success: true,
      data: loginResult.data,
    };
  }

  @ApiOperation({
    summary: 'verify user email address',
  })
  @Post('verify-email')
  @UseInterceptors(CallQueueInterceptor)
  @MaxConcurrencyCall(10)
  async verifyEmail(@Body() body: VerifyEmailDto): Promise<HttpResponse> {
    const user = await this.userService.getOne({ token: body.token });
    if (!user) {
      return {
        success: false,
        message: 'Invalid token or expired',
        code: ERR_CODE.INVALID_TOKEN,
      };
    }
    if (user.isVerified) {
      return {
        success: false,
        message: 'user already verified',
        code: ERR_CODE.USER_ALREADY_VERIFIED,
      };
    }

    await this.userService.updateById(user.id, {
      isVerified: true,
      token: null,
    });

    const hasPasscode = !!user.passcode;

    return {
      success: true,
      data: {
        access_token: await this.jwtService.signAsync({
          id: user.id,
          loginAt: dayjs().unix(),
          hasPasscode,
        }),
        user: extractPublicUserInfo(user),
        hasPasscode,
      },
    };
  }

  @ApplyRateLimiting(MAX_SEND_EMAIL_RECORDS_PER_MINUTE)
  @Post('email/resend')
  @UseInterceptors(CallQueueInterceptor)
  @MaxConcurrencyCall(5)
  async resendEmail(@Body() body: ResendEmailDto): Promise<HttpResponse> {
    const user = await this.userService.getOne({ email: body.email });
    if (!user) {
      return {
        success: false,
        message: 'user not found',
        code: ERR_CODE.NOT_FOUND,
      };
    }
    if (user.isVerified) {
      return {
        success: false,
        message: 'user already verified',
        code: ERR_CODE.USER_ALREADY_VERIFIED,
      };
    }

    const token = this.authService.generateOtpToken();

    await this.userService.updateById(user.id, { token });

    const template = readFileSync('templates/verify-email.ejs', 'utf-8');
    const compiledTemplate = ejs.render(template, {
      verifyUrl: `${this.configService.getOrThrow(ENV_KEY.APP_PUBLIC_URL)}/verify-email?token=${token}`,
    });

    await this.mailService.send({
      to: body.email,
      subject: '[Vinachain] Please verify your email',
      html: compiledTemplate,
    });

    return {
      success: true,
    };
  }

  @ApplyRateLimiting(MAX_SEND_EMAIL_RECORDS_PER_MINUTE)
  @Post('forgot-password')
  @UseInterceptors(CallQueueInterceptor)
  @MaxConcurrencyCall(5)
  async forgotPassword(@Body() body: ResendEmailDto): Promise<HttpResponse> {
    const resetResult = await this.authService.beginForgotUserPassword(
      body.email,
    );

    if (!resetResult.success) {
      return resetResult;
    }

    return {
      success: true,
    };
  }

  @ApiOperation({ summary: 'create user passcode' })
  @ApiBearerAuth()
  @UseCallQueue()
  @UseCaptcha()
  @UseGuards(AuthGuard)
  @Post('create-passcode')
  public async createUserPasscode(
    @RequestUser() user: UserAuthProfile,
    @Body() dto: UserPasscodeDTO,
  ) {
    return this.userService.createUserPasscode(user, dto);
  }
}
