import { NcpHttpClient } from '../http.js';
import { PATH_PREFIX } from '../constants.js';
import type { SendMailRequest, SendMailResponse } from './types.js';

export class MailClient {
  private readonly http: NcpHttpClient;

  constructor(httpClient: NcpHttpClient) {
    this.http = httpClient;
  }

  async send(request: SendMailRequest): Promise<SendMailResponse> {
    return this.http.request<SendMailResponse>(
      'POST',
      'mail',
      `${PATH_PREFIX.mail}/mails`,
      request,
    );
  }
}

export type * from './types.js';
