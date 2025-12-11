import { Request } from 'express';

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { SystemUserDocument } from '@modules/system-user/system-user.model';
import { SystemUserService } from '@modules/system-user/system-user.service';

import { ENTITY_STATUS } from '@shared/constants';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  protected logger = new Logger(AdminAuthGuard.name);

  constructor(
    private jwtService: JwtService,
    protected systemUserService: SystemUserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      if (!payload.loginAt) {
        this.logger.warn('payload not contains loginAt');

        throw new UnauthorizedException();
      }

      const systemUser: SystemUserDocument =
        await this.systemUserService.getById(payload.id);

      if (systemUser.updatedAt.valueOf() > payload.loginAt) {
        this.logger.warn(
          `user login at ${payload.loginAt} is before updated at: ${systemUser.updatedAt.valueOf()}`,
        );

        throw new UnauthorizedException();
      }

      if (!systemUser || systemUser.status !== ENTITY_STATUS.ACTIVE) {
        this.logger.warn('system user is not active');

        throw new UnauthorizedException();
      }

      request.systemUser = payload;
      request.activeSystemUser = systemUser;
    } catch (error) {
      this.logger.error(error.message, error.stack);

      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
