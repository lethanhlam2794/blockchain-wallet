import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OperationResult, bcryptHelper, stringUtils } from 'mvc-common-toolkit';

import { User } from './user.model';
import { UserPasscodeDTO } from './user.dto';
import { ERR_CODE, ENTITY_STATUS } from '@shared/constants';
import { BaseCRUDService } from '@shared/services/base-crud.service';
import { RegisterDTO } from '@modules/auth/auth.dto';
import { UserAuthProfile } from '@shared/interfaces';

@Injectable()
export class UserService extends BaseCRUDService<User> {
  constructor(
    @InjectRepository(User)
    userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  public async getById(id: string): Promise<User> {
    return this.findByID(id);
  }

  public async getOne(
    filter: Partial<User>,
    _options: { forceReload?: boolean } = {},
  ): Promise<User> {
    return this.model.findOne({ where: filter as any });
  }

  public async updateById(
    id: string,
    dto: Partial<User>,
  ): Promise<User | null> {
    await this.model.update({ id }, dto);
    return this.getById(id);
  }

  public async verifyUserUniqueness(
    dto: RegisterDTO,
  ): Promise<OperationResult> {
    if (dto.email) {
      const emailExists = await this.model.exists({
        where: { email: dto.email.toLowerCase() },
      } as any);

      if (emailExists) {
        return {
          success: false,
          message: 'email already exists',
          code: ERR_CODE.EMAIL_ALREADY_EXISTS,
          httpCode: HttpStatus.CONFLICT,
        };
      }
    }

    if (dto.username) {
      const usernameExists = await this.model.exists({
        where: { username: dto.username.toLowerCase() },
      } as any);

      if (usernameExists) {
        return {
          success: false,
          message: 'username already exists',
          code: ERR_CODE.USERNAME_ALREADY_EXISTS,
          httpCode: HttpStatus.CONFLICT,
        };
      }
    }

    return { success: true };
  }

  public async createUserPasscode(
    user: UserAuthProfile,
    dto: UserPasscodeDTO,
  ): Promise<OperationResult> {
    const hashed = await bcryptHelper.hash(dto.passcode);
    await this.updateById(user.id, { passcode: hashed });

    return { success: true };
  }
}
