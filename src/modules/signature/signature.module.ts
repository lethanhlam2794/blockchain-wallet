import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SignatureController } from './signature.controller';
import { SignatureService } from '@shared/services/signature.service';
import { EtherModule } from '../ether/ether.module';
import { BlockchainCallModule } from '../blockchain-call/blockchain-call.module';
import { INJECTION_TOKEN } from '@shared/constants';

@Module({
  imports: [ConfigModule, EtherModule, BlockchainCallModule],
  controllers: [SignatureController],
  providers: [
    {
      provide: SignatureService,
      useFactory: (configService, wallet) => {
        return new SignatureService(configService, wallet);
      },
      inject: [ConfigService, INJECTION_TOKEN.ETH_WALLET],
    },
  ],
  exports: [SignatureService],
})
export class SignatureModule {}
