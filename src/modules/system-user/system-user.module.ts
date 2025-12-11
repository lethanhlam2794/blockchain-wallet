import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailModule } from '@modules/mail/mail.module';

import { SystemUser } from './system-user.model';
import { SystemUserService } from './system-user.service';

@Module({
  imports: [MailModule, TypeOrmModule.forFeature([SystemUser])],
  providers: [SystemUserService],
  exports: [SystemUserService],
})
export class SystemUserModule {}
