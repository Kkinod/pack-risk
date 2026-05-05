import type { RiskLevel } from "../types";
import { t } from "@/locales";

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
      ...t.risk.critical,
    };
  if (score >= 60)
    return {
      color: "var(--risk-high)",
      soft: "var(--risk-high-soft)",
      ...t.risk.high,
    };
  if (score >= 30)
    return {
      color: "var(--risk-medium)",
      soft: "var(--risk-medium-soft)",
      ...t.risk.medium,
    };
  if (score >= 10)
    return {
      color: "var(--risk-low)",
      soft: "var(--risk-low-soft)",
      ...t.risk.low,
    };
  return {
    color: "var(--risk-low)",
    soft: "var(--risk-low-soft)",
    ...t.risk.safe,
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
        label: t.risk.critical.label,
      };
    case "high":
      return {
        color: "var(--risk-high)",
        soft: "var(--risk-high-soft)",
        label: t.risk.high.label,
      };
    case "medium":
      return {
        color: "var(--risk-medium)",
        soft: "var(--risk-medium-soft)",
        label: t.risk.medium.label,
      };
    case "low":
      return {
        color: "var(--risk-low)",
        soft: "var(--risk-low-soft)",
        label: t.risk.low.label,
      };
    case "safe":
    default:
      return {
        color: "var(--text-muted)",
        soft: "var(--bg-elev-2)",
        label: t.risk.safe.label,
      };
  }
}
