import { Inject, Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';

import { INJECTION_TOKEN } from '@shared/constants';

@Injectable()
export class EtherService {
  protected logger = new Logger(EtherService.name);

  constructor(
    @Inject(INJECTION_TOKEN.ETH_PROVIDER)
    protected provider: ethers.JsonRpcProvider,
    @Inject(INJECTION_TOKEN.ETH_WALLET)
    protected wallet: ethers.Wallet | null,
  ) {}

  /**
   * Thiết lập wallet từ private key
   */
  setWallet(privateKey: string): void {
    const newWallet = new ethers.Wallet(privateKey, this.provider);
    (this as any).wallet = newWallet;
  }

  /**
   * Lấy provider hiện tại
   */
  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  /**
   * Lấy wallet hiện tại
   */
  getWallet(): ethers.Wallet | null {
    return this.wallet;
  }

  /**
   * Lấy số dư của một địa chỉ
   */
  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw error;
    }
  }

  /**
   * Lấy số dư native token (ETH) của wallet hiện tại
   */
  async getWalletBalance(): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet chưa được thiết lập');
    }
    return this.getBalance(this.wallet.address);
  }

  /**
   * Gửi ETH từ wallet hiện tại
   */
  async sendTransaction(
    to: string,
    amount: string,
  ): Promise<ethers.TransactionResponse> {
    if (!this.wallet) {
      throw new Error('Wallet chưa được thiết lập');
    }

    try {
      const tx = await this.wallet.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      });

      return tx;
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw error;
    }
  }

  /**
   * Chờ transaction được confirm
   */
  async waitForTransaction(
    txHash: string,
    confirmations: number = 1,
  ): Promise<ethers.TransactionReceipt> {
    try {
      return await this.provider.waitForTransaction(txHash, confirmations);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw error;
    }
  }

  /**
   * Lấy thông tin transaction
   */
  async getTransaction(
    txHash: string,
  ): Promise<ethers.TransactionResponse | null> {
    try {
      return await this.provider.getTransaction(txHash);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return null;
    }
  }

  /**
   * Lấy transaction receipt
   */
  async getTransactionReceipt(
    txHash: string,
  ): Promise<ethers.TransactionReceipt | null> {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return null;
    }
  }

  /**
   * Lấy block number hiện tại
   */
  async getBlockNumber(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw error;
    }
  }

  /**
   * Lấy thông tin block
   */
  async getBlock(blockNumber: number): Promise<ethers.Block | null> {
    try {
      return await this.provider.getBlock(blockNumber);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return null;
    }
  }

  /**
   * Chuyển đổi ETH sang Wei
   */
  parseEther(amount: string): bigint {
    return ethers.parseEther(amount);
  }

  /**
   * Chuyển đổi Wei sang ETH
   */
  formatEther(amount: bigint | string): string {
    return ethers.formatEther(amount);
  }

  /**
   * Validate địa chỉ Ethereum
   */
  isAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Lấy địa chỉ từ private key
   */
  getAddressFromPrivateKey(privateKey: string): string {
    const wallet = new ethers.Wallet(privateKey);
    return wallet.address;
  }
}
