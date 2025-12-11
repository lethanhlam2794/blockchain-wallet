export const newEmailRegex =
  /^[a-zA-Z0-9]+(.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+.[a-zA-Z]{2,}$/;

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function isEmail(data: string): boolean {
  return newEmailRegex.test(data);
}
