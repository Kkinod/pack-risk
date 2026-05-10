import { describe, expect, it } from "vitest";
import { buildAIInput } from "./buildAIInput";
import type { AnalysisReport, CVE, Dependency, Severity } from "../../types";

function makeCve(id: string, severity: Severity, summary = `Sum ${id}`): CVE {
  return {
    id,
    summary,
    severity,
    publishedAt: "2024-01-01T00:00:00Z",
    aliases: [],
    references: [],
    impact: "x",
  };
}

function makeDep(
  name: string,
  vulns: CVE[],
  overrides: Partial<Dependency> = {}
): Dependency {
  return {
    name,
    version: "1.0.0",
    type: "prod",
    vulnerabilities: vulns,
    riskLevel: vulns.length === 0 ? "safe" : vulns[0].severity,
    recommendation: "rec",
    ...overrides,
  };
}

function makeReport(deps: Dependency[]): AnalysisReport {
  const totalVulns = deps.reduce((s, d) => s + d.vulnerabilities.length, 0);
  return {
    fileName: "package.json",
    projectName: "test-app",
    analyzedAt: "2024-01-01T00:00:00Z",
    riskScore: 50,
    totalDependencies: deps.length,
    vulnerableDependencies: deps.filter((d) => d.vulnerabilities.length > 0)
      .length,
    totalVulnerabilities: totalVulns,
    severityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 },
    dependencies: deps,
    criticalDependencies: [],
    topRecommendations: ["pkg-a: upgrade", "pkg-b: upgrade"],
    summary: "summary",
  };
}

describe("buildAIInput", () => {
  it("includes only vulnerable dependencies in topVulnerableDeps", () => {
    const report = makeReport([
      makeDep("clean", []),
      makeDep("vuln", [makeCve("CVE-1", "high")]),
    ]);
    const input = buildAIInput(report);
    expect(input.topVulnerableDeps).toHaveLength(1);
    expect(input.topVulnerableDeps[0].name).toBe("vuln");
  });

  it("ranks dependencies by severity weight (critical first)", () => {
    const report = makeReport([
      makeDep("low-pkg", [makeCve("CVE-L", "low")]),
      makeDep("crit-pkg", [makeCve("CVE-C", "critical")]),
      makeDep("med-pkg", [makeCve("CVE-M", "medium")]),
    ]);
    const input = buildAIInput(report);
    expect(input.topVulnerableDeps.map((d) => d.name)).toEqual([
      "crit-pkg",
      "med-pkg",
      "low-pkg",
    ]);
  });

  it("limits topVulnerableDeps to 10", () => {
    const deps = Array.from({ length: 15 }, (_, i) =>
      makeDep(`pkg-${i}`, [makeCve(`CVE-${i}`, "high")])
    );
    const report = makeReport(deps);
    const input = buildAIInput(report);
    expect(input.topVulnerableDeps).toHaveLength(10);
  });

  it("boosts production dependencies above non-prod with same severity", () => {
    const report = makeReport([
      makeDep("dev-pkg", [makeCve("CVE-D", "high")], { type: "dev" }),
      makeDep("prod-pkg", [makeCve("CVE-P", "high")], { type: "prod" }),
    ]);
    const input = buildAIInput(report);
    expect(input.topVulnerableDeps[0].name).toBe("prod-pkg");
  });

  it("truncates long vulnerability summaries", () => {
    const longSummary = "x".repeat(500);
    const report = makeReport([
      makeDep("pkg", [makeCve("CVE-1", "high", longSummary)]),
    ]);
    const input = buildAIInput(report);
    expect(input.topVulnerableDeps[0].vulnerabilities[0].summary.length).toBe(
      240
    );
    expect(
      input.topVulnerableDeps[0].vulnerabilities[0].summary.endsWith("…")
    ).toBe(true);
  });

  it("preserves projectName, riskScore, severityBreakdown, topRecommendations", () => {
    const report = makeReport([makeDep("pkg", [makeCve("CVE-1", "high")])]);
    const input = buildAIInput(report);
    expect(input.projectName).toBe("test-app");
    expect(input.riskScore).toBe(50);
    expect(input.severityBreakdown).toEqual({
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    });
    expect(input.topRecommendations).toEqual([
      "pkg-a: upgrade",
      "pkg-b: upgrade",
    ]);
  });
});
