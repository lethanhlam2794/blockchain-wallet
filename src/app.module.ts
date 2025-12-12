import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlockChainModule } from './modules/blockchain/blockchain.module';
import { BlockchainConfigModule } from './modules/blockchain-config/blockchain-config.module';
import { EtherModule } from './modules/ether/ether.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { TokenModule } from './modules/token/token.module';
import { SignatureModule } from './modules/signature/signature.module';
import { BlockchainCallModule } from './modules/blockchain-call/blockchain-call.module';
import { UserModule } from './modules/user/user.module';
import { GlobalModule } from './modules/global.module';
import { MailModule } from './modules/mail/mail.module';
import { SystemRolesModule } from './modules/system-roles/system-roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.local.env', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow('DB_HOST'),
        port: +configService.getOrThrow('DB_PORT'),
        username: configService.getOrThrow('DB_USERNAME'),
        password: configService.getOrThrow('DB_PASSWORD'),
        database: configService.getOrThrow('DB_SCHEMA'),
        autoLoadEntities: true,
        entities: [],
        synchronize:
          configService.get('DB_SYNCHRONIZE')?.toLowerCase() === 'true',
        logging: configService.get('DB_LOGGING')?.toLowerCase() === 'true',
      }),
      inject: [ConfigService],
    }),
    GlobalModule,
    MailModule,
    SystemRolesModule,
    BlockchainConfigModule,
    BlockChainModule,
    EtherModule,
    UserModule,
    WalletModule,
    TokenModule,
    SignatureModule,
    BlockchainCallModule,
  ],
})
export class AppModule {}
