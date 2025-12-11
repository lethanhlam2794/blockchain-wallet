import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { SignatureService } from '@shared/services/signature.service';
import { BlockchainCallService } from '../blockchain-call/blockchain-call.service';
import {
  GenerateSignatureDto,
  GenerateMessageSignatureDto,
  SignatureType,
} from './signature.dto';
import { BLOCKCHAIN_CALL_STATUS } from '@shared/constants';
import { getRefCode } from '@shared/decorators/refcode';
import { AppRequest } from '@shared/interfaces';

@ApiTags('Signature')
@Controller('signatures')
export class SignatureController {
  constructor(
    private readonly signatureService: SignatureService,
    private readonly blockchainCallService: BlockchainCallService,
  ) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tạo signature cho API request' })
  async generateSignature(
    @Body() dto: GenerateSignatureDto,
    @Req() request: AppRequest,
  ) {
    try {
      // Lấy refCode từ request (đã được tạo tự động bởi RefCodeInterceptor)
      const refCode = getRefCode(request);

      if (dto.type === SignatureType.ETHEREUM) {
        // Tạo Ethereum signature
        const result = await this.signatureService.addEthereumSignatureToBody(
          dto.method,
          dto.path,
          dto.body || {},
          dto.query,
          dto.timestamp,
          dto.privateKey,
        );

        // Lưu vào blockchain_call với refCode từ request
        await this.blockchainCallService.create(
          {
            signatureType: 'ethereum',
            backendMethod: dto.method,
            backendPath: dto.path,
            walletAddress: result.body.walletAddress,
            signature: result.body.signature,
            timestamp: result.timestamp,
            requestBody: dto.body,
            requestQuery: dto.query,
            status: BLOCKCHAIN_CALL_STATUS.SCHEDULED,
          } as any,
          refCode,
        );

        return {
          success: true,
          data: result.body,
        };
      } else {
        // Tạo HMAC signature
        if (!this.signatureService.hasSecretKey()) {
          throw new BadRequestException(
            'API_SECRET_KEY chưa được cấu hình. Vui lòng cấu hình trong file .env',
          );
        }

        const result = await this.signatureService.createSignature(
          dto.method,
          dto.path,
          dto.body,
          dto.query,
          dto.timestamp,
        );

        // Lưu vào blockchain_call với refCode từ request
        await this.blockchainCallService.create(
          {
            signatureType: 'hmac',
            backendMethod: dto.method,
            backendPath: dto.path,
            signature: result.signature,
            timestamp: result.timestamp,
            requestBody: dto.body,
            requestQuery: dto.query,
            requestHeaders: result.headers,
            status: BLOCKCHAIN_CALL_STATUS.SCHEDULED,
          } as any,
          refCode,
        );

        return {
          success: true,
          data: result,
        };
      }
    } catch (error) {
      throw new BadRequestException(
        error.message ||
          'Không thể tạo signature. Vui lòng kiểm tra lại thông tin.',
      );
    }
  }

  @Post('generate-message')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tạo Ethereum signature cho một message đơn giản' })
  async generateMessageSignature(@Body() dto: GenerateMessageSignatureDto) {
    try {
      const result = await this.signatureService.createEthereumSignature(
        dto.message,
        dto.privateKey,
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(
        error.message ||
          'Không thể tạo signature. Vui lòng kiểm tra lại private key hoặc wallet config.',
      );
    }
  }
}
