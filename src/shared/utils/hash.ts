import * as crypto from 'crypto';
import { stringUtils } from 'mvc-common-toolkit';

export function generateReferralCode(): string {
  const random = crypto.randomBytes(5).toString('hex');

  return random.toUpperCase();
}

export function generateOtpToken(): string {
  return stringUtils.generatePassword(32).replace(/[^a-zA-Z ]/g, '');
}

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateAntiPhishingCode(): string {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const code: string[] = [];

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code.push(chars[randomIndex]);
  }

  return code.join('');
}
