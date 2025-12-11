import { merge } from 'lodash';

/**
 * Generic utility function to build update data object
 * Automatically checks if fields are not undefined and assigns them to the update object
 *
 * @param source - Source object containing the update data
 * @param fieldMappings - Object mapping source fields to target fields with optional transformers
 * @returns Partial update object with only defined fields
 *
 * @example
 * const updateData = buildUpdateData(data, {
 *   name: 'name',
 *   status: 'status',
 *   openTime: { field: 'openTime', transform: (value) => new Date(value * 1000) }
 * });
 */
export function buildUpdateData<TSource, TTarget>(
  source: TSource,
  fieldMappings: {
    [K in keyof TSource]?:
      | keyof TTarget
      | {
          field: keyof TTarget;
          transform?: (value: TSource[K]) => any;
        };
  },
): Partial<TTarget> {
  const updateData: Partial<TTarget> = {};

  for (const [sourceKey, mapping] of Object.entries(fieldMappings)) {
    const sourceValue = source[sourceKey as keyof TSource];

    if (sourceValue !== undefined) {
      if (typeof mapping === 'string') {
        // Simple field mapping
        updateData[mapping as keyof TTarget] = sourceValue as any;
      } else if (mapping && typeof mapping === 'object' && 'field' in mapping) {
        // Complex mapping with transformation
        const { field, transform } = mapping as {
          field: keyof TTarget;
          transform?: (value: any) => any;
        };
        updateData[field as keyof TTarget] = transform
          ? transform(sourceValue)
          : (sourceValue as any);
      }
    }
  }

  return updateData;
}

/**
 * Simplified version for direct field mapping without transformation
 *
 * @param source - Source object containing the update data
 * @param fields - Array of field names to copy from source to target
 * @returns Partial update object with only defined fields
 *
 * @example
 * const updateData = buildSimpleUpdateData(data, ['name', 'description', 'amount']);
 */
export function buildSimpleUpdateData<T>(
  source: Partial<T>,
  fields: (keyof T)[],
): Partial<T> {
  const updateData: Partial<T> = {};

  for (const field of fields) {
    if (source[field] !== undefined) {
      updateData[field] = source[field];
    }
  }

  return updateData;
}

/**
 * Merge two JSONB-like objects.
 * - Deep merges "incoming" into "original"
 * - Returns a new object without mutating inputs
 *
 * Commonly used for JSONB fields in update operations,
 * where partial updates should merge instead of overwrite.
 *
 * @example
 * mergeJsonb({ a: 1, b: { x: 10 } }, { b: { x: 20, y: 30 } })
 * // → { a: 1, b: { x: 20, y: 30 } }
 */
export function mergeJsonb<T extends Record<string, any>>(
  original?: T,
  incoming?: Partial<T>,
): T {
  return merge({}, original || {}, incoming || {}) as T;
}

/**
 * Builds an update payload for an entity.
 * - JSONB fields (listed in `fields`) are deep-merged instead of overwritten.
 * - Normal fields are assigned directly.
 *
 * Note: Multilingual fields must be preprocessed first
 * (converted into full objects like { en: "...", vi: "..." }).
 *
 * @example
 * const found = { metadata: { views: 10 } };
 * const incoming = { metadata: { views: 11 } };
 *
 * buildUpdatePayload(found, incoming, ['metadata']);
 * // → { metadata: { views: 11 } }
 */
export function buildUpdatePayload<
  T extends Record<string, any>,
  D extends Record<string, any>,
>(found: T, incoming: D, fields: string[]): Partial<T> {
  const payload: Partial<T> = {};

  for (const key of Object.keys(incoming) as (keyof D)[]) {
    const keyD = key;
    const keyT = key as keyof T;

    const val = incoming[keyD];
    if (val === undefined) continue;

    if (fields.includes(key as string)) {
      payload[keyT] = mergeJsonb(found[keyT], val);
    } else {
      payload[keyT] = val as any;
    }
  }

  return payload;
}
