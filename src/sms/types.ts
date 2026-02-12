export interface SendSmsRequest {
  type: 'SMS' | 'LMS' | 'MMS';
  contentType?: 'COMM' | 'AD';
  countryCode?: string;
  from: string;
  subject?: string;
  content: string;
  messages: SmsMessage[];
  files?: { fileId: string }[];
  reserveTime?: string;
  reserveTimeZone?: string;
}

export interface SmsMessage {
  to: string;
  subject?: string;
  content?: string;
}

export interface SendSmsResponse {
  requestId: string;
  requestTime: string;
  statusCode: string;
  statusName: string;
}

export interface FileUploadRequest {
  fileName: string;
  fileBody: string;
}

export interface FileUploadResponse {
  fileId: string;
  createTime: string;
  expireTime: string;
}

export interface GetSmsRequestParams {
  requestId: string;
}

export interface GetSmsMessagesResponse {
  statusCode: string;
  statusName: string;
  messages: SmsMessageResult[];
}

export interface SmsMessageResult {
  requestId: string;
  messageId: string;
  serviceId: string;
  type: 'SMS' | 'LMS' | 'MMS';
  contentType: 'COMM' | 'AD';
  countryCode: string;
  from: string;
  to: string;
  subject?: string;
  content: string;
  status: string;
  statusCode: string;
  statusName: string;
  statusMessage: string;
  completeTime?: string;
  telcoCode?: string;
  requestTime: string;
}

export type GetSmsMessageResponse = SmsMessageResult;

export interface SmsReserveStatus {
  reserveId: string;
  reserveTime: string;
  reserveTimeZone: string;
  reserveStatus: string;
}
