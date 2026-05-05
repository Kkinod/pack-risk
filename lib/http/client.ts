import {
  HttpError,
  NetworkError,
  ParseError,
  TimeoutError,
  UpstreamError,
  isRetryable,
} from "./errors";

interface RetryConfig {
  attempts: number;
  baseDelayMs: number;
}

interface ClientConfig {
  baseUrl: string;
  source: string;
  timeoutMs?: number;
  retry?: RetryConfig;
  defaultHeaders?: Record<string, string>;
}

interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface HttpClient {
  get<T>(path: string, opts?: RequestOptions): Promise<T>;
  post<T>(path: string, body: unknown, opts?: RequestOptions): Promise<T>;
}

const DEFAULT_TIMEOUT = 10_000;
const DEFAULT_RETRY: RetryConfig = { attempts: 2, baseDelayMs: 200 };

function joinUrl(base: string, path: string): string {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function executeRequest<T>(
  config: ClientConfig,
  url: string,
  init: RequestInit,
  externalSignal?: AbortSignal
): Promise<T> {
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener("abort", () => controller.abort());
  }

  let res: Response;
  try {
    res = await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (controller.signal.aborted && !externalSignal?.aborted) {
      throw new TimeoutError(config.source, timeoutMs);
    }
    throw new NetworkError(config.source, err);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    let body: string | undefined;
    try {
      body = await res.text();
    } catch {
      // ignore
    }
    throw new UpstreamError(config.source, res.status, body);
  }

  try {
    return (await res.json()) as T;
  } catch (err) {
    throw new ParseError(config.source, err);
  }
}

async function withRetry<T>(
  config: ClientConfig,
  exec: () => Promise<T>
): Promise<T> {
  const retry = config.retry ?? DEFAULT_RETRY;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retry.attempts; attempt++) {
    try {
      return await exec();
    } catch (err) {
      lastErr = err;
      if (attempt === retry.attempts || !isRetryable(err)) throw err;
      await delay(retry.baseDelayMs * Math.pow(2, attempt));
    }
  }

  throw lastErr instanceof HttpError
    ? lastErr
    : new NetworkError(config.source, lastErr);
}

export function httpClient(config: ClientConfig): HttpClient {
  const baseHeaders = config.defaultHeaders ?? {};

  const request = <T>(
    method: string,
    path: string,
    body: unknown,
    opts?: RequestOptions
  ): Promise<T> => {
    const url = joinUrl(config.baseUrl, path);
    const headers: Record<string, string> = {
      ...baseHeaders,
      ...opts?.headers,
    };
    const init: RequestInit = { method, headers };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
    }
    return withRetry(config, () =>
      executeRequest<T>(config, url, init, opts?.signal)
    );
  };

  return {
    get: (path, opts) => request("GET", path, undefined, opts),
    post: (path, body, opts) => request("POST", path, body, opts),
  };
}
