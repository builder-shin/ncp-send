import { NcpConfig } from './types.js';
import { NcpHttpClient } from './http.js';
import { SmsClient } from './sms/index.js';
import { AlimtalkClient } from './alimtalk/index.js';
import { MailClient } from './mail/index.js';

export class NcpSend {
  readonly sms: SmsClient;
  readonly alimtalk: AlimtalkClient;
  readonly mail: MailClient;

  constructor(config: NcpConfig) {
    const httpClient = new NcpHttpClient(config);
    this.sms = new SmsClient(httpClient, config.smsServiceId ?? '');
    this.alimtalk = new AlimtalkClient(httpClient, config.alimtalkServiceId ?? '');
    this.mail = new MailClient(httpClient);
  }
}
