import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { stringUtils } from 'mvc-common-toolkit';

import { HEADER_KEY } from '@shared/constants';

/**
 * Interceptor để tự động tạo refCode cho mọi request
 * refCode sẽ được lưu vào request object và có thể truy cập qua request.refCode
 */
@Injectable()
export class RefCodeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request & { refCode?: string } = context
      .switchToHttp()
      .getRequest();

    // Tạo refCode nếu chưa có (có thể được set từ header hoặc tạo mới)
    if (!request.refCode) {
      const refCodeFromHeader = request.headers[HEADER_KEY.REF_CODE] as string;
      request.refCode = refCodeFromHeader || stringUtils.generateRandomId();
    }

    // Thêm refCode vào request object để các service có thể truy cập
    (request as any).refCode = request.refCode;

    return next.handle();
  }
}
