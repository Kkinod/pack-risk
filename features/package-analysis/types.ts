export type Severity = "critical" | "high" | "medium" | "low";

export type RiskLevel = "critical" | "high" | "medium" | "low" | "safe";

export type DepType = "prod" | "dev" | "peer" | "optional";

export interface CVE {
  id: string;
  summary: string;
  severity: Severity;
  cvss?: number;
  publishedAt: string;
}

export interface Dependency {
  name: string;
  version: string;
  type: DepType;
  vulnerabilities: CVE[];
  riskLevel: RiskLevel;
  recommendation: string;
  fixedIn?: string;
  latestVersion?: string;
}

export interface SeverityBreakdown {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface AnalysisReport {
  fileName: string;
  projectName: string;
  analyzedAt: string;
  riskScore: number;
  totalDependencies: number;
  vulnerableDependencies: number;
  totalVulnerabilities: number;
  severityBreakdown: SeverityBreakdown;
  dependencies: Dependency[];
}

export type Screen = "upload" | "loading" | "dashboard";

export interface AnalysisStep {
  id: string;
  label: string;
  duration: number;
}
