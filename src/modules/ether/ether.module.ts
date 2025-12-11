import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

import { ENV_KEY, INJECTION_TOKEN } from '@shared/constants';

import { BlockchainConfigModule } from '../blockchain-config/blockchain-config.module';
import { BlockchainConfigService } from '../blockchain-config/blockchain-config.service';

import { EtherController } from './ether.controller';
import { EtherService } from './ether.service';

@Module({
  imports: [BlockchainConfigModule],
  controllers: [EtherController],
  providers: [
    EtherService,
    {
      provide: INJECTION_TOKEN.ETH_PROVIDER,
      useFactory: async (
        configService: ConfigService,
        blockchainConfigService: BlockchainConfigService,
      ) => {
        // Ưu tiên load từ DB, fallback về env
        const blockchainName =
          configService.get<string>(ENV_KEY.ETH_BLOCKCHAIN_NAME) || 'ethereum';

        try {
          const config =
            await blockchainConfigService.findByName(blockchainName);
          return new ethers.JsonRpcProvider(config.rpcUrl);
        } catch (error) {
          // Fallback về env nếu không tìm thấy trong DB
          const rpcUrl =
            configService.get(ENV_KEY.ETH_RPC_URL) ||
            'https://eth.llamarpc.com';
          return new ethers.JsonRpcProvider(rpcUrl);
        }
      },
      inject: [ConfigService, BlockchainConfigService],
    },
    {
      provide: INJECTION_TOKEN.ETH_WALLET,
      useFactory: (
        configService: ConfigService,
        provider: ethers.JsonRpcProvider,
      ) => {
        const privateKey = configService.get<string>(ENV_KEY.ETH_PRIVATE_KEY);
        if (privateKey) {
          return new ethers.Wallet(privateKey, provider);
        }
        return null;
      },
      inject: [ConfigService, INJECTION_TOKEN.ETH_PROVIDER],
    },
  ],
  exports: [
    EtherService,
    INJECTION_TOKEN.ETH_PROVIDER,
    INJECTION_TOKEN.ETH_WALLET,
  ],
})
export class EtherModule {}
