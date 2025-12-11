import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { bcryptHelper, MailService, stringUtils } from 'mvc-common-toolkit';

import { BaseCRUDService } from '@shared/services/base-crud.service';
import { ENV_KEY, INJECTION_TOKEN } from '@shared/constants';

import { SystemUser } from './system-user.model';
import { DEFAULT_ROLES } from '@modules/system-roles/default-roles';

@Injectable()
export class SystemUserService
  extends BaseCRUDService<SystemUser>
  implements OnModuleInit
{
  protected logger = new Logger(SystemUserService.name);

  constructor(
    protected configService: ConfigService,

    @InjectRepository(SystemUser)
    model: Repository<SystemUser>,

    @Inject(INJECTION_TOKEN.MAILER_SERVICE)
    protected mailerService: MailService,
  ) {
    super(model);
  }

  public async getOne(
    filter: Partial<SystemUser>,
    _options: { forceReload?: boolean } = {},
  ): Promise<SystemUser | null> {
    return this.model.findOne({ where: filter as any });
  }

  public async getById(id: string): Promise<SystemUser | null> {
    return this.findByID(id);
  }

  public async onModuleInit() {
    const existingAdmin = await this.findOne({});
    if (!existingAdmin) {
      const randomPassword = stringUtils.generatePassword();
      const hashedPassword = await bcryptHelper.hash(randomPassword, 10);

      await this.create({
        username: 'admin',
        password: hashedPassword,
        fullName: 'Vinachain Admin',
        role: DEFAULT_ROLES.ADMIN.name,
      });

      this.mailerService
        .send({
          subject: '[Vinachain] Default admin credentials',
          from: 'Vinachain Support<support@vinachain.io>',
          to: this.configService.getOrThrow(ENV_KEY.DEFAULT_ADMIN_ADDRESS),
          cc: this.configService.getOrThrow(ENV_KEY.DEFAULT_CC_ADDRESS),
          text: `The password is: ${randomPassword}`,
        })
        .catch((error) => {
          this.logger.error(error.message, error.stack);

          this.logger.log(`The password is: ${randomPassword}`);
        });
    }
  }
}
