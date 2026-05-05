import type { DepType } from "../types";

interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

export interface ExtractedDep {
  name: string;
  version: string;
  type: DepType;
}

function stripRangeOperator(rawVersion: string): string {
  const cleaned = rawVersion.replace(/^[\^~>=<\s*]+/, "").split(/\s/)[0];
  return /^\d/.test(cleaned) ? cleaned : rawVersion;
}

export function parseManifest(content: string): {
  name: string;
  deps: ExtractedDep[];
} {
  let manifest: PackageJson;
  try {
    manifest = JSON.parse(content);
  } catch {
    throw new Error("Invalid JSON");
  }

  if (
    typeof manifest !== "object" ||
    manifest === null ||
    Array.isArray(manifest)
  ) {
    throw new Error("Invalid package.json: root must be an object");
  }

  const deps: ExtractedDep[] = [];

  const add = (record: Record<string, string> | undefined, type: DepType) => {
    if (!record || typeof record !== "object") return;
    for (const [name, rawVersion] of Object.entries(record)) {
      if (typeof rawVersion !== "string") continue;
      deps.push({ name, version: stripRangeOperator(rawVersion), type });
    }
  };

  add(manifest.dependencies, "prod");
  add(manifest.devDependencies, "dev");
  add(manifest.peerDependencies, "peer");
  add(manifest.optionalDependencies, "optional");

  if (deps.length === 0) {
    throw new Error("No dependencies found in package.json");
  }

  return { name: manifest.name ?? "unknown", deps };
}
