export { NcpSend } from './client.js';
export { NcpConfig, NcpError } from './types.js';
export { SmsClient } from './sms/index.js';
export { AlimtalkClient } from './alimtalk/index.js';
export { MailClient } from './mail/index.js';

// SMS types
export type {
  SendSmsRequest,
  SmsMessage,
  SendSmsResponse,
  FileUploadRequest,
  FileUploadResponse,
  GetSmsRequestParams,
  GetSmsMessagesResponse,
  SmsMessageResult,
  GetSmsMessageResponse,
  SmsReserveStatus,
} from './sms/types.js';

// Alimtalk types
export type {
  AlimtalkButtonType,
  AlimtalkButton,
  SendAlimtalkRequest,
  AlimtalkMessage,
  SendAlimtalkResponse,
  AlimtalkChannel,
  GetAlimtalkTemplatesParams,
  AlimtalkTemplate,
  GetAlimtalkRequestParams,
  GetAlimtalkMessagesResponse,
  AlimtalkMessageResult,
  GetAlimtalkMessageResponse,
  AlimtalkReserveStatus,
} from './alimtalk/types.js';

// Mail types
export type {
  SendMailRequest,
  MailRecipient,
  SendMailResponse,
} from './mail/types.js';
