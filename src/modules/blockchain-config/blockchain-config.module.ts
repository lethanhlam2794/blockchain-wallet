import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlockchainConfig } from './blockchain-config.model';
import { BlockchainConfigController } from './blockchain-config.controller';
import { BlockchainConfigService } from './blockchain-config.service';

@Module({
  imports: [TypeOrmModule.forFeature([BlockchainConfig])],
  controllers: [BlockchainConfigController],
  providers: [BlockchainConfigService],
  exports: [BlockchainConfigService],
})
export class BlockchainConfigModule {}
