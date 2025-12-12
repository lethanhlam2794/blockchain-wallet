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
import {
  CreateWalletDto,
  ImportWalletDto,
  TransferTokenDto,
  SweepTokensDto,
} from './wallet.dto';
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

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chuyển token từ ví này sang ví khác' })
  async transferToken(
    @Body() dto: TransferTokenDto,
    @RequestUser() user: any,
    @Req() request: AppRequest,
  ) {
    const refCode = getRefCode(request);
    return {
      success: true,
      data: await this.walletService.transferToken(dto, user.id, refCode),
    };
  }

  @Post('sweep')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gom tất cả token từ các ví của user vào 1 ví đích',
  })
  async sweepTokens(
    @Body() dto: SweepTokensDto,
    @RequestUser() user: any,
    @Req() request: AppRequest,
  ) {
    const refCode = getRefCode(request);
    return {
      success: true,
      data: await this.walletService.sweepTokens(dto, user.id, refCode),
    };
  }
}
