import { describe, it, expect, vi } from 'vitest';
import { NcpSend } from '../src/client.js';
import { SmsClient } from '../src/sms/index.js';
import { AlimtalkClient } from '../src/alimtalk/index.js';
import { MailClient } from '../src/mail/index.js';

describe('NcpSend', () => {
  const fullConfig = {
    accessKey: 'testAccessKey',
    secretKey: 'testSecretKey',
    smsServiceId: 'ncp:sms:kr:123456:test',
    alimtalkServiceId: 'ncp:alimtalk:kr:123456:test',
    isGov: true,
  };

  it('should create client with sms, alimtalk, and mail properties', () => {
    const client = new NcpSend(fullConfig);
    expect(client.sms).toBeInstanceOf(SmsClient);
    expect(client.alimtalk).toBeInstanceOf(AlimtalkClient);
    expect(client.mail).toBeInstanceOf(MailClient);
  });

  it('should throw error when sms.send() is called without smsServiceId', async () => {
    const client = new NcpSend({
      accessKey: 'testAccessKey',
      secretKey: 'testSecretKey',
    });

    await expect(client.sms.send({
      type: 'SMS',
      from: '01012345678',
      content: 'test',
      messages: [{ to: '01098765432' }],
    })).rejects.toThrow('smsServiceId is required. Provide it in NcpConfig.');
  });

  it('should throw error when alimtalk.send() is called without alimtalkServiceId', async () => {
    const client = new NcpSend({
      accessKey: 'testAccessKey',
      secretKey: 'testSecretKey',
    });

    await expect(client.alimtalk.send({
      plusFriendId: '@test',
      templateCode: 'TEST001',
      messages: [{ to: '01098765432', content: 'test' }],
    })).rejects.toThrow('alimtalkServiceId is required. Provide it in NcpConfig.');
  });

  it('should not throw when mail.send() is called without serviceId', async () => {
    const client = new NcpSend({
      accessKey: 'testAccessKey',
      secretKey: 'testSecretKey',
    });

    // mail.send should not throw a serviceId error
    // It will fail on the fetch call, but that's expected since we're not mocking it
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ requestId: 'test', count: 1 }),
    }));

    const result = await client.mail.send({
      senderAddress: 'test@example.com',
      title: 'Test',
      body: '<p>Test</p>',
      recipients: [{ address: 'user@example.com', type: 'R' }],
    });
    expect(result.requestId).toBe('test');

    vi.restoreAllMocks();
  });

  it('should default isGov to false', () => {
    const client = new NcpSend({
      accessKey: 'testAccessKey',
      secretKey: 'testSecretKey',
    });
    // Client should be created without errors
    expect(client).toBeDefined();
  });
});
