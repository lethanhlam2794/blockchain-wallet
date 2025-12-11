import * as crypto from 'crypto';

export function generateOtpHash(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export function verifyOtp(enteredOtp: string, storedOtp: string): boolean {
  const hashedOtp = generateOtpHash(enteredOtp);
  return hashedOtp === storedOtp;
}
