import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ENV_KEY, HEADER_KEY } from '@shared/constants';

@Injectable()
export class PartnerGuard implements CanActivate {
  protected logger = new Logger(PartnerGuard.name);

  constructor(protected configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessSecret = request.header(HEADER_KEY.PARTNER_ACCESS_SECRET);

    if (!accessSecret) {
      throw new UnauthorizedException('missing access keys');
    }

    const foundPartnerSecret = this.configService.getOrThrow(
      ENV_KEY.PARTNER_ACCESS_SECRET,
    );

    if (!foundPartnerSecret) {
      throw new UnauthorizedException('missing partner access keys');
    }

    if (foundPartnerSecret !== accessSecret) {
      throw new UnauthorizedException('unauthorized');
    }

    return true;
  }
}
