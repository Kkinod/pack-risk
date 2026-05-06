import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { http, HttpResponse, delay } from "msw";
import { setupServer } from "msw/node";
import { fetchLatestVersion } from "./npm";
import { ParseError, TimeoutError, UpstreamError } from "@/lib/http/errors";

const NPM_BASE = "https://registry.npmjs.org";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.useRealTimers();
});
afterAll(() => server.close());

describe("fetchLatestVersion", () => {
  it("returns the latest version for a regular package", async () => {
    server.use(
      http.get(`${NPM_BASE}/lodash/latest`, () =>
        HttpResponse.json({ version: "4.17.21" })
      )
    );

    expect(await fetchLatestVersion("lodash")).toBe("4.17.21");
  });

  it("returns null when package does not exist", async () => {
    server.use(
      http.get(
        `${NPM_BASE}/nonexistent-package/latest`,
        () => new HttpResponse(null, { status: 404 })
      )
    );

    expect(await fetchLatestVersion("nonexistent-package")).toBeNull();
  });

  it("returns the latest version for a scoped package", async () => {
    server.use(
      http.get(`${NPM_BASE}/*`, () => HttpResponse.json({ version: "7.29.0" }))
    );

    expect(await fetchLatestVersion("@babel/core")).toBe("7.29.0");
  });

  it("returns null when a scoped package does not exist", async () => {
    server.use(
      http.get(`${NPM_BASE}/*`, () => new HttpResponse(null, { status: 404 }))
    );

    expect(await fetchLatestVersion("@my-scope/missing")).toBeNull();
  });

  it("returns null when response has no version field", async () => {
    server.use(
      http.get(`${NPM_BASE}/partial-package/latest`, () =>
        HttpResponse.json({ name: "partial-package" })
      )
    );

    expect(await fetchLatestVersion("partial-package")).toBeNull();
  });

  it("throws ParseError when registry returns non-JSON body", async () => {
    server.use(
      http.get(
        `${NPM_BASE}/bad-response/latest`,
        () =>
          new HttpResponse("<html>error</html>", {
            headers: { "Content-Type": "text/html" },
          })
      )
    );

    await expect(fetchLatestVersion("bad-response")).rejects.toBeInstanceOf(
      ParseError
    );
  });

  it("throws UpstreamError after all retries fail with 500", async () => {
    server.use(
      http.get(
        `${NPM_BASE}/broken-package/latest`,
        () => new HttpResponse(null, { status: 500 })
      )
    );

    vi.useFakeTimers();
    const promise = fetchLatestVersion("broken-package");
    const assertion = expect(promise).rejects.toBeInstanceOf(UpstreamError);
    await vi.runAllTimersAsync();
    await assertion;
  });

  it("throws TimeoutError when registry does not respond in time", async () => {
    server.use(
      http.get(`${NPM_BASE}/slow-package/latest`, async () => {
        await delay("infinite");
      })
    );

    vi.useFakeTimers();
    const promise = fetchLatestVersion("slow-package");
    const assertion = expect(promise).rejects.toBeInstanceOf(TimeoutError);
    await vi.advanceTimersByTimeAsync(30000);
    await assertion;
  });
});
