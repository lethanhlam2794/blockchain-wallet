import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Wallet as EthersWallet, ethers } from 'ethers';
import { stringUtils } from 'mvc-common-toolkit';

import { ENTITY_STATUS } from '@shared/constants';
import { BaseCRUDService } from '@shared/services/base-crud.service';
import { TokenService } from '../token/token.service';
import { BlockchainConfigService } from '../blockchain-config/blockchain-config.service';
import {
  encryptPrivateKey,
  decryptPrivateKey,
  getEncryptionKey,
} from '@shared/utils/encrypt-private-key';

import { Wallet } from './wallet.model';
import { CreateWalletDto, ImportWalletDto } from './wallet.dto';

@Injectable()
export class WalletService extends BaseCRUDService<Wallet> {
  protected logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(Wallet)
    walletRepository: Repository<Wallet>,
    private readonly tokenService: TokenService,
    private readonly blockchainConfigService: BlockchainConfigService,
    private readonly configService: ConfigService,
  ) {
    super(walletRepository);
  }

  /**
   * Tạo ví EVM mới
   */
  async createWallet(
    dto: CreateWalletDto,
    userId: string,
    refCode?: string,
  ): Promise<Wallet> {
    // Tạo ví mới bằng ethers
    const ethersWallet = EthersWallet.createRandom();

    // Đảm bảo address là lowercase
    const address = ethersWallet.address.toLowerCase();

    // Kiểm tra xem address đã tồn tại chưa (rất hiếm nhưng nên kiểm tra)
    const existingWallet = await this.findByAddress(address, userId);
    if (existingWallet) {
      this.logger.warn(`Address đã tồn tại: ${address}, tạo lại ví mới...`);
      // Nếu đã tồn tại, tạo lại ví mới (rất hiếm xảy ra)
      return this.createWallet(dto, userId, refCode);
    }

    // Tạo refCode nếu chưa có
    const finalRefCode = refCode || stringUtils.generateRandomId();

    // Merge refCode vào metadata
    const metadata = {
      ...dto.metadata,
      refCode: finalRefCode,
    };

    // Mã hóa private key trước khi lưu
    const encryptionKey = getEncryptionKey(this.configService);
    const encryptedPrivateKey = encryptPrivateKey(
      ethersWallet.privateKey,
      encryptionKey,
    );

    // Lưu vào database
    const wallet = await this.model.save({
      userId,
      address: address,
      privateKey: encryptedPrivateKey,
      status: ENTITY_STATUS.ACTIVE,
      label: dto.label,
      description: dto.description,
      metadata,
    });

    this.logger.log(
      `Đã tạo ví mới: ${wallet.address}, refCode: ${finalRefCode}`,
    );

    // Trả về wallet với private key đã giải mã để user có thể lưu lại
    const decryptedPrivateKey = decryptPrivateKey(
      wallet.privateKey,
      encryptionKey,
    );
    return {
      ...wallet,
      privateKey: decryptedPrivateKey,
    };
  }

  /**
   * Import ví từ private key
   */
  async importWallet(
    dto: ImportWalletDto,
    userId: string,
    refCode?: string,
  ): Promise<Wallet> {
    try {
      // Tạo wallet từ private key
      const ethersWallet = new EthersWallet(dto.privateKey);

      // Đảm bảo address là lowercase
      const address = ethersWallet.address.toLowerCase();

      // Kiểm tra xem ví đã tồn tại chưa
      const existingWallet = await this.findByAddress(address, userId);
      if (existingWallet) {
        this.logger.warn(`Ví với address ${address} đã tồn tại`);
        // Cập nhật thông tin nếu có thay đổi
        if (dto.label || dto.description || dto.metadata || refCode) {
          const finalRefCode = refCode || stringUtils.generateRandomId();
          existingWallet.label = dto.label || existingWallet.label;
          existingWallet.description =
            dto.description || existingWallet.description;
          existingWallet.metadata = {
            ...existingWallet.metadata,
            ...dto.metadata,
            refCode: finalRefCode,
          };
          return this.model.save(existingWallet);
        }
        return existingWallet;
      }

      // Tạo refCode nếu chưa có
      const finalRefCode = refCode || stringUtils.generateRandomId();

      // Merge refCode vào metadata
      const metadata = {
        ...dto.metadata,
        refCode: finalRefCode,
      };

      // Mã hóa private key trước khi lưu
      const encryptionKey = getEncryptionKey(this.configService);
      const encryptedPrivateKey = encryptPrivateKey(
        ethersWallet.privateKey,
        encryptionKey,
      );

      // Lưu vào database
      const wallet = await this.model.save({
        userId,
        address: address,
        privateKey: encryptedPrivateKey,
        status: ENTITY_STATUS.ACTIVE,
        label: dto.label,
        description: dto.description,
        metadata,
      });

      this.logger.log(`Đã import ví: ${wallet.address}`);

      // Trả về wallet với private key đã giải mã để confirm
      const decryptedPrivateKey = decryptPrivateKey(
        wallet.privateKey,
        encryptionKey,
      );
      return {
        ...wallet,
        privateKey: decryptedPrivateKey,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi import ví: ${error.message}`, error.stack);
      throw new BadRequestException(
        `Private key không hợp lệ: ${error.message}`,
      );
    }
  }

  /**
   * Lấy ví theo address (không giải mã private key)
   */
  async findByAddress(
    address: string,
    userId?: string,
  ): Promise<Wallet | null> {
    const where: any = { address: address.toLowerCase() };

    if (userId) {
      where.userId = userId;
    }

    return this.model.findOne({ where });
  }

  /**
   * Lấy ví theo address và giải mã private key
   */
  async findByAddressWithDecryptedKey(
    address: string,
    userId?: string,
  ): Promise<Wallet | null> {
    const wallet = await this.findByAddress(address, userId);
    if (!wallet) {
      return null;
    }

    // Giải mã private key
    const encryptionKey = getEncryptionKey(this.configService);
    try {
      const decryptedPrivateKey = decryptPrivateKey(
        wallet.privateKey,
        encryptionKey,
      );
      return {
        ...wallet,
        privateKey: decryptedPrivateKey,
      };
    } catch (error) {
      this.logger.error(
        `Lỗi khi giải mã private key cho wallet ${address}: ${error.message}`,
      );
      // Nếu lỗi giải mã, có thể là dữ liệu cũ chưa được mã hóa
      // Trả về wallet với private key gốc (để backward compatibility)
      return wallet;
    }
  }

  /**
   * Kiểm tra ví đã tồn tại chưa
   */
  async isAddressExists(address: string, userId?: string): Promise<boolean> {
    const wallet = await this.findByAddress(address, userId);
    return !!wallet;
  }

  /**
   * Lấy tất cả ví active
   */
  async findAllActive(userId?: string): Promise<Wallet[]> {
    const where: any = { status: ENTITY_STATUS.ACTIVE };

    if (userId) {
      where.userId = userId;
    }

    return this.model.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy số dư của ví (native token + ERC20 tokens)
   */
  async getWalletBalances(
    address: string,
    chainId: number,
    userId?: string,
  ): Promise<{
    address: string;
    chainId: number;
    nativeCurrency: string;
    balances: Array<{
      symbol: string;
      name?: string;
      balance: string;
      type: 'native' | 'erc20';
    }>;
  }> {
    try {
      if (userId) {
        const wallet = await this.findByAddress(address, userId);

        if (!wallet) {
          throw new BadRequestException('Ví không thuộc quyền sở hữu');
        }
      }

      // Validate address
      if (!ethers.isAddress(address)) {
        throw new BadRequestException('Địa chỉ không hợp lệ');
      }

      // Lấy blockchain config theo chainId
      const blockchainConfig =
        await this.blockchainConfigService.findByChainId(chainId);

      // Tạo provider từ RPC URL
      const provider = new ethers.JsonRpcProvider(blockchainConfig.rpcUrl);

      // Lấy số dư native token
      const nativeBalance = await provider.getBalance(address);
      const nativeBalanceFormatted = ethers.formatEther(nativeBalance);

      const balances: Array<{
        symbol: string;
        name?: string;
        balance: string;
        type: 'native' | 'erc20';
      }> = [
        {
          symbol:
            blockchainConfig.currencySymbol ||
            blockchainConfig.nativeCurrency ||
            'ETH',
          name: blockchainConfig.nativeCurrency,
          balance: nativeBalanceFormatted,
          type: 'native',
        },
      ];

      // Lấy danh sách tokens đã import theo chainId
      const tokens = await this.tokenService.findAllByChainId(chainId);

      // Lấy số dư của từng ERC20 token
      const erc20Abi = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)',
      ];

      for (const token of tokens) {
        try {
          const tokenContract = new ethers.Contract(
            token.address,
            erc20Abi,
            provider,
          );

          const balance = await tokenContract.balanceOf(address);
          const decimals = await tokenContract.decimals().catch(() => {
            // Fallback về decimals từ DB nếu contract không có decimals()
            return token.decimals || 18;
          });

          // Format balance với decimals
          const balanceFormatted = ethers.formatUnits(balance, decimals);

          // Chỉ thêm vào danh sách nếu số dư > 0
          if (balance > 0n) {
            balances.push({
              symbol: token.symbol,
              name: token.name,
              balance: balanceFormatted,
              type: 'erc20',
            });
          }
        } catch (error) {
          this.logger.warn(
            `Không thể lấy số dư token ${token.symbol} (${token.address}): ${error.message}`,
          );
          // Bỏ qua token này và tiếp tục với token khác
        }
      }

      return {
        address: address.toLowerCase(),
        chainId,
        nativeCurrency:
          blockchainConfig.currencySymbol ||
          blockchainConfig.nativeCurrency ||
          'ETH',
        balances,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Lỗi khi lấy số dư ví: ${error.message}`, error.stack);
      throw new BadRequestException(`Lỗi khi lấy số dư ví: ${error.message}`);
    }
  }
}
