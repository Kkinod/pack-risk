export class HttpError extends Error {
  constructor(
    message: string,
    public readonly source: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export class TimeoutError extends HttpError {
  constructor(
    source: string,
    public readonly timeoutMs: number
  ) {
    super(`Request timed out after ${timeoutMs}ms`, source);
    this.name = "TimeoutError";
  }
}

export class NetworkError extends HttpError {
  constructor(
    source: string,
    public readonly cause: unknown
  ) {
    super(
      `Network error: ${cause instanceof Error ? cause.message : String(cause)}`,
      source
    );
    this.name = "NetworkError";
  }
}

export class UpstreamError extends HttpError {
  constructor(
    source: string,
    public readonly status: number,
    public readonly responseBody?: string
  ) {
    super(`Upstream returned ${status}`, source);
    this.name = "UpstreamError";
  }
}

export class ParseError extends HttpError {
  constructor(
    source: string,
    public readonly cause: unknown
  ) {
    super(
      `Failed to parse response: ${cause instanceof Error ? cause.message : String(cause)}`,
      source
    );
    this.name = "ParseError";
  }
}

export function isRetryable(err: unknown): boolean {
  if (err instanceof TimeoutError) return true;
  if (err instanceof NetworkError) return true;
  if (err instanceof UpstreamError) {
    return err.status >= 500 || err.status === 429;
  }
  return false;
}
