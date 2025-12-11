import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseCRUDService } from '@shared/services/base-crud.service';
import { BlockchainCall } from './blockchain-call.model';

@Injectable()
export class BlockchainCallService extends BaseCRUDService<BlockchainCall> {
  constructor(
    @InjectRepository(BlockchainCall)
    blockchainCallRepository: Repository<BlockchainCall>,
  ) {
    super(blockchainCallRepository);
  }

  /**
   * Tạo blockchain_call với refCode từ request
   * Tất cả các bản ghi liên quan đến cùng một API request sẽ dùng chung refCode
   */
  async create(
    dto: Partial<BlockchainCall>,
    refCode?: string,
  ): Promise<BlockchainCall> {
    const blockchainCall = await this.model.save({
      ...dto,
      refCode,
    } as BlockchainCall);

    return this.findByID(blockchainCall.id);
  }

  async findByRefCode(refCode: string): Promise<BlockchainCall | null> {
    return this.model.findOne({
      where: { refCode },
    });
  }
}
