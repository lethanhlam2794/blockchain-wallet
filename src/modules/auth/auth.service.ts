import dayjs from 'dayjs';
import * as ejs from 'ejs';
import { readFileSync } from 'fs';
import {
  AuditService,
  CacheService,
  ErrorLog,
  MailService,
  OperationResult,
  bcryptHelper,
  stringUtils,
} from 'mvc-common-toolkit';

import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { SystemUserDocument } from '@modules/system-user/system-user.model';
import { SystemUserService } from '@modules/system-user/system-user.service';
import { User, extractPublicUserInfo } from '@modules/user/user.model';
import { UserService } from '@modules/user/user.service';

import {
  APP_ACTION,
  ENTITY_STATUS,
  ERR_CODE,
  INJECTION_TOKEN,
} from '@shared/constants';
import { isEmail } from '@shared/utils/email';
import { generateForbiddenResult } from '@shared/utils/operation-result';

import {
  AdminLoginDTO,
  LoginDTO,
  RegisterDTO,
  RegisterFirstUserDTO,
} from './auth.dto';

@Injectable()
export class AuthService {
  protected logger = new Logger(AuthService.name);
  constructor(
    protected userService: UserService,
    protected systemUserService: SystemUserService,
    protected jwtService: JwtService,

    @Inject(INJECTION_TOKEN.AUDIT_SERVICE)
    protected auditService: AuditService,

    @Inject(INJECTION_TOKEN.MAILER_SERVICE)
    protected mailService: MailService,

    @Inject(INJECTION_TOKEN.REDIS_SERVICE)
    protected cacheService: CacheService,
  ) {}

  public async register(
    logId: string,
    data: RegisterDTO,
  ): Promise<OperationResult> {
    try {
      const passwordHashed = await bcryptHelper.hash(data.password);
      const newReferralCode = this.userService.generateReferralCode();
      const hashedPasscode = await bcryptHelper.hash(data.passcode);

      const newUser = await this.userService.create({
        email: data.email.toLowerCase(),
        username: data.username.toLowerCase(),
        password: passwordHashed,
        referrerCode: data.refCode,
        code: newReferralCode,
        passcode: hashedPasscode,
      });

      return {
        success: true,
        data: newUser,
      };
    } catch (error) {
      this.logger.error(error.message, error.stack);

      this.auditService.emitLog(
        new ErrorLog({
          logId: logId,
          message: error.message,
          payload: data,
          action: APP_ACTION.REGISTER,
        }),
      );

      return { success: false };
    }
  }
  public async registerWithoutRefCode(
    logId: string,
    data: RegisterFirstUserDTO,
  ): Promise<OperationResult> {
    try {
      const passwordHashed = await bcryptHelper.hash(data.password);
      const newReferralCode = this.userService.generateReferralCode();

      const newUser = await this.userService.create({
        email: data.email.toLowerCase(),
        username: data.username.toLowerCase(),
        password: passwordHashed,
        code: newReferralCode,
      });

      return {
        success: true,
        data: newUser,
      };
    } catch (error) {
      this.logger.error(error.message, error.stack);

      this.auditService.emitLog(
        new ErrorLog({
          logId: logId,
          message: error.message,
          payload: data,
          action: APP_ACTION.REGISTER,
        }),
      );

      return { success: false };
    }
  }

  public async getUserByLoginToken(token: string): Promise<OperationResult> {
    const cacheKey = `user:login_token:${token}`;
    const foundUserId = await this.cacheService.get(cacheKey);
    if (!foundUserId) {
      return {
        success: false,
        message: 'user not found',
        code: ERR_CODE.USER_NOT_FOUND,
        httpCode: HttpStatus.NOT_FOUND,
      };
    }

    const user = await this.userService.getById(foundUserId);

    const userPublicInfo = extractPublicUserInfo(user);

    await this.cacheService.del(cacheKey);

    const hasPasscode = !!user.passcode;

    return {
      success: true,
      data: {
        user: userPublicInfo,
        access_token: await this.jwtService.signAsync(
          { id: user.id, loginAt: dayjs().unix(), hasPasscode },
          { expiresIn: '1h' },
        ),
        hasPasscode,
      },
    };
  }

  public async login(logId: string, data: LoginDTO): Promise<OperationResult> {
    try {
      let user: User;

      if (isEmail(data.usernameOrEmail)) {
        user = await this.userService.getOne(
          {
            email: data.usernameOrEmail.trim().toLocaleLowerCase(),
          },
          { forceReload: true },
        );
      } else {
        user = await this.userService.getOne(
          {
            username: data.usernameOrEmail.trim().toLocaleLowerCase(),
          },
          { forceReload: true },
        );
      }

      if (!user) {
        return {
          success: false,
          message: 'user not found',
          code: ERR_CODE.NOT_FOUND,
          httpCode: HttpStatus.NOT_FOUND,
        };
      }
      if (!user.isVerified) {
        return {
          success: false,
          message: 'user not verified',
          code: ERR_CODE.USER_NOT_VERIFIED,
          httpCode: HttpStatus.BAD_REQUEST,
        };
      }

      if (user.status !== ENTITY_STATUS.ACTIVE) {
        return generateForbiddenResult(
          'user suspended',
          ERR_CODE.ACCOUNT_SUSPENDED,
        );
      }

      const isPasswordValid = await bcryptHelper.compare(
        data.password,
        user.password,
      );
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'password incorrect',
          httpCode: HttpStatus.UNAUTHORIZED,
          code: ERR_CODE.UNAUTHORIZED,
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      this.logger.error(error.message, error.stack);

      this.auditService.emitLog(
        new ErrorLog({
          logId: logId,
          message: error.message,
          payload: data,
          action: APP_ACTION.LOGIN,
        }),
      );

      return { success: false };
    }
  }

  public async adminLogin(
    logId: string,
    data: AdminLoginDTO,
  ): Promise<OperationResult> {
    try {
      const systemUser: SystemUserDocument =
        await this.systemUserService.getOne({
          username: data.username,
        });

      if (!systemUser) {
        return {
          success: false,
          message: 'system user not found',
          code: ERR_CODE.NOT_FOUND,
          httpCode: HttpStatus.NOT_FOUND,
        };
      }

      if (!systemUser || systemUser.status !== ENTITY_STATUS.ACTIVE) {
        return {
          success: false,
          message: 'user not active',
          code: ERR_CODE.UNAUTHORIZED,
          httpCode: HttpStatus.UNAUTHORIZED,
        };
      }

      const isPasswordValid = await bcryptHelper.compare(
        data.password,
        systemUser.password,
      );

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'password incorrect',
          code: ERR_CODE.UNAUTHORIZED,
          httpCode: HttpStatus.UNAUTHORIZED,
        };
      }

      return {
        success: true,
        data: systemUser,
      };
    } catch (error) {
      this.logger.error(error.message, error.stack);

      this.auditService.emitLog(
        new ErrorLog({
          logId: logId,
          message: error.message,
          payload: data,
          action: APP_ACTION.ADMIN_LOGIN,
        }),
      );

      return { success: false };
    }
  }

  public generateOtpToken(): string {
    return stringUtils.generatePassword(32).replace(/[^a-zA-Z ]/g, '');
  }

  public async beginForgotUserPassword(
    email: string,
  ): Promise<OperationResult> {
    const user = await this.userService.getOne({ email: email });
    if (!user) {
      return {
        success: false,
        message: 'user not found',
        code: ERR_CODE.NOT_FOUND,
      };
    }

    const newPassword = stringUtils.generatePassword(18);

    const template = readFileSync('templates/forgot-password.ejs', 'utf-8');
    const compiledTemplate = ejs.render(template, {
      username: user.username,
      newPassword,
    });

    await this.mailService.send({
      to: email,
      subject: '[Vinachain] Forgot Password',
      html: compiledTemplate,
    });

    const hashedPassword = await bcryptHelper.hash(newPassword);

    await this.userService.updateById(user.id, { password: hashedPassword });

    return {
      success: true,
    };
  }
}
