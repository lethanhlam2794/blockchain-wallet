import { Injectable, Inject, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

import { ENV_KEY, HEADER_KEY, INJECTION_TOKEN } from '@shared/constants';
import {
  generateApiSignature,
  generateEthereumSignature,
  generateEthereumApiSignature,
} from '@shared/utils/signature';
import { HttpRequestOption } from 'mvc-common-toolkit';

@Injectable()
export class SignatureService {
  constructor(
    private configService: ConfigService,
    @Optional()
    @Inject(INJECTION_TOKEN.ETH_WALLET)
    private wallet?: ethers.Wallet | null,
  ) {}

  /**
   * Lấy API secret key từ environment variable
   */
  get apiSecretKey(): string {
    return this.configService.get<string>(ENV_KEY.API_SECRET_KEY) || '';
  }

  /**
   * Lấy API key từ environment variable
   */
  get apiKey(): string {
    return this.configService.get<string>(ENV_KEY.API_KEY) || '';
  }

  /**
   * Kiểm tra xem có secret key để tạo signature không
   */
  hasSecretKey(): boolean {
    return !!this.apiSecretKey;
  }

  /**
   * Thêm signature vào request options
   * @param method - HTTP method
   * @param path - API path
   * @param requestOptions - Request options cần thêm signature
   * @returns Request options đã có signature
   */
  addSignatureToRequest(
    method: string,
    path: string,
    requestOptions: HttpRequestOption,
  ): HttpRequestOption {
    if (!this.hasSecretKey()) {
      return requestOptions;
    }

    const timestamp = Date.now();
    const signature = generateApiSignature(
      method,
      path,
      requestOptions.body as Record<string, any>,
      requestOptions.query as Record<string, any>,
      timestamp,
      this.apiSecretKey,
    );

    // Đảm bảo headers object tồn tại
    if (!requestOptions.headers) {
      requestOptions.headers = {};
    }

    // Thêm signature và timestamp vào headers
    requestOptions.headers[HEADER_KEY.X_DATA_SIGNATURE] = signature;
    requestOptions.headers['X-Timestamp'] = timestamp.toString();

    // Thêm API key nếu có
    if (this.apiKey) {
      requestOptions.headers['X-API-Key'] = this.apiKey;
    }

    return requestOptions;
  }

  /**
   * Tạo signature cho một request cụ thể
   * @param method - HTTP method
   * @param path - API path
   * @param body - Request body
   * @param query - Query parameters
   * @param timestamp - Timestamp (optional, mặc định là hiện tại)
   * @returns Object chứa signature, timestamp và headers
   */
  async createSignature(
    method: string,
    path: string,
    body?: Record<string, any>,
    query?: Record<string, any>,
    timestamp?: number,
  ): Promise<{
    signature: string;
    timestamp: number;
    headers: Record<string, string>;
  }> {
    if (!this.hasSecretKey()) {
      throw new Error('API_SECRET_KEY is not configured');
    }

    const ts = timestamp || Date.now();
    const signature = generateApiSignature(
      method,
      path,
      body,
      query,
      ts,
      this.apiSecretKey,
    );

    const headers: Record<string, string> = {
      [HEADER_KEY.X_DATA_SIGNATURE]: signature,
      'X-Timestamp': ts.toString(),
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    return {
      signature,
      timestamp: ts,
      headers,
    };
  }

  /**
   * Tạo Ethereum signature và thêm vào request body
   * @param method - HTTP method
   * @param path - API path
   * @param body - Request body (sẽ được thêm walletAddress và signature)
   * @param query - Query parameters
   * @param timestamp - Timestamp (optional)
   * @param privateKey - Private key hoặc Wallet object (optional, nếu không có sẽ dùng wallet từ injection)
   * @returns Object chứa body với walletAddress và signature, cùng timestamp
   */
  async addEthereumSignatureToBody(
    method: string,
    path: string,
    body: Record<string, any> = {},
    query?: Record<string, any>,
    timestamp?: number,
    privateKey?: string | ethers.Wallet,
  ): Promise<{
    body: Record<string, any>;
    timestamp: number;
  }> {
    const walletToUse = privateKey || this.wallet;

    if (!walletToUse) {
      throw new Error(
        'Wallet or private key is required. Provide privateKey parameter or inject ETH_WALLET token.',
      );
    }

    const ts = timestamp || Date.now();
    const { walletAddress, signature } = await generateEthereumApiSignature(
      method,
      path,
      body,
      query,
      ts,
      walletToUse,
    );

    // Thêm walletAddress và signature vào body
    const signedBody = {
      ...body,
      walletAddress,
      signature,
    };

    return {
      body: signedBody,
      timestamp: ts,
    };
  }

  /**
   * Tạo Ethereum signature và thêm vào request headers
   * @param method - HTTP method
   * @param path - API path
   * @param requestOptions - Request options
   * @param privateKey - Private key hoặc Wallet object (optional)
   * @returns Request options đã có signature trong headers
   */
  async addEthereumSignatureToHeaders(
    method: string,
    path: string,
    requestOptions: HttpRequestOption,
    privateKey?: string | ethers.Wallet,
  ): Promise<HttpRequestOption> {
    const walletToUse = privateKey || this.wallet;

    if (!walletToUse) {
      throw new Error(
        'Wallet or private key is required. Provide privateKey parameter or inject ETH_WALLET token.',
      );
    }

    const timestamp = Date.now();
    const { walletAddress, signature } = await generateEthereumApiSignature(
      method,
      path,
      requestOptions.body as Record<string, any>,
      requestOptions.query as Record<string, any>,
      timestamp,
      walletToUse,
    );

    // Đảm bảo headers object tồn tại
    if (!requestOptions.headers) {
      requestOptions.headers = {};
    }

    // Thêm signature và walletAddress vào headers
    requestOptions.headers[HEADER_KEY.X_DATA_SIGNATURE] = signature;
    requestOptions.headers['X-Wallet-Address'] = walletAddress;
    requestOptions.headers['X-Timestamp'] = timestamp.toString();

    return requestOptions;
  }

  /**
   * Tạo Ethereum signature đơn giản từ message
   * @param message - Message cần sign
   * @param privateKey - Private key hoặc Wallet object (optional)
   * @returns Object chứa walletAddress và signature
   */
  async createEthereumSignature(
    message: string,
    privateKey?: string | ethers.Wallet,
  ): Promise<{ walletAddress: string; signature: string }> {
    const walletToUse = privateKey || this.wallet;

    if (!walletToUse) {
      throw new Error(
        'Wallet or private key is required. Provide privateKey parameter or inject ETH_WALLET token.',
      );
    }

    return generateEthereumSignature(message, walletToUse);
  }
}
