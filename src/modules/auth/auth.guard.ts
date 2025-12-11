import { Request } from 'express';
import { CacheService } from 'mvc-common-toolkit';

import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { UserDocument } from '@modules/user/user.model';
import { UserService } from '@modules/user/user.service';

import {
  ENTITY_STATUS,
  INJECTION_TOKEN,
  METADATA_KEY,
} from '@shared/constants';
import { lastLoginAtTimestampCacheKey } from '@shared/key';

export const Public = () => SetMetadata(METADATA_KEY.IS_PUBLIC, true);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(INJECTION_TOKEN.REDIS_SERVICE)
    protected cacheService: CacheService,

    private jwtService: JwtService,
    private userService: UserService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get(
      METADATA_KEY.IS_PUBLIC,
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      if (!payload.loginAt) {
        throw new UnauthorizedException();
      }

      const cacheKey = lastLoginAtTimestampCacheKey();
      const cachedData = await this.cacheService.get(cacheKey);

      if (cachedData) {
        const lastForceLoginAt = Number(cachedData);

        if (
          !Number.isNaN(lastForceLoginAt) &&
          payload.loginAt < lastForceLoginAt
        ) {
          throw new UnauthorizedException();
        }
      }

      const user: UserDocument = await this.userService.getById(payload.id);

      if (!user || user.status !== ENTITY_STATUS.ACTIVE) {
        throw new UnauthorizedException();
      }

      if (user.walletAddress) {
        user.walletAddress = user.walletAddress.toLowerCase();
      }

      request.user = payload;
      request.activeUser = {
        ...payload,
        ...user.toObject(),
      };
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
