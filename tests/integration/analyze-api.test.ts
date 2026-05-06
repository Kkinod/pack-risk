import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { POST } from "@/app/api/analyze/route";

const OSV_BASE = "https://api.osv.dev/v1";
const NPM_BASE = "https://registry.npmjs.org";

const SIMPLE_MANIFEST = JSON.stringify({
  name: "test-app",
  dependencies: { lodash: "4.17.20" },
});

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const server = setupServer(
  http.post(`${OSV_BASE}/querybatch`, () =>
    HttpResponse.json({ results: [{ vulns: [] }] })
  ),
  http.get(`${NPM_BASE}/lodash/latest`, () =>
    HttpResponse.json({ version: "4.17.21" })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.useRealTimers();
});
afterAll(() => server.close());

describe("POST /api/analyze", () => {
  it("returns a valid report for a valid package.json", async () => {
    const res = await POST(makeRequest({ content: SIMPLE_MANIFEST }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.projectName).toBe("test-app");
    expect(data.totalDependencies).toBe(1);
    expect(data.dependencies[0].name).toBe("lodash");
    expect(data.dependencies[0].latestVersion).toBe("4.17.21");
  });

  it("returns 400 for invalid JSON content", async () => {
    const res = await POST(makeRequest({ content: "not json" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid JSON");
  });

  it("returns 400 when no dependencies found in package.json", async () => {
    const content = JSON.stringify({ name: "empty-app" });
    const res = await POST(makeRequest({ content }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("No dependencies found in package.json");
  });

  it("returns 400 when content field is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Missing content");
  });

  it("returns 400 when request body is not valid JSON", async () => {
    const req = new Request("http://localhost/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "bad json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns OSV vulnerability data in the report", async () => {
    server.use(
      http.post(`${OSV_BASE}/querybatch`, () =>
        HttpResponse.json({ results: [{ vulns: [{ id: "GHSA-001" }] }] })
      ),
      http.get(`${OSV_BASE}/vulns/GHSA-001`, () =>
        HttpResponse.json({
          id: "GHSA-001",
          summary: "Test vulnerability",
          database_specific: { severity: "HIGH" },
        })
      )
    );

    const res = await POST(makeRequest({ content: SIMPLE_MANIFEST }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.vulnerableDependencies).toBe(1);
    expect(data.dependencies[0].vulnerabilities[0].id).toBe("GHSA-001");
    expect(data.riskScore).toBeGreaterThan(0);
  });

  it("calculates risk score based on mocked vulnerability data", async () => {
    server.use(
      http.post(`${OSV_BASE}/querybatch`, () =>
        HttpResponse.json({ results: [{ vulns: [{ id: "GHSA-CRIT" }] }] })
      ),
      http.get(`${OSV_BASE}/vulns/GHSA-CRIT`, () =>
        HttpResponse.json({
          id: "GHSA-CRIT",
          database_specific: { severity: "CRITICAL" },
        })
      )
    );

    const res = await POST(makeRequest({ content: SIMPLE_MANIFEST }));
    const data = await res.json();
    expect(data.riskScore).toBe(15);
  });

  it("returns partial results when npm fetch fails after retries", async () => {
    server.use(
      http.get(
        `${NPM_BASE}/lodash/latest`,
        () => new HttpResponse(null, { status: 500 })
      )
    );

    vi.useFakeTimers();
    const promise = POST(makeRequest({ content: SIMPLE_MANIFEST }));
    await vi.runAllTimersAsync();
    vi.useRealTimers();
    const res = await promise;

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.partialResults).toBe(true);
    expect(data.failedNpmCount).toBeGreaterThan(0);
  });

  it("returns 502 when OSV batch query fails after retries", async () => {
    server.use(
      http.post(
        `${OSV_BASE}/querybatch`,
        () => new HttpResponse(null, { status: 500 })
      )
    );

    vi.useFakeTimers();
    const promise = POST(makeRequest({ content: SIMPLE_MANIFEST }));
    await vi.runAllTimersAsync();
    vi.useRealTimers();
    const res = await promise;

    expect(res.status).toBe(502);
  });

  it("returns partial results when some vuln detail fetches fail", async () => {
    server.use(
      http.post(`${OSV_BASE}/querybatch`, () =>
        HttpResponse.json({ results: [{ vulns: [{ id: "GHSA-FAIL" }] }] })
      ),
      http.get(
        `${OSV_BASE}/vulns/GHSA-FAIL`,
        () => new HttpResponse(null, { status: 500 })
      )
    );

    vi.useFakeTimers();
    const promise = POST(makeRequest({ content: SIMPLE_MANIFEST }));
    await vi.runAllTimersAsync();
    vi.useRealTimers();
    const res = await promise;

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.partialResults).toBe(true);
    expect(data.failedVulnCount).toBeGreaterThan(0);
  });

  it("does not use mock data as fallback when analysis succeeds with empty vulns", async () => {
    const res = await POST(makeRequest({ content: SIMPLE_MANIFEST }));
    const data = await res.json();
    expect(data.dependencies[0].vulnerabilities).toHaveLength(0);
    expect(data.riskScore).toBe(0);
    expect(data.vulnerableDependencies).toBe(0);
  });
});
