import {
  ExecutionContext,
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

import { HEADER_KEY, LANGUAGE } from '@shared/constants';

export const RequestLanguage = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): LANGUAGE => {
    const request = ctx.switchToHttp().getRequest();
    const langHeader =
      request.headers[HEADER_KEY.X_REQUEST_LANGUAGE.toLowerCase()];

    if (!langHeader) {
      return LANGUAGE.EN;
    }

    const normalized = String(langHeader).toLowerCase();

    return Object.values(LANGUAGE).includes(normalized as LANGUAGE)
      ? (normalized as LANGUAGE)
      : LANGUAGE.EN;
  },
);

export function UseRequestLanguage() {
  return applyDecorators(
    ApiHeader({
      name: HEADER_KEY.X_REQUEST_LANGUAGE,
      required: false,
      description: 'Request language (en, vi, fr)',
      schema: {
        type: 'string',
        enum: Object.values(LANGUAGE),
        default: LANGUAGE.EN,
      },
    }),
  );
}
