import { httpClient } from "@/lib/http/client";
import { UpstreamError } from "@/lib/http/errors";

const npm = httpClient({
  baseUrl: "https://registry.npmjs.org",
  source: "npm",
  timeoutMs: 8000,
  retry: { attempts: 2, baseDelayMs: 300 },
});

interface NpmPackageVersion {
  version?: string;
}

function encodePackageName(name: string): string {
  if (name.startsWith("@")) {
    const slash = name.indexOf("/");
    if (slash > 0) {
      const scope = name.slice(0, slash);
      const pkg = name.slice(slash + 1);
      return `${encodeURIComponent(scope)}/${encodeURIComponent(pkg)}`;
    }
  }
  return encodeURIComponent(name);
}

export async function fetchLatestVersion(
  packageName: string
): Promise<string | null> {
  try {
    const data = await npm.get<NpmPackageVersion>(
      `/${encodePackageName(packageName)}/latest`
    );
    return data.version ?? null;
  } catch (err) {
    if (err instanceof UpstreamError && err.status === 404) {
      return null;
    }
    throw err;
  }
}
