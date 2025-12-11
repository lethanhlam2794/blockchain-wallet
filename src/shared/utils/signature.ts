import * as crypto from 'crypto';
import { ethers } from 'ethers';

/**
 * Tạo signature cho API request sử dụng HMAC-SHA256
 * @param method - HTTP method (GET, POST, etc.)
 * @param path - API path
 * @param body - Request body (nếu có)
 * @param query - Query parameters (nếu có)
 * @param timestamp - Timestamp của request
 * @param secretKey - Secret key để tạo signature
 * @returns Signature string
 */
export function generateApiSignature(
  method: string,
  path: string,
  body?: Record<string, any>,
  query?: Record<string, any>,
  timestamp?: number,
  secretKey: string = '',
): string {
  if (!secretKey) {
    throw new Error('Secret key is required to generate signature');
  }

  const ts = timestamp || Date.now();

  // Tạo string để sign: method + path + sorted body + sorted query + timestamp
  const parts: string[] = [method.toUpperCase(), path];

  // Thêm body nếu có (sắp xếp keys để đảm bảo tính nhất quán)
  if (body && Object.keys(body).length > 0) {
    const sortedBody = JSON.stringify(body, Object.keys(body).sort());
    parts.push(sortedBody);
  }

  // Thêm query nếu có (sắp xếp keys)
  if (query && Object.keys(query).length > 0) {
    const sortedQuery = Object.keys(query)
      .sort()
      .map((key) => `${key}=${query[key]}`)
      .join('&');
    parts.push(sortedQuery);
  }

  // Thêm timestamp
  parts.push(ts.toString());

  // Tạo string để sign
  const stringToSign = parts.join('|');

  // Tạo HMAC-SHA256 signature
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(stringToSign)
    .digest('hex');

  return signature;
}

/**
 * Tạo signature đơn giản hơn chỉ từ body và timestamp
 * @param body - Request body
 * @param timestamp - Timestamp của request
 * @param secretKey - Secret key để tạo signature
 * @returns Signature string
 */
export function generateSimpleSignature(
  body: Record<string, any>,
  timestamp: number,
  secretKey: string,
): string {
  if (!secretKey) {
    throw new Error('Secret key is required to generate signature');
  }

  const stringToSign = `${JSON.stringify(body)}|${timestamp}`;

  return crypto
    .createHmac('sha256', secretKey)
    .update(stringToSign)
    .digest('hex');
}

/**
 * Tạo Ethereum signature bằng cách sign message với private key
 * @param message - Message cần sign (thường là JSON string của body hoặc string to sign)
 * @param privateKey - Private key của wallet (có thể là Wallet object hoặc private key string)
 * @returns Object chứa walletAddress và signature
 */
export async function generateEthereumSignature(
  message: string,
  privateKey: string | ethers.Wallet,
): Promise<{ walletAddress: string; signature: string }> {
  let wallet: ethers.Wallet;

  if (typeof privateKey === 'string') {
    wallet = new ethers.Wallet(privateKey);
  } else {
    wallet = privateKey;
  }

  // Sign message với Ethereum format (thêm prefix "\x19Ethereum Signed Message:\n{length}{message}")
  const signature = await wallet.signMessage(message);
  const walletAddress = wallet.address;

  return {
    walletAddress,
    signature,
  };
}

/**
 * Tạo Ethereum signature cho API request
 * Tạo message từ method, path, body, query, timestamp và sign với wallet
 * @param method - HTTP method
 * @param path - API path
 * @param body - Request body
 * @param query - Query parameters
 * @param timestamp - Timestamp
 * @param privateKey - Private key hoặc Wallet object
 * @returns Object chứa walletAddress và signature
 */
export async function generateEthereumApiSignature(
  method: string,
  path: string,
  body?: Record<string, any>,
  query?: Record<string, any>,
  timestamp?: number,
  privateKey?: string | ethers.Wallet,
): Promise<{ walletAddress: string; signature: string }> {
  if (!privateKey) {
    throw new Error(
      'Private key or Wallet is required to generate Ethereum signature',
    );
  }

  const ts = timestamp || Date.now();

  // Tạo string để sign: method + path + sorted body + sorted query + timestamp
  const parts: string[] = [method.toUpperCase(), path];

  // Thêm body nếu có (sắp xếp keys để đảm bảo tính nhất quán)
  if (body && Object.keys(body).length > 0) {
    const sortedBody = JSON.stringify(body, Object.keys(body).sort());
    parts.push(sortedBody);
  }

  // Thêm query nếu có (sắp xếp keys)
  if (query && Object.keys(query).length > 0) {
    const sortedQuery = Object.keys(query)
      .sort()
      .map((key) => `${key}=${query[key]}`)
      .join('&');
    parts.push(sortedQuery);
  }

  // Thêm timestamp
  parts.push(ts.toString());

  // Tạo string để sign
  const message = parts.join('|');

  return generateEthereumSignature(message, privateKey);
}
