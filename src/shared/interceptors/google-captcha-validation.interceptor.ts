import { AuditService, AxiosHttpService } from 'mvc-common-toolkit';
import { Observable, of } from 'rxjs';

import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
  UseInterceptors,
  applyDecorators,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiHeader } from '@nestjs/swagger';

import {
  ENV_KEY,
  ERR_CODE,
  HEADER_KEY,
  INJECTION_TOKEN,
} from '@shared/constants';
import { AppRequest } from '@shared/interfaces';

@Injectable()
export class GoogleReCaptchaValidationInterceptor implements NestInterceptor {
  private logger = new Logger(GoogleReCaptchaValidationInterceptor.name, {
    timestamp: true,
  });

  constructor(
    @Inject(INJECTION_TOKEN.HTTP_SERVICE)
    protected httpService: AxiosHttpService,

    @Inject(INJECTION_TOKEN.AUDIT_SERVICE)
    protected auditService: AuditService,

    protected configService: ConfigService,
  ) {}

  public async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const recaptchaEnabled = this.configService.get(
      ENV_KEY.GOOGLE_RECAPTCHA_ENABLED,
      'true',
    );

    if (recaptchaEnabled === 'false') {
      this.logger.log('Recaptcha is disabled');

      return next.handle();
    }

    const request: AppRequest = context.switchToHttp().getRequest();
    const logId = request.headers[HEADER_KEY.LOG_ID] as string;

    const token = request.header(HEADER_KEY.CAPTCHA_TOKEN) as unknown;
    this.logger.log(`[${logId}] Captcha token: ${token}`);

    if (!token || !(await this.isTokenValid(logId, token as string))) {
      this.logger.log(`[${logId}]: Invalid captcha token`);

      return of({
        success: false,
        code: ERR_CODE.INVALID_CAPTCHA_TOKEN,
        httpCode: HttpStatus.BAD_REQUEST,
      });
    }

    return next.handle();
  }

  private async isTokenValid(logId: string, token: string) {
    this.logger.log(`[${logId}]: Verifying recaptcha token: ${token}`);

    const secret = this.configService.getOrThrow(
      ENV_KEY.GOOGLE_RECAPTCHA_SECRET,
    );

    const endpoint = this.configService.get(
      ENV_KEY.GOOGLE_RECAPTCHA_VERIFY_ENDPOINT,
      'https://www.google.com/recaptcha/api/siteverify',
    );
    const query = new URLSearchParams({ secret, response: token }).toString();

    const response = await this.httpService.send(
      'post',
      `${endpoint}?${query}`,
    );

    const isSuccess = response?.data?.success;

    if (!isSuccess) {
      this.logger.debug(`Recaptcha Error: ${JSON.stringify(response.data)}`);
    }

    return isSuccess === true;
  }
}

export function UseCaptcha() {
  return applyDecorators(
    UseInterceptors(GoogleReCaptchaValidationInterceptor),
    ApiHeader({
      name: HEADER_KEY.CAPTCHA_TOKEN,
      required: true,
    }),
  );
}
