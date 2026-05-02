import type { RiskLevel } from "../types";

export interface ScoreMeta {
  color: string;
  soft: string;
  label: string;
  verdict: string;
  desc: string;
}

export function scoreToMeta(score: number): ScoreMeta {
  if (score >= 80)
    return {
      color: "var(--risk-critical)",
      soft: "var(--risk-critical-soft)",
      label: "Critical",
      verdict: "Critical risk — act immediately",
      desc: "Multiple critical vulnerabilities detected. Patch the highest-severity packages before deploying.",
    };
  if (score >= 60)
    return {
      color: "var(--risk-high)",
      soft: "var(--risk-high-soft)",
      label: "High",
      verdict: "High risk — patch this week",
      desc: "Several known vulnerabilities. Review the table below and prioritize critical and high items.",
    };
  if (score >= 30)
    return {
      color: "var(--risk-medium)",
      soft: "var(--risk-medium-soft)",
      label: "Medium",
      verdict: "Medium risk — monitor and plan upgrades",
      desc: "A handful of moderate issues. Schedule upgrades during your next maintenance window.",
    };
  if (score >= 10)
    return {
      color: "var(--risk-low)",
      soft: "var(--risk-low-soft)",
      label: "Low",
      verdict: "Low risk — minor cleanup recommended",
      desc: "Only minor issues found. Keep dependencies fresh, no urgent action required.",
    };
  return {
    color: "var(--risk-low)",
    soft: "var(--risk-low-soft)",
    label: "Safe",
    verdict: "Safe — no known issues",
    desc: "No known vulnerabilities found in the dependency tree.",
  };
}

export function riskLevelMeta(level: RiskLevel): {
  color: string;
  soft: string;
  label: string;
} {
  switch (level) {
    case "critical":
      return {
        color: "var(--risk-critical)",
        soft: "var(--risk-critical-soft)",
        label: "Critical",
      };
    case "high":
      return {
        color: "var(--risk-high)",
        soft: "var(--risk-high-soft)",
        label: "High",
      };
    case "medium":
      return {
        color: "var(--risk-medium)",
        soft: "var(--risk-medium-soft)",
        label: "Medium",
      };
    case "low":
      return {
        color: "var(--risk-low)",
        soft: "var(--risk-low-soft)",
        label: "Low",
      };
    case "safe":
    default:
      return {
        color: "var(--text-muted)",
        soft: "var(--bg-elev-2)",
        label: "Safe",
      };
  }
}
