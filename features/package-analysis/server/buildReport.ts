import type {
  AnalysisReport,
  CVE,
  Dependency,
  RiskLevel,
  Severity,
} from "../types";
import type { ExtractedDep } from "./parseManifest";
import type { OsvVuln } from "./clients/osv";
import { t } from "@/locales";

function classifySeverity(vuln: OsvVuln): Severity {
  const dbSev = vuln.database_specific?.severity;
  if (typeof dbSev === "string") {
    switch (dbSev.toUpperCase()) {
      case "CRITICAL":
        return "critical";
      case "HIGH":
        return "high";
      case "MODERATE":
      case "MEDIUM":
        return "medium";
      case "LOW":
        return "low";
    }
  }

  const cvssEntry = vuln.severity?.find((s) => s.type.startsWith("CVSS_V3"));
  if (cvssEntry) return classifyFromCvssVector(cvssEntry.score);

  return "medium";
}

function classifyFromCvssVector(vector: string): Severity {
  const get = (metric: string) =>
    vector.match(new RegExp(`/${metric}:([A-Z])`))?.at(1) ?? "N";

  const highCount = ["C", "I", "A"].filter((m) => get(m) === "H").length;
  if (highCount === 3) return "critical";
  if (highCount >= 2) return "high";
  if (highCount >= 1) return "medium";
  return "low";
}

function extractCvssScore(vuln: OsvVuln): number | undefined {
  const score = vuln.database_specific?.cvss?.score;
  if (typeof score === "number") return score;
  return undefined;
}

function extractFixedIn(
  vuln: OsvVuln,
  packageName: string
): string | undefined {
  const affected = vuln.affected?.find((a) => a.package.name === packageName);
  for (const range of affected?.ranges ?? []) {
    if (range.type === "SEMVER") {
      for (const event of range.events) {
        if (event.fixed) return event.fixed;
      }
    }
  }
  return undefined;
}

function calcRiskLevel(vulns: CVE[]): RiskLevel {
  if (vulns.length === 0) return "safe";
  const sevs = vulns.map((v) => v.severity);
  if (sevs.includes("critical")) return "critical";
  if (sevs.includes("high")) return "high";
  if (sevs.includes("medium")) return "medium";
  return "low";
}

function isVersionAtLeast(a: string, b: string): boolean {
  const parse = (v: string) => v.split(".").map(Number);
  const [aMaj = 0, aMin = 0, aPatch = 0] = parse(a);
  const [bMaj = 0, bMin = 0, bPatch = 0] = parse(b);
  if (aMaj !== bMaj) return aMaj > bMaj;
  if (aMin !== bMin) return aMin > bMin;
  return aPatch >= bPatch;
}

function buildVersionSuffix(
  fixedIn: string | undefined,
  latestVersion: string | undefined
): string {
  if (
    latestVersion &&
    fixedIn &&
    latestVersion !== fixedIn &&
    isVersionAtLeast(latestVersion, fixedIn)
  ) {
    return ` ${t.recommendations.updateTo(latestVersion)} ${t.recommendations.minFixedVersion(fixedIn)}`;
  }
  const target = fixedIn ?? latestVersion;
  return target ? ` ${t.recommendations.upgradeTo(target)}` : "";
}

function buildRecommendation(
  fixedIn: string | undefined,
  riskLevel: RiskLevel,
  latestVersion?: string
): string {
  if (riskLevel === "safe") return t.recommendations.safe;
  const suffix = buildVersionSuffix(fixedIn, latestVersion);
  switch (riskLevel) {
    case "critical":
      return `${t.recommendations.critical}${suffix}`;
    case "high":
      return `${t.recommendations.high}${suffix}`;
    case "medium":
      return `${t.recommendations.medium}${suffix}`;
    case "low":
      return `${t.recommendations.low}${suffix}`;
  }
}

function calcRiskScore(deps: Dependency[]): number {
  let score = 0;
  for (const dep of deps) {
    for (const vuln of dep.vulnerabilities) {
      switch (vuln.severity) {
        case "critical":
          score += 15;
          break;
        case "high":
          score += 8;
          break;
        case "medium":
          score += 4;
          break;
        case "low":
          score += 1;
          break;
      }
    }
  }
  return Math.min(100, score);
}

export function buildReport(params: {
  fileName: string;
  projectName: string;
  extractedDeps: ExtractedDep[];
  vulnsBatch: string[][];
  vulnDetails: Map<string, OsvVuln>;
  npmLatestVersions: Map<string, string>;
}): AnalysisReport {
  const {
    fileName,
    projectName,
    extractedDeps,
    vulnsBatch,
    vulnDetails,
    npmLatestVersions,
  } = params;

  const dependencies: Dependency[] = extractedDeps.map((dep, i) => {
    const vulnIds = vulnsBatch[i] ?? [];

    const vulnerabilities: CVE[] = vulnIds
      .map((id): CVE | null => {
        const vuln = vulnDetails.get(id);
        if (!vuln) return null;
        return {
          id: vuln.id,
          summary: vuln.summary ?? t.recommendations.noDescription,
          severity: classifySeverity(vuln),
          cvss: extractCvssScore(vuln),
          publishedAt: vuln.published ?? new Date().toISOString(),
        };
      })
      .filter((v): v is CVE => v !== null);

    let fixedIn: string | undefined;
    for (const id of vulnIds) {
      const vuln = vulnDetails.get(id);
      if (vuln) {
        fixedIn = extractFixedIn(vuln, dep.name);
        if (fixedIn) break;
      }
    }

    const riskLevel = calcRiskLevel(vulnerabilities);
    const latestVersion = npmLatestVersions.get(dep.name);

    return {
      name: dep.name,
      version: dep.version,
      type: dep.type,
      vulnerabilities,
      riskLevel,
      recommendation: buildRecommendation(fixedIn, riskLevel, latestVersion),
      fixedIn,
      latestVersion,
    };
  });

  const vulnerableDependencies = dependencies.filter(
    (d) => d.vulnerabilities.length > 0
  ).length;
  const totalVulnerabilities = dependencies.reduce(
    (s, d) => s + d.vulnerabilities.length,
    0
  );

  const severityBreakdown = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const dep of dependencies) {
    for (const vuln of dep.vulnerabilities) {
      severityBreakdown[vuln.severity]++;
    }
  }

  return {
    fileName,
    projectName,
    analyzedAt: new Date().toISOString(),
    riskScore: calcRiskScore(dependencies),
    totalDependencies: dependencies.length,
    vulnerableDependencies,
    totalVulnerabilities,
    severityBreakdown,
    dependencies,
  };
}
