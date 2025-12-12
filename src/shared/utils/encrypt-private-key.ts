import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { ENV_KEY } from '@shared/constants';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Mã hóa private key trước khi lưu vào database
 */
export function encryptPrivateKey(
  privateKey: string,
  secretKey: string,
): string {
  try {
    // Tạo salt ngẫu nhiên
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Tạo IV ngẫu nhiên
    const iv = crypto.randomBytes(IV_LENGTH);

    // Derive key từ secret key và salt
    const key = crypto.pbkdf2Sync(
      secretKey,
      salt,
      ITERATIONS,
      KEY_LENGTH,
      'sha512',
    );

    // Tạo cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Mã hóa private key
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Lấy authentication tag
    const tag = cipher.getAuthTag();

    // Kết hợp salt + iv + tag + encrypted data
    const combined = Buffer.concat([
      salt,
      iv,
      tag,
      Buffer.from(encrypted, 'hex'),
    ]);

    // Trả về dạng base64 để dễ lưu trữ
    return combined.toString('base64');
  } catch (error) {
    throw new Error(`Lỗi khi mã hóa private key: ${error.message}`);
  }
}

/**
 * Giải mã private key từ database
 */
export function decryptPrivateKey(
  encryptedPrivateKey: string,
  secretKey: string,
): string {
  try {
    // Chuyển từ base64 về buffer
    const combined = Buffer.from(encryptedPrivateKey, 'base64');

    // Extract các phần
    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = combined.subarray(
      SALT_LENGTH + IV_LENGTH,
      SALT_LENGTH + IV_LENGTH + TAG_LENGTH,
    );
    const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    // Derive key từ secret key và salt
    const key = crypto.pbkdf2Sync(
      secretKey,
      salt,
      ITERATIONS,
      KEY_LENGTH,
      'sha512',
    );

    // Tạo decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    // Giải mã
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error(`Lỗi khi giải mã private key: ${error.message}`);
  }
}

/**
 * Lấy secret key từ config service
 * Ưu tiên WALLET_ENCRYPTION_KEY, nếu không có thì dùng JWT_SECRET (backward compatibility)
 */
export function getEncryptionKey(configService: ConfigService): string {
  // Ưu tiên dùng WALLET_ENCRYPTION_KEY riêng cho wallet encryption
  const walletKey = configService.get<string>(ENV_KEY.WALLET_ENCRYPTION_KEY);
  if (walletKey) {
    return walletKey;
  }

  // Fallback về JWT_SECRET nếu chưa có WALLET_ENCRYPTION_KEY (backward compatibility)
  const jwtSecret = configService.get<string>(ENV_KEY.JWT_SECRET);
  if (!jwtSecret) {
    throw new Error('WALLET_ENCRYPTION_KEY hoặc JWT_SECRET phải được cấu hình');
  }

  return jwtSecret;
}
