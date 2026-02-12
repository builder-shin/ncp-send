export interface MailRecipient {
  address: string;
  name?: string;
  type: 'R' | 'C' | 'B';
  parameters?: Record<string, string>;
}

export interface SendMailRequest {
  senderAddress: string;
  senderName?: string;
  templateSid?: number;
  title: string;
  body: string;
  individual?: boolean;
  confirmAndSend?: boolean;
  advertising?: boolean;
  parameters?: Record<string, string>;
  referencesHeader?: string;
  reservationUtc?: number;
  reservationDateTime?: string;
  attachFileIds?: string[];
  recipients: MailRecipient[];
  useBasicUnsubscribeMsg?: boolean;
  unsubscribeMessage?: string;
}

export interface SendMailResponse {
  requestId: string;
  count: number;
}
