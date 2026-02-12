import { NcpHttpClient } from '../http.js';
import { PATH_PREFIX } from '../constants.js';
import type {
  SendSmsRequest,
  SendSmsResponse,
  GetSmsRequestParams,
  GetSmsMessagesResponse,
  GetSmsMessageResponse,
  SmsReserveStatus,
  FileUploadRequest,
  FileUploadResponse,
} from './types.js';

export class SmsClient {
  private readonly http: NcpHttpClient;
  private readonly serviceId: string;

  constructor(httpClient: NcpHttpClient, serviceId: string) {
    this.http = httpClient;
    this.serviceId = serviceId;
  }

  private ensureServiceId(): void {
    if (!this.serviceId) {
      throw new Error('smsServiceId is required. Provide it in NcpConfig.');
    }
  }

  private basePath(): string {
    return `${PATH_PREFIX.sms}/services/${this.serviceId}`;
  }

  async send(request: SendSmsRequest): Promise<SendSmsResponse> {
    this.ensureServiceId();
    return this.http.request<SendSmsResponse>(
      'POST',
      'sens',
      `${this.basePath()}/messages`,
      request,
    );
  }

  async getRequest(params: GetSmsRequestParams): Promise<GetSmsMessagesResponse> {
    this.ensureServiceId();
    return this.http.request<GetSmsMessagesResponse>(
      'GET',
      'sens',
      `${this.basePath()}/messages?requestId=${params.requestId}`,
    );
  }

  async getMessage(messageId: string): Promise<GetSmsMessageResponse> {
    this.ensureServiceId();
    return this.http.request<GetSmsMessageResponse>(
      'GET',
      'sens',
      `${this.basePath()}/messages/${messageId}`,
    );
  }

  async getReserveStatus(reserveId: string): Promise<SmsReserveStatus> {
    this.ensureServiceId();
    return this.http.request<SmsReserveStatus>(
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

  async uploadFile(request: FileUploadRequest): Promise<FileUploadResponse> {
    this.ensureServiceId();
    return this.http.request<FileUploadResponse>(
      'POST',
      'sens',
      `${this.basePath()}/files`,
      request,
    );
  }
}

export type * from './types.js';
