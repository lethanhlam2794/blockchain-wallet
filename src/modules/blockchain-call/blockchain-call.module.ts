import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlockchainCall } from './blockchain-call.model';
import { BlockchainCallService } from './blockchain-call.service';

@Module({
  imports: [TypeOrmModule.forFeature([BlockchainCall])],
  providers: [BlockchainCallService],
  exports: [BlockchainCallService],
})
export class BlockchainCallModule {}
