import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  CreateBlockchainConfigDto,
  UpdateBlockchainConfigDto,
} from './blockchain-config.dto';
import { BlockchainConfigService } from './blockchain-config.service';
import { getRefCode } from '@shared/decorators/refcode';
import { AppRequest } from '@shared/interfaces';
import { mergeRefCodeToMetadata } from '@shared/helpers/refcode';

@ApiTags('blockchain-config')
@Controller('blockchain-configs')
export class BlockchainConfigController {
  constructor(
    private readonly blockchainConfigService: BlockchainConfigService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo blockchain config mới' })
  async create(
    @Body() createDto: CreateBlockchainConfigDto,
    @Req() request: AppRequest,
  ) {
    const refCode = getRefCode(request);
    // Merge refCode vào metadata trước khi tạo
    const dtoWithRefCode = {
      ...createDto,
      metadata: mergeRefCodeToMetadata(createDto.metadata, refCode),
    };
    const result = await this.blockchainConfigService.create(
      dtoWithRefCode,
      refCode,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả blockchain configs active' })
  async findAll() {
    const result = await this.blockchainConfigService.findAllActive();
    return {
      success: true,
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy blockchain config theo ID' })
  @ApiParam({ name: 'id', description: 'Config ID' })
  async findOne(@Param('id') id: string) {
    const result = await this.blockchainConfigService.model.findOne({
      where: { id },
    });
    return {
      success: true,
      data: result,
    };
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Lấy blockchain config theo name' })
  @ApiParam({ name: 'name', description: 'Config name' })
  async findByName(@Param('name') name: string) {
    const result = await this.blockchainConfigService.findByName(name);
    return {
      success: true,
      data: result,
    };
  }

  @Get('chain-id/:chainId')
  @ApiOperation({ summary: 'Lấy blockchain config theo chain ID' })
  @ApiParam({ name: 'chainId', description: 'Chain ID' })
  async findByChainId(@Param('chainId') chainId: string) {
    const result = await this.blockchainConfigService.findByChainId(+chainId);
    return {
      success: true,
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật blockchain config' })
  @ApiParam({ name: 'id', description: 'Config ID' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBlockchainConfigDto,
  ) {
    const result = await this.blockchainConfigService.model.update(
      id,
      updateDto,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa blockchain config (soft delete)' })
  @ApiParam({ name: 'id', description: 'Config ID' })
  async remove(@Param('id') id: string) {
    const result = await this.blockchainConfigService.model.softDelete(id);
    return {
      success: true,
      data: result,
    };
  }
}
