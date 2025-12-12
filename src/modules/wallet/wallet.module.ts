import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Wallet } from './wallet.model';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { TokenModule } from '../token/token.module';
import { BlockchainConfigModule } from '../blockchain-config/blockchain-config.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet]),
    TokenModule,
    BlockchainConfigModule,
    AuthModule,
    UserModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
