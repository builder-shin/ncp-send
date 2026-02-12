import { createHmac } from 'crypto';

/**
 * NCP API Gateway HMAC-SHA256 서명 생성
 * @param method - HTTP 메서드 ("GET" | "POST" | "DELETE")
 * @param uriPath - 도메인 제외 URI path (쿼리스트링 포함). 예: "/sms/v2/services/{id}/messages"
 * @param timestamp - UTC 밀리초 문자열
 * @param accessKey - NCP Access Key
 * @param secretKey - NCP Secret Key
 * @returns Base64 인코딩된 HMAC-SHA256 서명
 */
export function makeSignature(
  method: string,
  uriPath: string,
  timestamp: string,
  accessKey: string,
  secretKey: string,
): string {
  const space = ' ';
  const newLine = '\n';

  const message = method + space + uriPath + newLine + timestamp + newLine + accessKey;

  return createHmac('sha256', secretKey)
    .update(message)
    .digest('base64');
}
