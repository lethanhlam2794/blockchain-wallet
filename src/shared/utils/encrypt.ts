export function cleanJsonEscapedString(value: string): string {
  if (!value || typeof value !== 'string') {
    return value;
  }

  if (value.includes('\\"')) {
    try {
      return JSON.parse(`"${value}"`);
    } catch {
      return value.replace(/\\"/g, '"');
    }
  }

  return value;
}
