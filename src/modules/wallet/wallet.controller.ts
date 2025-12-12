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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { WalletService } from './wallet.service';
import { CreateWalletDto, ImportWalletDto } from './wallet.dto';
import { Wallet } from './wallet.model';
import { getRefCode } from '@shared/decorators/refcode';
import { AppRequest } from '@shared/interfaces';
import { RequestUser } from '@shared/decorators/request-user';
import { AuthGuard } from '@modules/auth/auth.guard';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(AuthGuard)
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
  async createWallet(
    @Body() dto: CreateWalletDto,
    @Req() request: AppRequest,
    @RequestUser() user: any,
  ) {
    const refCode = getRefCode(request);
    const wallet = await this.walletService.createWallet(dto, user.id, refCode);
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
  async importWallet(
    @Body() dto: ImportWalletDto,
    @Req() request: AppRequest,
    @RequestUser() user: any,
  ) {
    const refCode = getRefCode(request);
    const wallet = await this.walletService.importWallet(dto, user.id, refCode);
    return {
      success: true,
      data: wallet,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách tất cả ví active (không có private key)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách ví',
    type: [Wallet],
  })
  async getAllWallets(@RequestUser() user: any) {
    const wallets = await this.walletService.findAllActive(user.id);
    // Loại bỏ private key khỏi response
    return wallets.map((wallet) => {
      const { privateKey, ...walletWithoutKey } = wallet;
      return walletWithoutKey;
    });
  }

  @Get(':address')
  @ApiOperation({
    summary: 'Lấy thông tin ví theo address (có private key đã giải mã)',
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin ví',
    type: Wallet,
  })
  async getWalletByAddress(
    @Param('address') address: string,
    @RequestUser() user: any,
  ): Promise<Wallet> {
    const wallet = await this.walletService.findByAddressWithDecryptedKey(
      address,
      user.id,
    );
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
    @RequestUser() user: any,
  ) {
    const chainIdNum = parseInt(chainId, 10);
    if (isNaN(chainIdNum)) {
      throw new BadRequestException('chainId phải là số hợp lệ');
    }

    return this.walletService.getWalletBalances(
      address.toLowerCase(),
      chainIdNum,
      user.id,
    );
  }
}
