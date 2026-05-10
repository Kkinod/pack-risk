import type {
  DepType,
  RiskLevel,
  Severity,
  SeverityBreakdown,
} from "../../types";

export interface AIInputVulnerability {
  id: string;
  severity: Severity;
  summary: string;
  cvss?: number;
}

export interface AIInputDependency {
  name: string;
  version: string;
  type: DepType;
  riskLevel: RiskLevel;
  fixedIn?: string;
  latestVersion?: string;
  vulnerabilities: AIInputVulnerability[];
}

export interface AIInput {
  projectName: string;
  riskScore: number;
  totalDependencies: number;
  vulnerableDependencies: number;
  totalVulnerabilities: number;
  severityBreakdown: SeverityBreakdown;
  topVulnerableDeps: AIInputDependency[];
  topRecommendations: string[];
}

export interface RepairPriority {
  packageName: string;
  reason: string;
  action: string;
}

export interface KeyPackageReasoning {
  packageName: string;
  reasoning: string;
}

export interface DependencyRecommendation {
  packageName: string;
  recommendation: string;
}

export interface AISecurityAssessment {
  generalAssessment: string;
  riskExplanation: string;
  repairPriorities: RepairPriority[];
  keyPackagesReasoning: KeyPackageReasoning[];
  dependencyRecommendations: DependencyRecommendation[];
}
