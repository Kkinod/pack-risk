import type {
  AnalysisReport,
  CVE,
  Dependency,
  SeverityBreakdown,
  RiskLevel,
  DepType,
  Severity,
  VulnReference,
} from "../types";

export interface ReportExportMeta {
  exportedAt: string;
  analyzedAt: string;
  fileName: string;
  projectName: string;
  totalDependencies: number;
  vulnerableDependencies: number;
  totalVulnerabilities: number;
  riskScore: number;
  severityBreakdown: SeverityBreakdown;
}

export interface ReportExportVulnerability {
  id: string;
  cveId?: string;
  ghsaId?: string;
  severity: Severity;
  summary: string;
  impact: string;
  references: VulnReference[];
}

export interface ReportExportDependency {
  name: string;
  version: string;
  type: DepType;
  riskLevel: RiskLevel;
  recommendation: string;
  fixedIn?: string;
  latestVersion?: string;
  vulnerabilityCount: number;
  vulnerabilities: ReportExportVulnerability[];
}

export interface ReportExport {
  meta: ReportExportMeta;
  summary: string;
  topRecommendations: string[];
  criticalDependencies: ReportExportDependency[];
  dependencies: ReportExportDependency[];
}

function mapVulnerability(v: CVE): ReportExportVulnerability {
  return {
    id: v.id,
    cveId: v.cveId,
    ghsaId: v.ghsaId,
    severity: v.severity,
    summary: v.summary,
    impact: v.impact,
    references: v.references,
  };
}

function mapDependency(dep: Dependency): ReportExportDependency {
  return {
    name: dep.name,
    version: dep.version,
    type: dep.type,
    riskLevel: dep.riskLevel,
    recommendation: dep.recommendation,
    fixedIn: dep.fixedIn,
    latestVersion: dep.latestVersion,
    vulnerabilityCount: dep.vulnerabilities.length,
    vulnerabilities: dep.vulnerabilities.map(mapVulnerability),
  };
}

export function buildReportExport(report: AnalysisReport): ReportExport {
  return {
    meta: {
      exportedAt: new Date().toISOString(),
      analyzedAt: report.analyzedAt,
      fileName: report.fileName,
      projectName: report.projectName,
      totalDependencies: report.totalDependencies,
      vulnerableDependencies: report.vulnerableDependencies,
      totalVulnerabilities: report.totalVulnerabilities,
      riskScore: report.riskScore,
      severityBreakdown: report.severityBreakdown,
    },
    summary: report.summary,
    topRecommendations: report.topRecommendations,
    criticalDependencies: report.criticalDependencies.map(mapDependency),
    dependencies: report.dependencies.map(mapDependency),
  };
}

export type ExportExtension = "json" | "pdf";

export function buildExportFileName(
  projectName: string,
  ext: ExportExtension
): string {
  const date = new Date().toISOString().slice(0, 10);
  const slug = projectName.replace(/[^a-z0-9-_]/gi, "-").toLowerCase();
  const base = slug ? `pack-risk-${slug}` : "pack-risk-report";
  return `${base}-${date}.${ext}`;
}

export function triggerBlobDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadReportJson(report: AnalysisReport): void {
  const data = buildReportExport(report);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  triggerBlobDownload(blob, buildExportFileName(report.projectName, "json"));
}
