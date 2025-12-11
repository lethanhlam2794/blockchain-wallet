import { Module } from '@nestjs/common';

import { GlobalModule } from '@modules/global.module';
import { MailModule } from '@modules/mail/mail.module';
import { SystemUserModule } from '@modules/system-user/system-user.module';
import { UserModule } from '@modules/user/user.module';

import { AdminAuthGuard } from './admin-auth.guard';
import { AuthTestController } from './auth-test.controller';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { PartnerGuard } from './partner.guard';
import { UserRolesGuard } from './user-roles.guard';

@Module({
  providers: [
    AuthGuard,
    AuthService,
    AdminAuthGuard,
    PartnerGuard,
    UserRolesGuard,
  ],
  exports: [
    AuthGuard,
    AdminAuthGuard,
    AuthService,
    PartnerGuard,
    UserRolesGuard,
  ],
  imports: [GlobalModule, MailModule, SystemUserModule, UserModule],
  controllers: [AuthController, AuthTestController],
})
export class AuthModule {}
