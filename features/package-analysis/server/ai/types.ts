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

export type Effort = "low" | "medium" | "high";
export type BreakingRisk = "low" | "medium" | "high";
export type StrategicCategory =
  | "deprecation"
  | "architecture"
  | "tooling"
  | "process";

export interface ActionStep {
  order: number;
  packageName: string;
  action: string;
  effort: Effort;
  breakingRisk: BreakingRisk;
  unblocks?: string;
  rationale: string;
}

export interface RiskCorrelation {
  title: string;
  description: string;
  affectedPackages: string[];
}

export interface AssessmentReasoning {
  orderRationale: string;
  correlations: RiskCorrelation[];
}

export interface StrategicRecommendation {
  title: string;
  description: string;
  category: StrategicCategory;
}

export interface AISecurityAssessment {
  executiveSummary: string;
  prioritizedActionPlan: ActionStep[];
  reasoning: AssessmentReasoning;
  strategicRecommendations: StrategicRecommendation[];
}
