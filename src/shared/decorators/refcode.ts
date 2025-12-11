import { Request } from 'express';
import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { AppRequest } from '@shared/interfaces';

/**
 * Lấy refCode từ request
 * refCode được tạo tự động bởi RefCodeInterceptor
 */
export function getRefCode(request: Request | AppRequest): string {
  return (request as AppRequest).refCode || '';
}

/**
 * Decorator để inject refCode vào controller method
 * @example
 * async createWallet(@Body() dto: CreateWalletDto, @RefCode() refCode: string) {
 *   // refCode sẽ được tự động inject
 * }
 */
export const RefCode = createParamDecorator(
  (_: any, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<AppRequest>();
    return request.refCode || '';
  },
);
