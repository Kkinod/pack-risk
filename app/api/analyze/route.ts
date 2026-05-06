import { NextResponse } from "next/server";
import { parseManifest } from "@/features/package-analysis/server/parseManifest";
import {
  batchQueryOSV,
  fetchVulnDetails,
} from "@/features/package-analysis/server/clients/osv";
import type { OsvVuln } from "@/features/package-analysis/server/clients/osv";
import { fetchLatestVersion } from "@/features/package-analysis/server/clients/npm";
import { buildReport } from "@/features/package-analysis/server/buildReport";
import { pool } from "@/lib/concurrency";
import { HttpError } from "@/lib/http/errors";

const MAX_CONTENT_BYTES = 1_000_000;
const VULN_FETCH_CONCURRENCY = 8;
const NPM_FETCH_CONCURRENCY = 8;

export async function POST(request: Request) {
  let body: { fileName?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { fileName = "package.json", content } = body;

  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  if (content.length > MAX_CONTENT_BYTES) {
    return NextResponse.json(
      { error: `Content exceeds ${MAX_CONTENT_BYTES} bytes` },
      { status: 413 }
    );
  }

  let manifest: ReturnType<typeof parseManifest>;
  try {
    manifest = parseManifest(content);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }

  const uniqueNames = [...new Set(manifest.deps.map((d) => d.name))];
  const npmLatestVersions = new Map<string, string>();
  const failedNpmFetches: string[] = [];

  const npmPromise = pool(uniqueNames, NPM_FETCH_CONCURRENCY, async (name) => {
    try {
      const version = await fetchLatestVersion(name);
      if (version) npmLatestVersions.set(name, version);
    } catch (err) {
      failedNpmFetches.push(name);
      console.error(`[npm] fetchLatestVersion failed for ${name}:`, err);
    }
  });

  let vulnsBatch: string[][];
  try {
    vulnsBatch = await batchQueryOSV(manifest.deps);
  } catch (err) {
    await npmPromise;
    return NextResponse.json(
      {
        error: "Vulnerability query failed",
        source: err instanceof HttpError ? err.source : undefined,
      },
      { status: 502 }
    );
  }

  const uniqueIds = [...new Set(vulnsBatch.flat())];
  const vulnDetails = new Map<string, OsvVuln>();
  const failedIds: string[] = [];

  await pool(uniqueIds, VULN_FETCH_CONCURRENCY, async (id) => {
    try {
      vulnDetails.set(id, await fetchVulnDetails(id));
    } catch (err) {
      failedIds.push(id);
      console.error(`[osv] fetchVulnDetails failed for ${id}:`, err);
    }
  });

  await npmPromise;

  const report = buildReport({
    fileName,
    projectName: manifest.name,
    extractedDeps: manifest.deps,
    vulnsBatch,
    vulnDetails,
    npmLatestVersions,
  });

  const partialResults = failedIds.length > 0 || failedNpmFetches.length > 0;

  return NextResponse.json({
    ...report,
    partialResults,
    failedVulnCount: failedIds.length,
    failedNpmCount: failedNpmFetches.length,
  });
}
