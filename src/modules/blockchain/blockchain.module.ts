import {
  BlockchainService,
  BscGateway,
  constants,
  types,
} from 'evm-blockchain-tools';

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ENV_KEY, INJECTION_TOKEN } from '@shared/constants';

import { BlockChainGatewayService } from './blockchain-gateway.service';

@Module({
  providers: [
    BlockChainGatewayService,
    {
      provide: INJECTION_TOKEN.BSC_WEB3_GATEWAY,
      useFactory: (configService: ConfigService) => {
        const rpcUrl = configService.getOrThrow(ENV_KEY.BSC_PROVIDER_URL);

        // Ưu tiên chainId từ env variable, nếu không có thì detect từ RPC URL
        let chainId: number;
        const envChainId = configService.get<string>(ENV_KEY.BSC_CHAIN_ID);

        if (envChainId) {
          chainId = parseInt(envChainId, 10);
        } else {
          // Detect chainId từ RPC URL
          const isTestnet =
            rpcUrl.includes('testnet') ||
            rpcUrl.includes('prebsc') ||
            rpcUrl.includes('data-seed-prebsc');
          chainId = isTestnet
            ? constants.NETWORK_IDS.BINANCE_TESTNET
            : constants.NETWORK_IDS.BINANCE;
        }

        const network =
          chainId === constants.NETWORK_IDS.BINANCE_TESTNET
            ? constants.APP_NETWORK.BINANCE_TESTNET
            : constants.APP_NETWORK.BINANCE;

        return new BscGateway({
          httpsUrl: rpcUrl,
          privateKey: configService.getOrThrow(ENV_KEY.SYSTEM_PRIVATE_KEY),
          chainId,
          network,
        });
      },
      inject: [ConfigService],
    },
    {
      provide: INJECTION_TOKEN.BLOCKCHAIN_SERVICE,
      useFactory: (bscGateway: types.IWeb3Gateway) =>
        new BlockchainService(bscGateway),
      inject: [INJECTION_TOKEN.BSC_WEB3_GATEWAY],
    },
  ],
  exports: [
    BlockChainGatewayService,
    INJECTION_TOKEN.BLOCKCHAIN_SERVICE,
    INJECTION_TOKEN.BSC_WEB3_GATEWAY,
  ],
  imports: [HttpModule],
})
export class BlockChainModule {}
