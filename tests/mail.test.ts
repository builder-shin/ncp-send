import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NcpHttpClient } from '../src/http.js';
import { MailClient } from '../src/mail/index.js';

describe('MailClient', () => {
  const config = {
    accessKey: 'testAccessKey',
    secretKey: 'testSecretKey',
    isGov: true,
  };

  let httpClient: NcpHttpClient;
  let mailClient: MailClient;

  beforeEach(() => {
    httpClient = new NcpHttpClient(config);
    mailClient = new MailClient(httpClient);
    vi.restoreAllMocks();
  });

  it('should call correct URL for send', async () => {
    const mockResponse = { requestId: 'req-123', count: 1 };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await mailClient.send({
      senderAddress: 'sender@example.com',
      title: 'Test Email',
      body: '<h1>Hello</h1>',
      recipients: [{ address: 'user@example.com', type: 'R' }],
    });

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/mails'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('should use mail domain, not sens domain', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ requestId: 'req-123', count: 1 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await mailClient.send({
      senderAddress: 'sender@example.com',
      title: 'Test',
      body: 'body',
      recipients: [{ address: 'user@example.com', type: 'R' }],
    });

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain('mail.apigw.gov-ntruss.com');
    expect(calledUrl).not.toContain('sens.apigw');
  });

  it('should send correct request body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ requestId: 'req-123', count: 1 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const request = {
      senderAddress: 'sender@example.com',
      senderName: 'Sender',
      title: 'Test Email',
      body: '<h1>Hello</h1>',
      recipients: [
        { address: 'user1@example.com', type: 'R' as const },
        { address: 'user2@example.com', type: 'C' as const, name: 'CC User' },
      ],
    };

    await mailClient.send(request);

    const callArgs = fetchMock.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.senderAddress).toBe('sender@example.com');
    expect(body.senderName).toBe('Sender');
    expect(body.title).toBe('Test Email');
    expect(body.recipients).toHaveLength(2);
  });

  it('should not require serviceId (no ensureServiceId)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ requestId: 'req-123', count: 1 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    // MailClient doesn't take serviceId, so it should work without one
    const freshClient = new MailClient(httpClient);
    await expect(freshClient.send({
      senderAddress: 'sender@example.com',
      title: 'Test',
      body: 'body',
      recipients: [{ address: 'user@example.com', type: 'R' }],
    })).resolves.toBeDefined();
  });
});
