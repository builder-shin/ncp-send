import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NcpHttpClient } from '../src/http.js';
import { NcpError } from '../src/types.js';

describe('NcpHttpClient', () => {
  const config = {
    accessKey: 'testAccessKey',
    secretKey: 'testSecretKey',
    isGov: true,
  };

  let client: NcpHttpClient;

  beforeEach(() => {
    client = new NcpHttpClient(config);
    vi.restoreAllMocks();
  });

  it('should return parsed JSON for 2xx responses', async () => {
    const mockData = { requestId: 'test-123', count: 1 };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    }));

    const result = await client.request('POST', 'mail', '/api/v1/mails', { test: true });
    expect(result).toEqual(mockData);
  });

  it('should return undefined for 204 responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    }));

    const result = await client.request('DELETE', 'sens', '/sms/v2/services/test/reservations/res1');
    expect(result).toBeUndefined();
  });

  it('should throw NcpError for 4xx JSON error responses (SENS format)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: () => Promise.resolve(JSON.stringify({
        status: 403,
        error: 'Forbidden',
        message: 'Authentication failed',
      })),
    }));

    await expect(client.request('POST', 'sens', '/sms/v2/services/test/messages'))
      .rejects
      .toThrow(NcpError);

    try {
      await client.request('POST', 'sens', '/sms/v2/services/test/messages');
    } catch (e) {
      const err = e as NcpError;
      expect(err.statusCode).toBe(403);
      expect(err.errorCode).toBe('Forbidden');
      expect(err.errorMessage).toBe('Authentication failed');
    }
  });

  it('should throw NcpError for 4xx JSON error responses (Mail format)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve(JSON.stringify({
        errorCode: '77102',
        message: 'Invalid parameter',
      })),
    }));

    try {
      await client.request('POST', 'mail', '/api/v1/mails');
    } catch (e) {
      const err = e as NcpError;
      expect(err).toBeInstanceOf(NcpError);
      expect(err.statusCode).toBe(400);
      expect(err.errorCode).toBe('77102');
      expect(err.errorMessage).toBe('Invalid parameter');
    }
  });

  it('should throw NcpError for 5xx JSON error responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve(JSON.stringify({
        status: 500,
        error: 'Internal Server Error',
        message: 'Something went wrong',
      })),
    }));

    await expect(client.request('POST', 'sens', '/sms/v2/services/test/messages'))
      .rejects
      .toThrow(NcpError);
  });

  it('should throw NcpError with rawText for non-JSON error responses', async () => {
    const htmlError = '<html><body>502 Bad Gateway</body></html>';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      text: () => Promise.resolve(htmlError),
    }));

    try {
      await client.request('POST', 'sens', '/sms/v2/services/test/messages');
    } catch (e) {
      const err = e as NcpError;
      expect(err).toBeInstanceOf(NcpError);
      expect(err.statusCode).toBe(502);
      expect(err.errorCode).toBeUndefined();
      expect(err.errorMessage).toBe(htmlError);
    }
  });

  it('should use gov base URL when isGov is true', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    await client.request('POST', 'sens', '/sms/v2/services/test/messages');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('sens.apigw.gov-ntruss.com'),
      expect.any(Object),
    );
  });

  it('should use standard base URL when isGov is false', async () => {
    const standardClient = new NcpHttpClient({ ...config, isGov: false });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    await standardClient.request('POST', 'sens', '/sms/v2/services/test/messages');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('sens.apigw.ntruss.com'),
      expect.any(Object),
    );
  });

  it('should use standard base URL by default when isGov is not set', async () => {
    const defaultClient = new NcpHttpClient({ accessKey: 'testAccessKey', secretKey: 'testSecretKey' });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    await defaultClient.request('POST', 'sens', '/sms/v2/services/test/messages');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('sens.apigw.ntruss.com'),
      expect.any(Object),
    );
  });

  it('should include correct headers in request', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    await client.request('POST', 'mail', '/api/v1/mails', { test: true });

    const callArgs = fetchMock.mock.calls[0];
    const headers = callArgs[1].headers;
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['x-ncp-iam-access-key']).toBe('testAccessKey');
    expect(headers['x-ncp-apigw-timestamp']).toBeDefined();
    expect(headers['x-ncp-apigw-signature-v2']).toBeDefined();
  });
});
