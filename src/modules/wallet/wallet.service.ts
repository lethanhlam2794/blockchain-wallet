import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet as EthersWallet, ethers } from 'ethers';
import { stringUtils } from 'mvc-common-toolkit';

import { ENTITY_STATUS } from '@shared/constants';
import { BaseCRUDService } from '@shared/services/base-crud.service';
import { TokenService } from '../token/token.service';
import { BlockchainConfigService } from '../blockchain-config/blockchain-config.service';

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
  ) {
    super(walletRepository);
  }

  /**
   * Tạo ví EVM mới
   */
  async createWallet(dto: CreateWalletDto, refCode?: string): Promise<Wallet> {
    // Tạo ví mới bằng ethers
    const ethersWallet = EthersWallet.createRandom();

    // Đảm bảo address là lowercase
    const address = ethersWallet.address.toLowerCase();

    // Kiểm tra xem address đã tồn tại chưa (rất hiếm nhưng nên kiểm tra)
    const existingWallet = await this.findByAddress(address);
    if (existingWallet) {
      this.logger.warn(`Address đã tồn tại: ${address}, tạo lại ví mới...`);
      // Nếu đã tồn tại, tạo lại ví mới (rất hiếm xảy ra)
      return this.createWallet(dto, refCode);
    }

    // Tạo refCode nếu chưa có
    const finalRefCode = refCode || stringUtils.generateRandomId();

    // Merge refCode vào metadata
    const metadata = {
      ...dto.metadata,
      refCode: finalRefCode,
    };

    // Lưu vào database
    const wallet = await this.model.save({
      address: address,
      privateKey: ethersWallet.privateKey,
      status: ENTITY_STATUS.ACTIVE,
      label: dto.label,
      description: dto.description,
      metadata,
    });

    this.logger.log(
      `Đã tạo ví mới: ${wallet.address}, refCode: ${finalRefCode}`,
    );

    return wallet;
  }

  /**
   * Import ví từ private key
   */
  async importWallet(dto: ImportWalletDto, refCode?: string): Promise<Wallet> {
    try {
      // Tạo wallet từ private key
      const ethersWallet = new EthersWallet(dto.privateKey);

      // Đảm bảo address là lowercase
      const address = ethersWallet.address.toLowerCase();

      // Kiểm tra xem ví đã tồn tại chưa
      const existingWallet = await this.findByAddress(address);
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

      // Lưu vào database
      const wallet = await this.model.save({
        address: address,
        privateKey: ethersWallet.privateKey,
        status: ENTITY_STATUS.ACTIVE,
        label: dto.label,
        description: dto.description,
        metadata,
      });

      this.logger.log(`Đã import ví: ${wallet.address}`);

      return wallet;
    } catch (error) {
      this.logger.error(`Lỗi khi import ví: ${error.message}`, error.stack);
      throw new BadRequestException(
        `Private key không hợp lệ: ${error.message}`,
      );
    }
  }

  /**
   * Lấy ví theo address
   */
  async findByAddress(address: string): Promise<Wallet | null> {
    return this.model.findOne({
      where: { address: address.toLowerCase() },
    });
  }

  /**
   * Kiểm tra ví đã tồn tại chưa
   */
  async isAddressExists(address: string): Promise<boolean> {
    const wallet = await this.findByAddress(address);
    return !!wallet;
  }

  /**
   * Lấy tất cả ví active
   */
  async findAllActive(): Promise<Wallet[]> {
    return this.model.find({
      where: { status: ENTITY_STATUS.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy số dư của ví (native token + ERC20 tokens)
   */
  async getWalletBalances(
    address: string,
    chainId: number,
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
