import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NcpHttpClient } from '../src/http.js';
import { SmsClient } from '../src/sms/index.js';

describe('SmsClient', () => {
  const config = {
    accessKey: 'testAccessKey',
    secretKey: 'testSecretKey',
    isGov: true,
  };
  const serviceId = 'ncp:sms:kr:123456:test';

  let httpClient: NcpHttpClient;
  let smsClient: SmsClient;

  beforeEach(() => {
    httpClient = new NcpHttpClient(config);
    smsClient = new SmsClient(httpClient, serviceId);
    vi.restoreAllMocks();
  });

  it('should call correct URL for send', async () => {
    const mockResponse = {
      requestId: 'req-123',
      requestTime: '2024-01-01 00:00:00',
      statusCode: '202',
      statusName: 'success',
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await smsClient.send({
      type: 'SMS',
      from: '01012345678',
      content: 'Hello',
      messages: [{ to: '01098765432' }],
    });

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/sms/v2/services/${serviceId}/messages`),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('should call correct URL for getRequest', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ statusCode: '200', statusName: 'success', messages: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await smsClient.getRequest({ requestId: 'req-123' });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/sms/v2/services/${serviceId}/messages?requestId=req-123`),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('should call correct URL for getMessage', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ messageId: 'msg-123' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await smsClient.getMessage('msg-123');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/sms/v2/services/${serviceId}/messages/msg-123`),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('should call correct URL for cancelReserve', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    });
    vi.stubGlobal('fetch', fetchMock);

    await smsClient.cancelReserve('res-123');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/sms/v2/services/${serviceId}/reservations/res-123`),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('should call correct URL for uploadFile', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ fileId: 'file-123', createTime: '', expireTime: '' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await smsClient.uploadFile({ fileName: 'test.jpg', fileBody: 'base64data' });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/sms/v2/services/${serviceId}/files`),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('should throw error when serviceId is empty', async () => {
    const emptyClient = new SmsClient(httpClient, '');
    await expect(emptyClient.send({
      type: 'SMS',
      from: '01012345678',
      content: 'Hello',
      messages: [{ to: '01098765432' }],
    })).rejects.toThrow('smsServiceId is required');
  });
});
