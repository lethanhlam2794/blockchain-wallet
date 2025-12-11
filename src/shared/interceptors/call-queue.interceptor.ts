import { createHash } from 'crypto';
import {
  AuditService,
  ErrorLog,
  RedisService,
  scripts,
} from 'mvc-common-toolkit';
import {
  Observable,
  TimeoutError,
  catchError,
  finalize,
  throwError,
  timeout,
} from 'rxjs';

import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
  SetMetadata,
  UseInterceptors,
  applyDecorators,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

import {
  APP_ACTION,
  CALL_QUEUE_EXPIRATION_SECS,
  CALL_QUEUE_SAFE_THRESHOLD,
  DEFAULT_MAX_CONCURRENT_CALL,
  INJECTION_TOKEN,
  METADATA_KEY,
  SPAM_BAN_EXPIRAION_SECS,
  USER_SPAM_LIMIT_BEFORE_BAN,
} from '@shared/constants';

import { UserAPICallInterceptor } from './user-api-call-interceptor';

export const MaxConcurrencyCall = (maxConcurrency: number) =>
  SetMetadata(METADATA_KEY.MAX_CONCURRENCY_CALL, maxConcurrency);

@Injectable()
export class CallQueueInterceptor
  extends UserAPICallInterceptor
  implements NestInterceptor
{
  protected logger = new Logger(CallQueueInterceptor.name);

  constructor(
    reflector: Reflector,
    configService: ConfigService,
    @Inject(INJECTION_TOKEN.AUDIT_SERVICE)
    protected auditService: AuditService,

    // Using redis makes it easier to manage concurrency across multiple instances
    @Inject(INJECTION_TOKEN.REDIS_SERVICE)
    protected cacheEngine: RedisService,
  ) {
    super(configService, reflector);
  }

  public async intercept(
    ctx: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const { appName, logId, routeIdentifier, userId } =
      this.getUserAndAPICallInfo(ctx);

    const userSpamCountCacheKey = `${appName}:user-spam-api-ban:${userId}`;
    const userSpamCount = await this.cacheEngine.getNumber(
      userSpamCountCacheKey,
    );
    if (userSpamCount >= USER_SPAM_LIMIT_BEFORE_BAN) {
      this.logger.warn(
        `user ${userId} is banned for excessive API calls. Path: ${routeIdentifier}`,
      );

      return throwError(() => new ForbiddenException('User is banned!'));
    }

    const cacheKey = createHash('sha1').update(routeIdentifier).digest('hex');

    const maxConcurrencyCall =
      this.reflector.get(METADATA_KEY.MAX_CONCURRENCY_CALL, ctx.getHandler()) ||
      DEFAULT_MAX_CONCURRENT_CALL;

    // Incrby and ensure TTL is Set. If it's already set, but below threshold, renew it
    const [newValue] = await this.cacheEngine.multiEval([
      [
        scripts.luaScripts.IncrByAndEnsureTTLIsSet,
        1,
        cacheKey,
        1,
        CALL_QUEUE_EXPIRATION_SECS,
      ],
      [
        scripts.luaScripts.RefreshTTLIfBelowThreshold,
        1,
        cacheKey,
        CALL_QUEUE_SAFE_THRESHOLD,
        CALL_QUEUE_EXPIRATION_SECS,
      ],
    ]);

    if (newValue > maxConcurrencyCall) {
      this.logger.warn(
        `user ${userId} exceeded concurrency limit for path ${routeIdentifier}`,
      );

      await this.cacheEngine.decrBy(cacheKey, 1);
      const newBanValue = (await this.cacheEngine.eval(
        scripts.luaScripts.IncrByAndEnsureTTLIsSet,
        1,
        userSpamCountCacheKey,
        1,
        SPAM_BAN_EXPIRAION_SECS,
      )) as number;

      if (newBanValue >= USER_SPAM_LIMIT_BEFORE_BAN) {
        this.logger.warn(
          `user ${userId} is banned for 5 minutes due to excessive API calls`,
        );
      }

      return throwError(
        () => new ForbiddenException('Max concurrency call reached!'),
      );
    }

    return next.handle().pipe(
      timeout(60 * 3 * 1000),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          this.logger.error(
            `Timeout error for user ${userId}. Path: ${cacheKey}`,
          );
          this.auditService.emitLog(
            new ErrorLog({
              logId,
              userId: userId,
              message: `Timeout error for user ${userId}`,
              action: APP_ACTION.API_CALL,
              metadata: {
                routeIdentifier,
              },
            }),
          );
        }
        // Perform any additional error handling if necessary
        return throwError(() => err);
      }),
      finalize(() => this.cacheEngine.decrBy(cacheKey, 1)),
    );
  }
}

export function UseCallQueue(maxConcurrency = 1) {
  return applyDecorators(
    MaxConcurrencyCall(maxConcurrency),
    UseInterceptors(CallQueueInterceptor),
  );
}
