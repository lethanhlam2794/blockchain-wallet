import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { EtherService } from './ether.service';
import { SendTransactionDto } from './ether.dto';

@ApiTags('ether')
@Controller('ether')
export class EtherController {
  constructor(private readonly etherService: EtherService) {}

  @Get('balance/:address')
  @ApiOperation({ summary: 'Lấy số dư của một địa chỉ' })
  async getBalance(@Param('address') address: string) {
    const balance = await this.etherService.getBalance(address);
    return {
      success: true,
      data: {
        address,
        balance: balance,
        unit: 'ETH',
      },
    };
  }

  @Get('wallet/balance')
  @ApiOperation({ summary: 'Lấy số dư của wallet hiện tại' })
  async getWalletBalance() {
    const balance = await this.etherService.getWalletBalance();
    const wallet = this.etherService.getWallet();
    return {
      success: true,
      data: {
        address: wallet?.address,
        balance: balance,
        unit: 'ETH',
      },
    };
  }

  @Post('transaction/send')
  @ApiOperation({ summary: 'Gửi ETH transaction' })
  @ApiBody({ type: SendTransactionDto })
  async sendTransaction(@Body() sendTransactionDto: SendTransactionDto) {
    const tx = await this.etherService.sendTransaction(
      sendTransactionDto.to,
      sendTransactionDto.amount,
    );
    return {
      success: true,
      data: {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value.toString(),
        status: 'pending',
      },
    };
  }

  @Get('transaction/:hash')
  @ApiOperation({ summary: 'Lấy thông tin transaction' })
  async getTransaction(@Param('hash') hash: string) {
    const tx = await this.etherService.getTransaction(hash);
    if (!tx) {
      return {
        success: false,
        message: 'Transaction không tồn tại',
      };
    }
    return {
      success: true,
      data: {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value.toString(),
        blockNumber: tx.blockNumber,
        confirmations: tx.confirmations,
      },
    };
  }

  @Get('transaction/:hash/receipt')
  @ApiOperation({ summary: 'Lấy transaction receipt' })
  async getTransactionReceipt(@Param('hash') hash: string) {
    const receipt = await this.etherService.getTransactionReceipt(hash);
    if (!receipt) {
      return {
        success: false,
        message: 'Transaction receipt chưa có',
      };
    }
    return {
      success: true,
      data: {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        status: receipt.status === 1 ? 'success' : 'failed',
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.gasPrice?.toString(),
      },
    };
  }

  @Get('block/number')
  @ApiOperation({ summary: 'Lấy block number hiện tại' })
  async getBlockNumber() {
    const blockNumber = await this.etherService.getBlockNumber();
    return {
      success: true,
      data: { blockNumber },
    };
  }

  @Get('block/:number')
  @ApiOperation({ summary: 'Lấy thông tin block' })
  async getBlock(@Param('number') number: string) {
    const block = await this.etherService.getBlock(parseInt(number));
    if (!block) {
      return {
        success: false,
        message: 'Block không tồn tại',
      };
    }
    return {
      success: true,
      data: {
        number: block.number,
        hash: block.hash,
        timestamp: block.timestamp,
        transactions: block.transactions.length,
      },
    };
  }

  @Get('validate-address/:address')
  @ApiOperation({ summary: 'Validate địa chỉ Ethereum' })
  validateAddress(@Param('address') address: string) {
    const isValid = this.etherService.isAddress(address);
    return {
      success: true,
      data: {
        address,
        isValid,
      },
    };
  }

  @Get('utils/parse-ether')
  @ApiOperation({ summary: 'Chuyển đổi ETH sang Wei' })
  parseEther(@Query('amount') amount: string) {
    const wei = this.etherService.parseEther(amount);
    return {
      success: true,
      data: {
        eth: amount,
        wei: wei.toString(),
      },
    };
  }

  @Get('utils/format-ether')
  @ApiOperation({ summary: 'Chuyển đổi Wei sang ETH' })
  formatEther(@Query('amount') amount: string) {
    const eth = this.etherService.formatEther(amount);
    return {
      success: true,
      data: {
        wei: amount,
        eth: eth,
      },
    };
  }
}
