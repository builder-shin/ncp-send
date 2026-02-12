import { NcpHttpClient } from '../http.js';
import { PATH_PREFIX } from '../constants.js';
import type {
  SendAlimtalkRequest,
  SendAlimtalkResponse,
  GetAlimtalkRequestParams,
  GetAlimtalkMessagesResponse,
  GetAlimtalkMessageResponse,
  AlimtalkReserveStatus,
  AlimtalkChannel,
  GetAlimtalkTemplatesParams,
  AlimtalkTemplate,
} from './types.js';

export class AlimtalkClient {
  private readonly http: NcpHttpClient;
  private readonly serviceId: string;

  constructor(httpClient: NcpHttpClient, serviceId: string) {
    this.http = httpClient;
    this.serviceId = serviceId;
  }

  private ensureServiceId(): void {
    if (!this.serviceId) {
      throw new Error('alimtalkServiceId is required. Provide it in NcpConfig.');
    }
  }

  private basePath(): string {
    return `${PATH_PREFIX.alimtalk}/services/${this.serviceId}`;
  }

  async send(request: SendAlimtalkRequest): Promise<SendAlimtalkResponse> {
    this.ensureServiceId();
    return this.http.request<SendAlimtalkResponse>(
      'POST',
      'sens',
      `${this.basePath()}/messages`,
      request,
    );
  }

  async getRequest(params: GetAlimtalkRequestParams): Promise<GetAlimtalkMessagesResponse> {
    this.ensureServiceId();
    return this.http.request<GetAlimtalkMessagesResponse>(
      'GET',
      'sens',
      `${this.basePath()}/messages?requestId=${params.requestId}`,
    );
  }

  async getMessage(messageId: string): Promise<GetAlimtalkMessageResponse> {
    this.ensureServiceId();
    return this.http.request<GetAlimtalkMessageResponse>(
      'GET',
      'sens',
      `${this.basePath()}/messages/${messageId}`,
    );
  }

  async getReserveStatus(reserveId: string): Promise<AlimtalkReserveStatus> {
    this.ensureServiceId();
    return this.http.request<AlimtalkReserveStatus>(
      'GET',
      'sens',
      `${this.basePath()}/reservations/${reserveId}/reserve-status`,
    );
  }

  async cancelReserve(reserveId: string): Promise<void> {
    this.ensureServiceId();
    return this.http.request<void>(
      'DELETE',
      'sens',
      `${this.basePath()}/reservations/${reserveId}`,
    );
  }

  async getChannels(): Promise<AlimtalkChannel[]> {
    this.ensureServiceId();
    return this.http.request<AlimtalkChannel[]>(
      'GET',
      'sens',
      `${this.basePath()}/channels`,
    );
  }

  async getTemplates(params: GetAlimtalkTemplatesParams): Promise<AlimtalkTemplate[]> {
    this.ensureServiceId();
    let path = `${this.basePath()}/templates?channelId=${params.channelId}`;
    if (params.templateCode) {
      path += `&templateCode=${params.templateCode}`;
    }
    return this.http.request<AlimtalkTemplate[]>(
      'GET',
      'sens',
      path,
    );
  }
}

export type * from './types.js';
