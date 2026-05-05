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
    vector.match(new RegExp(`${metric}:([A-Z])`))?.at(1) ?? "N";

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

function buildRecommendation(
  fixedIn: string | undefined,
  riskLevel: RiskLevel
): string {
  if (riskLevel === "safe") return t.recommendations.safe;
  const fix = fixedIn ? ` ${t.recommendations.upgradeTo(fixedIn)}` : "";
  switch (riskLevel) {
    case "critical":
      return `${t.recommendations.critical}${fix}`;
    case "high":
      return `${t.recommendations.high}${fix}`;
    case "medium":
      return `${t.recommendations.medium}${fix}`;
    case "low":
      return `${t.recommendations.low}${fix}`;
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
}): AnalysisReport {
  const { fileName, projectName, extractedDeps, vulnsBatch, vulnDetails } =
    params;

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

    return {
      name: dep.name,
      version: dep.version,
      type: dep.type,
      vulnerabilities,
      riskLevel,
      recommendation: buildRecommendation(fixedIn, riskLevel),
      fixedIn,
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
