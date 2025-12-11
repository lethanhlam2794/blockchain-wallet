import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import { APP_ENV, EmailSender } from 'mvc-common-toolkit';
import { ConfigService } from '@nestjs/config';
import { ENV_KEY } from '@shared/constants';

@Injectable()
export class NodemailerTransporter implements EmailSender {
  private logger = new Logger(NodemailerTransporter.name);

  private _transporter: nodemailer.Transporter;

  constructor(protected configService: ConfigService) {
    this.initTransporter();
  }

  public send(mailOptions: any): Promise<void> {
    try {
      return this._transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.error(error.message, error.stack);

      this.initTransporter();
    }
  }

  protected initTransporter(): void {
    this._transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow(ENV_KEY.SMTP_HOST),
      port: this.configService.getOrThrow(ENV_KEY.SMTP_PORT),
      secure: this.configService.getOrThrow(ENV_KEY.SMTP_SECURE) == 'true',
      name: 'Vinachain',
      auth: {
        user: this.configService.getOrThrow(ENV_KEY.SMTP_USERNAME),
        pass: this.configService.getOrThrow(ENV_KEY.SMTP_PASSWORD),
      },
      logger: false,
      debug:
        this.configService.getOrThrow(ENV_KEY.NODE_ENV) === APP_ENV.DEVELOPMENT,
    });
  }
}
