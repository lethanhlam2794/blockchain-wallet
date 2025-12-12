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
import { BlockchainCallService } from '../blockchain-call/blockchain-call.service';
import {
  encryptPrivateKey,
  decryptPrivateKey,
  getEncryptionKey,
} from '@shared/utils/encrypt-private-key';
import { BLOCKCHAIN_CALL_STATUS } from '@shared/constants';

import { Wallet } from './wallet.model';
import {
  CreateWalletDto,
  ImportWalletDto,
  TransferTokenDto,
  SweepTokensDto,
} from './wallet.dto';
import { SWEEP_TYPE } from '@shared/constants';

@Injectable()
export class WalletService extends BaseCRUDService<Wallet> {
  protected logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(Wallet)
    walletRepository: Repository<Wallet>,
    private readonly tokenService: TokenService,
    private readonly blockchainConfigService: BlockchainConfigService,
    private readonly blockchainCallService: BlockchainCallService,
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

  /**
   * Chuyển token từ ví này sang ví khác
   */
  async transferToken(
    dto: TransferTokenDto,
    userId: string,
    refCode?: string,
  ): Promise<{
    transactionHash: string;
    fromAddress: string;
    toAddress: string;
    amount: string;
    type: 'native' | 'erc20';
  }> {
    try {
      // Kiểm tra ví nguồn thuộc về user
      const fromWallet = await this.findByAddressWithDecryptedKey(
        dto.fromAddress,
        userId,
      );
      if (!fromWallet) {
        throw new BadRequestException(
          'Ví nguồn không tồn tại hoặc không thuộc quyền sở hữu',
        );
      }

      // Validate addresses
      if (
        !ethers.isAddress(dto.fromAddress) ||
        !ethers.isAddress(dto.toAddress)
      ) {
        throw new BadRequestException('Địa chỉ ví không hợp lệ');
      }

      // Lấy blockchain config
      const blockchainConfig = await this.blockchainConfigService.findByChainId(
        dto.chainId,
      );
      const provider = new ethers.JsonRpcProvider(blockchainConfig.rpcUrl);

      // Validate token contract nếu type = token
      if (dto.type === SWEEP_TYPE.TOKEN && !dto.tokenContractAddress) {
        throw new BadRequestException(
          'tokenContractAddress là bắt buộc khi type = token',
        );
      }

      // Tạo wallet từ private key đã giải mã
      const wallet = new EthersWallet(fromWallet.privateKey, provider);

      let tx: ethers.TransactionResponse;

      if (dto.type === SWEEP_TYPE.TOKEN && dto.tokenContractAddress) {
        // Transfer ERC20 token
        const erc20Abi = [
          'function transfer(address to, uint256 amount) returns (bool)',
          'function decimals() view returns (uint8)',
        ];

        const tokenContract = new ethers.Contract(
          dto.tokenContractAddress,
          erc20Abi,
          wallet,
        );

        // Lấy decimals
        const decimals = await tokenContract.decimals();
        const amount = ethers.parseUnits(dto.amount, decimals);

        // Gửi transaction
        tx = await tokenContract.transfer(dto.toAddress, amount);
      } else {
        // Transfer native token
        const amount = ethers.parseEther(dto.amount);
        tx = await wallet.sendTransaction({
          to: dto.toAddress,
          value: amount,
        });
      }

      this.logger.log(
        `Đã gửi transaction: ${tx.hash} từ ${dto.fromAddress} đến ${dto.toAddress}`,
      );

      // Lưu transaction vào blockchain_call
      try {
        await this.blockchainCallService.create(
          {
            signatureType: 'ethereum',
            backendMethod: 'POST',
            backendPath: '/wallets/transfer',
            walletAddress: dto.fromAddress.toLowerCase(),
            status: BLOCKCHAIN_CALL_STATUS.EXECUTED,
            requestBody: {
              fromAddress: dto.fromAddress,
              toAddress: dto.toAddress,
              amount: dto.amount,
              type: dto.type,
              chainId: dto.chainId,
              tokenContractAddress: dto.tokenContractAddress,
            },
            backendResponse: JSON.stringify({
              transactionHash: tx.hash,
              fromAddress: dto.fromAddress.toLowerCase(),
              toAddress: dto.toAddress.toLowerCase(),
              amount: dto.amount,
              type: dto.tokenContractAddress ? 'erc20' : 'native',
            }),
            backendStatusCode: 200,
            metadata: {
              transactionHash: tx.hash,
              chainId: dto.chainId,
              type: dto.type,
            },
          },
          refCode,
        );
      } catch (error) {
        this.logger.warn(
          `Không thể lưu blockchain_call cho transaction ${tx.hash}: ${error.message}`,
        );
      }

      return {
        transactionHash: tx.hash,
        fromAddress: dto.fromAddress.toLowerCase(),
        toAddress: dto.toAddress.toLowerCase(),
        amount: dto.amount,
        type: dto.tokenContractAddress ? 'erc20' : 'native',
      };
    } catch (error) {
      this.logger.error(`Lỗi khi chuyển token: ${error.message}`, error.stack);
      throw new BadRequestException(`Lỗi khi chuyển token: ${error.message}`);
    }
  }

  /**
   * Gom tất cả token từ các ví của user vào 1 ví đích
   */
  async sweepTokens(
    dto: SweepTokensDto,
    userId: string,
    refCode?: string,
  ): Promise<{
    transactions: Array<{
      transactionHash: string;
      fromAddress: string;
      toAddress: string;
      amount: string;
    }>;
    totalAmount: string;
    totalWallets: number;
  }> {
    try {
      // Validate target address
      if (!ethers.isAddress(dto.targetAddress)) {
        throw new BadRequestException('Địa chỉ ví đích không hợp lệ');
      }

      // Kiểm tra ví đích có thuộc user không (optional, có thể bỏ qua)
      const targetWallet = await this.findByAddress(dto.targetAddress, userId);
      if (!targetWallet) {
        this.logger.warn(
          `Ví đích ${dto.targetAddress} không thuộc user ${userId}, vẫn tiếp tục gom tiền`,
        );
      }

      // Validate token contract nếu type = token
      if (dto.type === SWEEP_TYPE.TOKEN && !dto.tokenContractAddress) {
        throw new BadRequestException(
          'tokenContractAddress là bắt buộc khi type = token',
        );
      }

      // Lấy tất cả ví active của user
      const userWallets = await this.findAllActive(userId);

      // Lọc bỏ ví đích
      const sourceWallets = userWallets.filter(
        (w) => w.address.toLowerCase() !== dto.targetAddress.toLowerCase(),
      );

      if (sourceWallets.length === 0) {
        throw new BadRequestException('Không có ví nguồn để gom tiền');
      }

      // Lấy blockchain config
      const blockchainConfig = await this.blockchainConfigService.findByChainId(
        dto.chainId,
      );
      const provider = new ethers.JsonRpcProvider(blockchainConfig.rpcUrl);

      const transactions: Array<{
        transactionHash: string;
        fromAddress: string;
        toAddress: string;
        amount: string;
      }> = [];

      let totalAmount = 0n;
      let successCount = 0;

      for (const sourceWallet of sourceWallets) {
        try {
          // Giải mã private key
          const encryptionKey = getEncryptionKey(this.configService);
          const decryptedPrivateKey = decryptPrivateKey(
            sourceWallet.privateKey,
            encryptionKey,
          );

          // Tạo wallet từ private key
          const wallet = new EthersWallet(decryptedPrivateKey, provider);

          if (dto.type === SWEEP_TYPE.NATIVE) {
            // Gom native token
            const balance = await provider.getBalance(wallet.address);

            if (balance === 0n) {
              continue; // Bỏ qua ví không có số dư
            }

            try {
              const gasPrice = await provider.getFeeData();
              const currentGasPrice = gasPrice.gasPrice || 0n;

              if (currentGasPrice === 0n) {
                this.logger.warn(
                  `Không thể lấy gas price cho ví ${wallet.address}`,
                );
                continue;
              }

              // Estimate gas với value = 0 để lấy gas limit cơ bản
              // Sau đó tính toán lại với value thực tế
              const tempTx = {
                from: wallet.address,
                to: dto.targetAddress,
                value: 0n,
              };

              let estimatedGasLimit: bigint;
              try {
                estimatedGasLimit = await provider.estimateGas(tempTx);
              } catch {
                // Nếu estimate với value = 0 fail, dùng giá trị mặc định
                estimatedGasLimit = 21000n;
              }

              // Tính gas cost với buffer 30% để an toàn
              const gasCost =
                (estimatedGasLimit * currentGasPrice * 130n) / 100n;

              // Chỉ chuyển nếu số dư > gas cost
              if (balance > gasCost) {
                const amountToTransfer = balance - gasCost;

                // Estimate lại với value thực tế để chính xác hơn
                let finalGasLimit = estimatedGasLimit;
                try {
                  const finalTx = {
                    from: wallet.address,
                    to: dto.targetAddress,
                    value: amountToTransfer,
                  };
                  finalGasLimit = await provider.estimateGas(finalTx);
                  // Thêm buffer 10% cho gas limit
                  finalGasLimit = (finalGasLimit * 110n) / 100n;
                } catch {
                  // Nếu estimate fail, dùng giá trị cũ với buffer lớn hơn
                  finalGasLimit = (estimatedGasLimit * 150n) / 100n;
                }

                // Tính lại gas cost với gas limit mới
                const finalGasCost =
                  (finalGasLimit * currentGasPrice * 110n) / 100n;

                // Đảm bảo số dư đủ sau khi tính lại
                if (balance > finalGasCost) {
                  const finalAmountToTransfer = balance - finalGasCost;

                  const tx = await wallet.sendTransaction({
                    to: dto.targetAddress,
                    value: finalAmountToTransfer,
                    gasLimit: finalGasLimit,
                    gasPrice: currentGasPrice,
                  });

                  transactions.push({
                    transactionHash: tx.hash,
                    fromAddress: wallet.address.toLowerCase(),
                    toAddress: dto.targetAddress.toLowerCase(),
                    amount: ethers.formatEther(finalAmountToTransfer),
                  });

                  totalAmount += finalAmountToTransfer;
                  successCount++;
                } else {
                  this.logger.warn(
                    `Ví ${wallet.address} không đủ số dư sau khi tính lại gas. Balance: ${ethers.formatEther(balance)}, Gas cost: ${ethers.formatEther(finalGasCost)}`,
                  );
                }
              } else {
                this.logger.warn(
                  `Ví ${wallet.address} không đủ số dư để trả gas fee. Balance: ${ethers.formatEther(balance)}, Gas cost: ${ethers.formatEther(gasCost)}`,
                );
              }
            } catch (error) {
              this.logger.warn(
                `Không thể gom native token từ ví ${wallet.address}: ${error.message}`,
              );
            }
          } else {
            // Gom ERC20 token
            const erc20Abi = [
              'function transfer(address to, uint256 amount) returns (bool)',
              'function balanceOf(address owner) view returns (uint256)',
              'function decimals() view returns (uint8)',
            ];

            const tokenContract = new ethers.Contract(
              dto.tokenContractAddress!,
              erc20Abi,
              wallet,
            );

            // Lấy số dư token
            const balance = await tokenContract.balanceOf(wallet.address);

            // Chỉ chuyển nếu có số dư
            if (balance > 0n) {
              const tx = await tokenContract.transfer(
                dto.targetAddress,
                balance,
              );

              const decimals = await tokenContract.decimals();
              transactions.push({
                transactionHash: tx.hash,
                fromAddress: wallet.address.toLowerCase(),
                toAddress: dto.targetAddress.toLowerCase(),
                amount: ethers.formatUnits(balance, decimals),
              });

              totalAmount += balance;
              successCount++;
            }
          }
        } catch (error) {
          this.logger.warn(
            `Không thể gom token từ ví ${sourceWallet.address}: ${error.message}`,
          );
          // Tiếp tục với ví tiếp theo
        }
      }

      if (transactions.length === 0) {
        throw new BadRequestException(
          'Không có token nào để gom từ các ví nguồn',
        );
      }

      // Format total amount
      let totalAmountFormatted: string;
      if (dto.type === SWEEP_TYPE.NATIVE) {
        totalAmountFormatted = ethers.formatEther(totalAmount);
      } else {
        // Cần lấy decimals từ token contract
        const erc20Abi = ['function decimals() view returns (uint8)'];
        const tokenContract = new ethers.Contract(
          dto.tokenContractAddress!,
          erc20Abi,
          provider,
        );
        const decimals = await tokenContract.decimals();
        totalAmountFormatted = ethers.formatUnits(totalAmount, decimals);
      }

      this.logger.log(
        `Đã gom ${successCount} ví, tổng số lượng: ${totalAmountFormatted}`,
      );

      // Lưu sweep operation vào blockchain_call
      try {
        await this.blockchainCallService.create(
          {
            signatureType: 'ethereum',
            backendMethod: 'POST',
            backendPath: '/wallets/sweep',
            walletAddress: dto.targetAddress.toLowerCase(),
            status: BLOCKCHAIN_CALL_STATUS.EXECUTED,
            requestBody: {
              targetAddress: dto.targetAddress,
              type: dto.type,
              chainId: dto.chainId,
              tokenContractAddress: dto.tokenContractAddress,
            },
            backendResponse: JSON.stringify({
              transactions,
              totalAmount: totalAmountFormatted,
              totalWallets: successCount,
            }),
            backendStatusCode: 200,
            metadata: {
              transactions: transactions.map((t) => ({
                transactionHash: t.transactionHash,
                fromAddress: t.fromAddress,
                toAddress: t.toAddress,
                amount: t.amount,
              })),
              totalAmount: totalAmountFormatted,
              totalWallets: successCount,
              chainId: dto.chainId,
              type: dto.type,
            },
          },
          refCode,
        );
      } catch (error) {
        this.logger.warn(
          `Không thể lưu blockchain_call cho sweep operation: ${error.message}`,
        );
      }

      return {
        transactions,
        totalAmount: totalAmountFormatted,
        totalWallets: successCount,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Lỗi khi gom token: ${error.message}`, error.stack);
      throw new BadRequestException(`Lỗi khi gom token: ${error.message}`);
    }
  }
}
