import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { WalletService } from './wallet.service';
import { CreateWalletDto, ImportWalletDto } from './wallet.dto';
import { Wallet } from './wallet.model';
import { getRefCode } from '@shared/decorators/refcode';
import { AppRequest } from '@shared/interfaces';

@ApiTags('Wallet')
@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo ví EVM mới' })
  @ApiResponse({
    status: 201,
    description: 'Tạo ví thành công',
    type: Wallet,
  })
  async createWallet(@Body() dto: CreateWalletDto, @Req() request: AppRequest) {
    const refCode = getRefCode(request);
    const wallet = await this.walletService.createWallet(dto, refCode);
    return {
      success: true,
      data: wallet,
    };
  }

  @Post('import')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Import ví từ private key' })
  @ApiResponse({
    status: 201,
    description: 'Import ví thành công',
    type: Wallet,
  })
  async importWallet(@Body() dto: ImportWalletDto, @Req() request: AppRequest) {
    const refCode = getRefCode(request);
    const wallet = await this.walletService.importWallet(dto, refCode);
    return {
      success: true,
      data: wallet,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả ví active' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách ví',
    type: [Wallet],
  })
  async getAllWallets(): Promise<Wallet[]> {
    return this.walletService.findAllActive();
  }

  @Get(':address')
  @ApiOperation({ summary: 'Lấy thông tin ví theo address' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin ví',
    type: Wallet,
  })
  async getWalletByAddress(@Param('address') address: string): Promise<Wallet> {
    const wallet = await this.walletService.findByAddress(address);
    if (!wallet) {
      throw new NotFoundException(`Không tìm thấy ví với address: ${address}`);
    }
    return wallet;
  }

  @Get(':address/balance')
  @ApiOperation({
    summary: 'Lấy số dư của ví (native token + ERC20 tokens)',
  })
  @ApiQuery({
    name: 'chainId',
    required: true,
    description: 'Chain ID',
    type: Number,
    example: 97,
  })
  @ApiResponse({
    status: 200,
    description: 'Số dư của ví',
    schema: {
      type: 'object',
      properties: {
        address: { type: 'string' },
        chainId: { type: 'number' },
        nativeCurrency: { type: 'string' },
        balances: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              symbol: { type: 'string' },
              name: { type: 'string' },
              balance: { type: 'string' },
              type: { type: 'string', enum: ['native', 'erc20'] },
            },
          },
        },
      },
    },
  })
  async getWalletBalances(
    @Param('address') address: string,
    @Query('chainId') chainId: string,
  ) {
    const chainIdNum = parseInt(chainId, 10);
    if (isNaN(chainIdNum)) {
      throw new BadRequestException('chainId phải là số hợp lệ');
    }

    return this.walletService.getWalletBalances(
      address.toLowerCase(),
      chainIdNum,
    );
  }
}
