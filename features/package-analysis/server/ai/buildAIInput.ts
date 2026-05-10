import type { AnalysisReport, Dependency, Severity } from "../../types";
import type { AIInput, AIInputDependency } from "./types";

const TOP_DEPS_LIMIT = 10;
const VULN_SUMMARY_MAX_LENGTH = 240;

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function depWeight(dep: Dependency): number {
  let weight = 0;
  for (const v of dep.vulnerabilities) {
    weight += SEVERITY_ORDER[v.severity] * 10;
  }
  if (dep.type === "prod") weight *= 1.2;
  return weight;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function toAIInputDependency(dep: Dependency): AIInputDependency {
  return {
    name: dep.name,
    version: dep.version,
    type: dep.type,
    riskLevel: dep.riskLevel,
    fixedIn: dep.fixedIn,
    latestVersion: dep.latestVersion,
    vulnerabilities: dep.vulnerabilities.map((v) => ({
      id: v.id,
      severity: v.severity,
      summary: truncate(v.summary, VULN_SUMMARY_MAX_LENGTH),
      cvss: v.cvss,
    })),
  };
}

export function buildAIInput(report: AnalysisReport): AIInput {
  const ranked = [...report.dependencies]
    .filter((d) => d.vulnerabilities.length > 0)
    .sort((a, b) => depWeight(b) - depWeight(a));

  const topVulnerableDeps = ranked
    .slice(0, TOP_DEPS_LIMIT)
    .map(toAIInputDependency);

  return {
    projectName: report.projectName,
    riskScore: report.riskScore,
    totalDependencies: report.totalDependencies,
    vulnerableDependencies: report.vulnerableDependencies,
    totalVulnerabilities: report.totalVulnerabilities,
    severityBreakdown: report.severityBreakdown,
    topVulnerableDeps,
    topRecommendations: report.topRecommendations,
  };
}
