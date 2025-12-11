import { LANGUAGE } from '@shared/constants';

/**
 * Extracts a specific language value from a multilingual JSONB field.
 * - Returns the value for the requested `lang`
 * - Falls back to the provided fallback language if missing
 * - Returns null if no value is available
 *
 * @example
 * extractLang({ en: "Hello", vi: "Xin chào" }, "vi") // → "Xin chào"
 * extractLang({ en: "Hello" }, "fr", "en") // → "Hello"
 */
export function extractLang<T>(
  data: Record<string, T> | null | undefined,
  lang: string,
  fallback = LANGUAGE.EN,
): T | null {
  if (!data) return null;

  return data[lang] ?? data[fallback] ?? null;
}

/**
 * Preprocess multilingual fields before calling buildUpdatePayload.
 * - Updates exactly one language per request
 * - Merges the new language value into the existing JSONB object
 * - Leaves non-multilingual fields untouched
 *
 * This implements the "one language per update" approach:
 * incoming[field] becomes { ...oldValue, [language]: newValue }.
 *
 * @example
 * found.name = { en: "Solar Project" }
 * incoming = { language: "vi", name: "Dự án mặt trời" }
 *
 * preprocessMultilingualFields(found, incoming, ["name"])
 * // → { language: "vi", name: { en: "Solar Project", vi: "Dự án mặt trời" } }
 */
export function preprocessMultilingualFields<
  T extends Record<string, any>,
  D extends { language: string },
>(found: T, incoming: D, fields: string[]): D {
  const result = { ...incoming } as D;

  for (const field of fields) {
    if (incoming[field] !== undefined) {
      const original = found[field] ?? {};

      result[field] = {
        ...original,
        [incoming.language]: incoming[field],
      };
    }
  }

  return result;
}
