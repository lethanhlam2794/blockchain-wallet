import {
  Injectable,
  Logger,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';

import { ENTITY_STATUS } from '@shared/constants';
import { BaseCRUDService } from '@shared/services/base-crud.service';
import { mergeRefCodeToMetadata } from '@shared/helpers/refcode';
import { BlockchainConfigService } from '../blockchain-config/blockchain-config.service';

import { Token } from './token.model';
import { ImportTokenDto } from './token.dto';

@Injectable()
export class TokenService extends BaseCRUDService<Token> {
  protected logger = new Logger(TokenService.name);

  constructor(
    @InjectRepository(Token)
    tokenRepository: Repository<Token>,
    private readonly blockchainConfigService: BlockchainConfigService,
  ) {
    super(tokenRepository);
  }

  /**
   * Import token từ địa chỉ contract
   */
  async importToken(dto: ImportTokenDto, refCode?: string): Promise<Token> {
    try {
      // Kiểm tra blockchain-config với chainId này đã tồn tại chưa
      try {
        await this.blockchainConfigService.findByChainId(dto.chainId);
      } catch (error) {
        throw new BadRequestException(
          `Blockchain config với chainId ${dto.chainId} chưa tồn tại. Vui lòng tạo blockchain config trước.`,
        );
      }

      // Validate địa chỉ (đã được lowercase bởi decorator)
      if (!ethers.isAddress(dto.address)) {
        throw new BadRequestException('Địa chỉ token không hợp lệ');
      }

      // Kiểm tra token đã tồn tại chưa (theo address + chainId)
      const existingToken = await this.model.findOne({
        where: {
          address: dto.address,
          chainId: dto.chainId,
        },
      });

      if (existingToken) {
        this.logger.warn(
          `Token với address ${dto.address} và chainId ${dto.chainId} đã tồn tại`,
        );
        // Cập nhật thông tin nếu có thay đổi
        if (
          dto.symbol ||
          dto.name ||
          dto.decimals !== undefined ||
          dto.label ||
          dto.description ||
          dto.metadata ||
          refCode
        ) {
          existingToken.symbol = dto.symbol || existingToken.symbol;
          existingToken.name = dto.name || existingToken.name;
          existingToken.decimals =
            dto.decimals !== undefined ? dto.decimals : existingToken.decimals;
          existingToken.label = dto.label || existingToken.label;
          existingToken.description =
            dto.description || existingToken.description;
          existingToken.metadata = mergeRefCodeToMetadata(
            dto.metadata || existingToken.metadata,
            refCode,
          );
          return this.model.save(existingToken);
        }
        return existingToken;
      }

      // Merge refCode vào metadata
      const metadata = mergeRefCodeToMetadata(dto.metadata, refCode);

      // Lưu vào database
      const token = await this.model.save({
        address: dto.address,
        symbol: dto.symbol,
        name: dto.name,
        decimals: dto.decimals ?? 18,
        chainId: dto.chainId,
        status: ENTITY_STATUS.ACTIVE,
        label: dto.label,
        description: dto.description,
        metadata,
      });

      this.logger.log(
        `Đã import token: ${token.symbol} (${token.address}) trên chainId ${token.chainId}`,
      );

      return token;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error(`Lỗi khi import token: ${error.message}`, error.stack);
      throw new BadRequestException(`Lỗi khi import token: ${error.message}`);
    }
  }

  /**
   * Lấy token theo address và chainId
   */
  async findByAddressAndChainId(
    address: string,
    chainId: number,
  ): Promise<Token | null> {
    return this.model.findOne({
      where: {
        address: address.toLowerCase(),
        chainId,
        status: ENTITY_STATUS.ACTIVE,
      },
    });
  }

  /**
   * Lấy token theo symbol và chainId
   */
  async findBySymbolAndChainId(
    symbol: string,
    chainId: number,
  ): Promise<Token | null> {
    return this.model.findOne({
      where: {
        symbol: symbol.toLowerCase(),
        chainId,
        status: ENTITY_STATUS.ACTIVE,
      },
    });
  }

  /**
   * Lấy tất cả token active theo chainId
   */
  async findAllByChainId(chainId: number): Promise<Token[]> {
    return this.model.find({
      where: { chainId, status: ENTITY_STATUS.ACTIVE },
      order: { symbol: 'ASC' },
    });
  }

  /**
   * Lấy tất cả token active
   */
  async findAllActive(): Promise<Token[]> {
    return this.model.find({
      where: { status: ENTITY_STATUS.ACTIVE },
      order: { chainId: 'ASC', symbol: 'ASC' },
    });
  }
}
