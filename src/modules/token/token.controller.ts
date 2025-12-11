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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { TokenService } from './token.service';
import { ImportTokenDto } from './token.dto';
import { getRefCode } from '@shared/decorators/refcode';
import { AppRequest } from '@shared/interfaces';

@ApiTags('Token')
@Controller('tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('import')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Import token từ địa chỉ contract' })
  async importToken(@Body() dto: ImportTokenDto, @Req() request: AppRequest) {
    const refCode = getRefCode(request);
    const result = await this.tokenService.importToken(dto, refCode);
    return {
      success: true,
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả token active' })
  @ApiQuery({
    name: 'chainId',
    required: false,
    description: 'Lọc theo chainId',
    type: Number,
  })
  async getAllTokens(@Query('chainId') chainId?: string) {
    const result = chainId
      ? await this.tokenService.findAllByChainId(parseInt(chainId, 10))
      : await this.tokenService.findAllActive();
    return {
      success: true,
      data: result,
    };
  }

  @Get('address/:address')
  @ApiOperation({ summary: 'Lấy thông tin token theo address và chainId' })
  @ApiQuery({
    name: 'chainId',
    required: true,
    description: 'Chain ID',
    type: Number,
  })
  async getTokenByAddress(
    @Param('address') address: string,
    @Query('chainId') chainId: string,
  ) {
    const token = await this.tokenService.findByAddressAndChainId(
      address,
      parseInt(chainId, 10),
    );
    if (!token) {
      throw new NotFoundException(
        `Không tìm thấy token với address: ${address} và chainId: ${chainId}`,
      );
    }
    return {
      success: true,
      data: token,
    };
  }

  @Get('symbol/:symbol')
  @ApiOperation({ summary: 'Lấy thông tin token theo symbol và chainId' })
  @ApiQuery({
    name: 'chainId',
    required: true,
    description: 'Chain ID',
    type: Number,
  })
  async getTokenBySymbol(
    @Param('symbol') symbol: string,
    @Query('chainId') chainId: string,
  ) {
    const token = await this.tokenService.findBySymbolAndChainId(
      symbol,
      parseInt(chainId, 10),
    );
    if (!token) {
      throw new NotFoundException(
        `Không tìm thấy token với symbol: ${symbol} và chainId: ${chainId}`,
      );
    }
    return {
      success: true,
      data: token,
    };
  }
}
