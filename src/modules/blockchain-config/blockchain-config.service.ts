import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ENTITY_STATUS } from '@shared/constants';
import { BaseCRUDService } from '@shared/services/base-crud.service';

import { BlockchainConfig } from './blockchain-config.model';

@Injectable()
export class BlockchainConfigService extends BaseCRUDService<BlockchainConfig> {
  protected logger = new Logger(BlockchainConfigService.name);

  constructor(
    @InjectRepository(BlockchainConfig)
    blockchainConfigRepository: Repository<BlockchainConfig>,
  ) {
    super(blockchainConfigRepository);
  }

  /**
   * Lấy config theo name
   */
  async findByName(name: string): Promise<BlockchainConfig> {
    const config = await this.model.findOne({
      where: { name: name.toLowerCase(), status: ENTITY_STATUS.ACTIVE },
    });

    if (!config) {
      throw new NotFoundException(
        `Blockchain config với name "${name}" không tồn tại`,
      );
    }

    return config;
  }

  /**
   * Lấy config theo chainId
   */
  async findByChainId(chainId: number): Promise<BlockchainConfig> {
    const config = await this.model.findOne({
      where: { chainId, status: ENTITY_STATUS.ACTIVE },
    });

    if (!config) {
      throw new NotFoundException(
        `Blockchain config với chainId "${chainId}" không tồn tại`,
      );
    }

    return config;
  }

  /**
   * Lấy tất cả configs active
   */
  async findAllActive(): Promise<BlockchainConfig[]> {
    return this.model.find({
      where: { status: ENTITY_STATUS.ACTIVE },
      order: { name: 'ASC' },
    });
  }

  /**
   * Lấy RPC URL theo name
   */
  async getRpcUrl(name: string): Promise<string> {
    const config = await this.findByName(name);
    return config.rpcUrl;
  }

  /**
   * Lấy chain ID theo name
   */
  async getChainId(name: string): Promise<number> {
    const config = await this.findByName(name);
    return config.chainId;
  }
}
