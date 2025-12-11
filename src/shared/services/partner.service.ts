import {
  AuditService,
  ErrorLog,
  HttpMethod,
  HttpRequestOption,
  HttpResponse,
  HttpService,
  OperationResult,
  stringUtils,
} from 'mvc-common-toolkit';

import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { APP_ACTION, ENV_KEY, ERR_CODE, HEADER_KEY } from '@shared/constants';
import { maskRules } from '@shared/helpers/common';
import { generateApiSignature } from '@shared/utils/signature';

const httpMethodsWithBody = ['put', 'post', 'patch'];

interface SendToPartnerOptions {
  emitAudit: boolean | ((response: HttpResponse | OperationResult) => boolean);
  appAction: string;
}

@Injectable()
export abstract class PartnerService {
  constructor(
    protected httpService: HttpService,
    protected auditService: AuditService,
    protected configService?: ConfigService,
  ) {}

  protected abstract get partnerServerUrl(): string;
  protected abstract partnerRequestOption(): HttpRequestOption;

  /**
   * Lấy API secret key từ environment variable
   * Override method này nếu cần sử dụng secret key khác
   */
  protected get apiSecretKey(): string {
    return this.configService?.get<string>(ENV_KEY.API_SECRET_KEY) || '';
  }

  /**
   * Lấy API key từ environment variable (nếu cần)
   * Override method này nếu cần sử dụng API key khác
   */
  protected get apiKey(): string {
    return this.configService?.get<string>(ENV_KEY.API_KEY) || '';
  }

  /**
   * Kiểm tra xem có cần thêm signature không
   * Override method này để tắt signature cho một số requests đặc biệt
   */
  protected shouldAddSignature(): boolean {
    return !!this.apiSecretKey;
  }

  public async sendToPartner(
    method: HttpMethod,
    path: string,
    payload?: Record<string, any>,
    options: Partial<SendToPartnerOptions> = {
      emitAudit: true,
      appAction: APP_ACTION.SEND_HTTP_REQUEST,
    },
  ): Promise<HttpResponse> {
    const url = this.partnerServerUrl + path;
    const requestOptions = this.partnerRequestOption();

    if (httpMethodsWithBody.some((m) => m === method)) {
      requestOptions.body = payload;
    } else if (method === 'get') {
      requestOptions.query = payload;
    }

    // Thêm signature vào headers nếu cần
    if (this.shouldAddSignature()) {
      const timestamp = Date.now();
      const signature = generateApiSignature(
        method,
        path,
        requestOptions.body as Record<string, any>,
        requestOptions.query as Record<string, any>,
        timestamp,
        this.apiSecretKey,
      );

      // Đảm bảo headers object tồn tại
      if (!requestOptions.headers) {
        requestOptions.headers = {};
      }

      // Thêm signature và timestamp vào headers
      requestOptions.headers[HEADER_KEY.X_DATA_SIGNATURE] = signature;
      requestOptions.headers['X-Timestamp'] = timestamp.toString();

      // Thêm API key nếu có
      if (this.apiKey) {
        requestOptions.headers['X-API-Key'] = this.apiKey;
      }
    }

    const response = await this.httpService.send(method, url, requestOptions);

    if (
      !response.success &&
      (response.httpCode === HttpStatus.UNAUTHORIZED ||
        response.message.includes('401'))
    ) {
      return {
        success: false,
        message: response.message,
        code: ERR_CODE.UNAUTHORIZED,
        httpCode: HttpStatus.UNAUTHORIZED,
      };
    }

    if (!response.data?.success) {
      if (
        (typeof options.emitAudit === 'boolean' && options.emitAudit) ||
        (typeof options.emitAudit === 'function' &&
          options.emitAudit?.(response))
      ) {
        this.auditService.emitLog(
          new ErrorLog({
            logId: stringUtils.generateRandomId(),
            message: response.data?.message,
            action: options?.appAction,
            payload,
            metadata: {
              response,
              url,
              method,
              requestOptions: JSON.stringify(
                requestOptions.body || requestOptions.query,
                (key, value) => stringUtils.maskFn(key, value, maskRules),
              ),
            },
          }),
        );
      }

      return {
        success: false,
        message: response.data?.message,
        code: response.data?.code,
        httpCode: response.data?.httpCode,
      };
    }

    return {
      success: true,
      data: response.data?.data,
    };
  }
}
