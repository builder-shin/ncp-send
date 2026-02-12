import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NcpHttpClient } from '../src/http.js';
import { AlimtalkClient } from '../src/alimtalk/index.js';

describe('AlimtalkClient', () => {
  const config = {
    accessKey: 'testAccessKey',
    secretKey: 'testSecretKey',
    isGov: true,
  };
  const serviceId = 'ncp:alimtalk:kr:123456:test';

  let httpClient: NcpHttpClient;
  let alimtalkClient: AlimtalkClient;

  beforeEach(() => {
    httpClient = new NcpHttpClient(config);
    alimtalkClient = new AlimtalkClient(httpClient, serviceId);
    vi.restoreAllMocks();
  });

  it('should call correct URL for send', async () => {
    const mockResponse = {
      requestId: 'req-123',
      requestTime: '2024-01-01',
      statusCode: '202',
      statusName: 'success',
      messages: [],
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await alimtalkClient.send({
      plusFriendId: '@mychannel',
      templateCode: 'TEMPLATE001',
      messages: [{ to: '01098765432', content: '테스트 메시지' }],
    });

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/alimtalk/v2/services/${serviceId}/messages`),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('should call correct URL for getChannels', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });
    vi.stubGlobal('fetch', fetchMock);

    await alimtalkClient.getChannels();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/alimtalk/v2/services/${serviceId}/channels`),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('should call correct URL for getTemplates', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });
    vi.stubGlobal('fetch', fetchMock);

    await alimtalkClient.getTemplates({ channelId: 'ch-123' });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/alimtalk/v2/services/${serviceId}/templates?channelId=ch-123`),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('should include templateCode in getTemplates URL when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });
    vi.stubGlobal('fetch', fetchMock);

    await alimtalkClient.getTemplates({ channelId: 'ch-123', templateCode: 'TPL001' });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('templateCode=TPL001'),
      expect.any(Object),
    );
  });

  it('should call correct URL for cancelReserve', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    });
    vi.stubGlobal('fetch', fetchMock);

    await alimtalkClient.cancelReserve('res-123');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/alimtalk/v2/services/${serviceId}/reservations/res-123`),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('should throw error when serviceId is empty', async () => {
    const emptyClient = new AlimtalkClient(httpClient, '');
    await expect(emptyClient.send({
      plusFriendId: '@test',
      templateCode: 'TEST001',
      messages: [{ to: '01098765432', content: 'test' }],
    })).rejects.toThrow('alimtalkServiceId is required');
  });
});
