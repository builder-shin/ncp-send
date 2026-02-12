import { NcpConfig, NcpError } from './types.js';
import { BASE_URLS } from './constants.js';
import { makeSignature } from './auth.js';

type Domain = 'sens' | 'mail';

export class NcpHttpClient {
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly baseUrls: { sens: string; mail: string };

  constructor(config: NcpConfig) {
    this.accessKey = config.accessKey;
    this.secretKey = config.secretKey;
    const env = config.isGov === true ? 'gov' : 'standard';
    this.baseUrls = BASE_URLS[env];
  }

  async request<T>(
    method: string,
    domain: Domain,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const timestamp = Date.now().toString();
    const signature = makeSignature(method, path, timestamp, this.accessKey, this.secretKey);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-ncp-apigw-timestamp': timestamp,
      'x-ncp-iam-access-key': this.accessKey,
      'x-ncp-apigw-signature-v2': signature,
    };

    const url = this.baseUrls[domain] + path;

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    if (response.ok) {
      return response.json() as Promise<T>;
    }

    // Error handling
    const rawText = await response.text();
    let errorCode: string | undefined;
    let errorMessage: string | undefined;

    try {
      const errorBody = JSON.parse(rawText);
      // SENS error format: { "status": 403, "error": "Forbidden", "message": "..." }
      // Mail error format: { "errorCode": "77102", "message": "..." }
      errorCode = errorBody.errorCode ?? errorBody.error;
      errorMessage = errorBody.message;
    } catch {
      // Non-JSON error (HTML gateway error etc.)
      errorMessage = rawText;
    }

    throw new NcpError(response.status, errorCode, errorMessage);
  }
}
