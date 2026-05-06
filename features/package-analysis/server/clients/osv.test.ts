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
import { batchQueryOSV, fetchVulnDetails } from "./osv";
import { ParseError, TimeoutError, UpstreamError } from "@/lib/http/errors";

const OSV_BASE = "https://api.osv.dev/v1";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.useRealTimers();
});
afterAll(() => server.close());

describe("batchQueryOSV", () => {
  it("returns vuln ids grouped by queried package", async () => {
    server.use(
      http.post(`${OSV_BASE}/querybatch`, () =>
        HttpResponse.json({
          results: [
            { vulns: [{ id: "GHSA-001" }, { id: "GHSA-002" }] },
            { vulns: [] },
          ],
        })
      )
    );

    const result = await batchQueryOSV([
      { name: "lodash", version: "4.17.20" },
      { name: "express", version: "4.18.0" },
    ]);
    expect(result).toEqual([["GHSA-001", "GHSA-002"], []]);
  });

  it("returns empty arrays when no vulnerabilities found", async () => {
    server.use(
      http.post(`${OSV_BASE}/querybatch`, () =>
        HttpResponse.json({ results: [{ vulns: [] }, {}] })
      )
    );

    const result = await batchQueryOSV([
      { name: "safe-pkg", version: "1.0.0" },
      { name: "another-pkg", version: "2.0.0" },
    ]);
    expect(result).toEqual([[], []]);
  });

  it("throws UpstreamError after retries on 500 response", async () => {
    server.use(
      http.post(
        `${OSV_BASE}/querybatch`,
        () => new HttpResponse(null, { status: 500 })
      )
    );

    vi.useFakeTimers();
    const promise = batchQueryOSV([{ name: "pkg", version: "1.0.0" }]);
    const assertion = expect(promise).rejects.toBeInstanceOf(UpstreamError);
    await vi.runAllTimersAsync();
    await assertion;
  });

  it("throws ParseError on malformed response body", async () => {
    server.use(
      http.post(
        `${OSV_BASE}/querybatch`,
        () =>
          new HttpResponse("<html>bad</html>", {
            headers: { "Content-Type": "text/html" },
          })
      )
    );

    await expect(
      batchQueryOSV([{ name: "pkg", version: "1.0.0" }])
    ).rejects.toBeInstanceOf(ParseError);
  });

  it("throws TimeoutError when OSV does not respond in time", async () => {
    server.use(
      http.post(`${OSV_BASE}/querybatch`, async () => {
        await delay("infinite");
      })
    );

    vi.useFakeTimers();
    const promise = batchQueryOSV([{ name: "pkg", version: "1.0.0" }]);
    const assertion = expect(promise).rejects.toBeInstanceOf(TimeoutError);
    await vi.advanceTimersByTimeAsync(30000);
    await assertion;
  });
});

describe("fetchVulnDetails", () => {
  it("returns full vulnerability details for a known id", async () => {
    server.use(
      http.get(`${OSV_BASE}/vulns/GHSA-001`, () =>
        HttpResponse.json({
          id: "GHSA-001",
          summary: "Test vulnerability",
          published: "2024-01-01T00:00:00Z",
          database_specific: { severity: "HIGH" },
        })
      )
    );

    const vuln = await fetchVulnDetails("GHSA-001");
    expect(vuln.id).toBe("GHSA-001");
    expect(vuln.summary).toBe("Test vulnerability");
    expect(vuln.database_specific?.severity).toBe("HIGH");
  });

  it("throws UpstreamError when vuln id returns 404", async () => {
    server.use(
      http.get(
        `${OSV_BASE}/vulns/NONEXISTENT`,
        () => new HttpResponse(null, { status: 404 })
      )
    );

    await expect(fetchVulnDetails("NONEXISTENT")).rejects.toBeInstanceOf(
      UpstreamError
    );
  });

  it("throws UpstreamError after retries on 500 response", async () => {
    server.use(
      http.get(
        `${OSV_BASE}/vulns/BROKEN-001`,
        () => new HttpResponse(null, { status: 500 })
      )
    );

    vi.useFakeTimers();
    const promise = fetchVulnDetails("BROKEN-001");
    const assertion = expect(promise).rejects.toBeInstanceOf(UpstreamError);
    await vi.runAllTimersAsync();
    await assertion;
  });

  it("throws TimeoutError when detail fetch does not respond in time", async () => {
    server.use(
      http.get(`${OSV_BASE}/vulns/SLOW-001`, async () => {
        await delay("infinite");
      })
    );

    vi.useFakeTimers();
    const promise = fetchVulnDetails("SLOW-001");
    const assertion = expect(promise).rejects.toBeInstanceOf(TimeoutError);
    await vi.advanceTimersByTimeAsync(30000);
    await assertion;
  });

  it("throws ParseError on malformed vuln detail response", async () => {
    server.use(
      http.get(
        `${OSV_BASE}/vulns/BAD-BODY`,
        () =>
          new HttpResponse("<html>error</html>", {
            headers: { "Content-Type": "text/html" },
          })
      )
    );

    await expect(fetchVulnDetails("BAD-BODY")).rejects.toBeInstanceOf(
      ParseError
    );
  });
});
