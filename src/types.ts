export interface NcpConfig {
  /** NCP API Access Key */
  accessKey: string;
  /** NCP API Secret Key */
  secretKey: string;
  /** SENS SMS 서비스 ID (sms 사용 시 필수) */
  smsServiceId?: string;
  /** SENS 알림톡 서비스 ID (alimtalk 사용 시 필수) */
  alimtalkServiceId?: string;
  /** Gov 환경 여부 (default: false) - gov-ntruss.com vs ntruss.com */
  isGov?: boolean;
}

export class NcpError extends Error {
  /** HTTP 상태 코드 */
  statusCode: number;
  /** NCP API 에러 코드 (있는 경우) */
  errorCode?: string;
  /** NCP API 에러 메시지 */
  errorMessage?: string;

  constructor(statusCode: number, errorCode?: string, errorMessage?: string) {
    super(errorMessage || `NCP API Error: ${statusCode}`);
    this.name = 'NcpError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
  }
}
