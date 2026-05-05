interface ApiFetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  opts: ApiFetchOptions = {}
): Promise<T> {
  const { method = "GET", body, signal, headers = {} } = opts;

  const init: RequestInit = {
    method,
    headers: { ...headers },
    signal,
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
    (init.headers as Record<string, string>)["Content-Type"] =
      (init.headers as Record<string, string>)["Content-Type"] ??
      "application/json";
  }

  const res = await fetch(path, init);

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = undefined;
  }

  if (!res.ok) {
    const message =
      (data as { error?: string })?.error ?? `Request failed: ${res.status}`;
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}
