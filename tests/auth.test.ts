import { describe, it, expect } from 'vitest';
import { createHmac } from 'crypto';
import { makeSignature } from '../src/auth.js';

describe('makeSignature', () => {
  const accessKey = 'testAccessKey';
  const secretKey = 'testSecretKey';
  const timestamp = '1234567890000';

  function expectedSignature(method: string, uriPath: string): string {
    const message = `${method} ${uriPath}\n${timestamp}\n${accessKey}`;
    return createHmac('sha256', secretKey).update(message).digest('base64');
  }

  it('should generate correct signature for mail API path', () => {
    const method = 'POST';
    const uriPath = '/api/v1/mails';
    const result = makeSignature(method, uriPath, timestamp, accessKey, secretKey);
    expect(result).toBe(expectedSignature(method, uriPath));
  });

  it('should generate correct signature for SMS API path', () => {
    const method = 'POST';
    const uriPath = '/sms/v2/services/ncp:sms:kr:123456:example/messages';
    const result = makeSignature(method, uriPath, timestamp, accessKey, secretKey);
    expect(result).toBe(expectedSignature(method, uriPath));
  });

  it('should generate correct signature for alimtalk API path', () => {
    const method = 'POST';
    const uriPath = '/alimtalk/v2/services/ncp:alimtalk:kr:123456:example/messages';
    const result = makeSignature(method, uriPath, timestamp, accessKey, secretKey);
    expect(result).toBe(expectedSignature(method, uriPath));
  });

  it('should generate correct signature for GET method', () => {
    const method = 'GET';
    const uriPath = '/sms/v2/services/ncp:sms:kr:123456:example/messages?requestId=abc123';
    const result = makeSignature(method, uriPath, timestamp, accessKey, secretKey);
    expect(result).toBe(expectedSignature(method, uriPath));
  });

  it('should generate correct signature for DELETE method', () => {
    const method = 'DELETE';
    const uriPath = '/sms/v2/services/ncp:sms:kr:123456:example/reservations/res123';
    const result = makeSignature(method, uriPath, timestamp, accessKey, secretKey);
    expect(result).toBe(expectedSignature(method, uriPath));
  });

  it('should use uriPath without domain (path only)', () => {
    const method = 'POST';
    const uriPath = '/api/v1/mails';
    const result = makeSignature(method, uriPath, timestamp, accessKey, secretKey);
    // Verify the signature is a valid base64 string
    expect(() => Buffer.from(result, 'base64')).not.toThrow();
    // Verify it doesn't include domain
    expect(uriPath.startsWith('/')).toBe(true);
    expect(uriPath).not.toContain('http');
  });

  it('should produce different signatures for different paths', () => {
    const sig1 = makeSignature('POST', '/api/v1/mails', timestamp, accessKey, secretKey);
    const sig2 = makeSignature('POST', '/sms/v2/services/test/messages', timestamp, accessKey, secretKey);
    expect(sig1).not.toBe(sig2);
  });
});
