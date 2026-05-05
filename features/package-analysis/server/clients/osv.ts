import { httpClient } from "@/lib/http/client";

const osv = httpClient({
  baseUrl: "https://api.osv.dev/v1",
  source: "osv",
  timeoutMs: 8000,
  retry: { attempts: 2, baseDelayMs: 300 },
});

interface OsvVulnSummary {
  id: string;
}

export interface OsvEvent {
  introduced?: string;
  fixed?: string;
  last_affected?: string;
}

export interface OsvRange {
  type: string;
  events: OsvEvent[];
}

export interface OsvAffected {
  package: { ecosystem: string; name: string };
  ranges?: OsvRange[];
}

export interface OsvSeverity {
  type: string;
  score: string;
}

export interface OsvVuln {
  id: string;
  summary?: string;
  published?: string;
  severity?: OsvSeverity[];
  affected?: OsvAffected[];
  database_specific?: {
    severity?: string;
    cvss?: { score?: number; vectorString?: string };
    [key: string]: unknown;
  };
}

interface BatchQueryResponse {
  results: Array<{ vulns?: OsvVulnSummary[] }>;
}

export async function batchQueryOSV(
  deps: Array<{ name: string; version: string }>
): Promise<string[][]> {
  const queries = deps.map((d) => ({
    version: d.version,
    package: { name: d.name, ecosystem: "npm" },
  }));

  const data = await osv.post<BatchQueryResponse>("/querybatch", { queries });
  return data.results.map((r) => (r.vulns ?? []).map((v) => v.id));
}

export function fetchVulnDetails(id: string): Promise<OsvVuln> {
  return osv.get<OsvVuln>(`/vulns/${encodeURIComponent(id)}`);
}
