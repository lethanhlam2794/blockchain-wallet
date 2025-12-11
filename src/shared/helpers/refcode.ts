import { stringUtils } from 'mvc-common-toolkit';

/**
 * Merge refCode vào metadata
 * @param metadata - Metadata hiện tại (có thể là undefined)
 * @param refCode - Reference code
 * @returns Metadata mới với refCode
 */
export function mergeRefCodeToMetadata(
  metadata?: Record<string, any>,
  refCode?: string,
): Record<string, any> {
  const finalRefCode = refCode || stringUtils.generateRandomId();
  return {
    ...metadata,
    refCode: finalRefCode,
  };
}
