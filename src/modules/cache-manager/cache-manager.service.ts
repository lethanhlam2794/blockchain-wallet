import { CacheService } from 'mvc-common-toolkit';

import { Inject, Injectable, Logger } from '@nestjs/common';

import { INJECTION_TOKEN } from '@shared/constants';

@Injectable()
export class CacheManagerService {
  protected logger = new Logger(CacheManagerService.name);

  constructor(
    @Inject(INJECTION_TOKEN.REDIS_SERVICE)
    protected cacheService: CacheService,
  ) {}
}
