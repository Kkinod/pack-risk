import { describe, expect, it } from "vitest";
import { buildExportFileName, buildReportExport } from "./exportReport";
import type { AnalysisReport, CVE, Dependency } from "../types";

function makeCVE(id: string, extras: Partial<CVE> = {}): CVE {
  return {
    id,
    summary: `Summary ${id}`,
    severity: "high",
    publishedAt: "2024-01-01T00:00:00Z",
    aliases: [],
    references: [],
    impact: `Impact ${id}`,
    ...extras,
  };
}

function makeDep(name: string, extras: Partial<Dependency> = {}): Dependency {
  return {
    name,
    version: "1.0.0",
    type: "prod",
    vulnerabilities: [],
    riskLevel: "safe",
    recommendation: "ok",
    ...extras,
  };
}

function makeReport(extras: Partial<AnalysisReport> = {}): AnalysisReport {
  return {
    fileName: "package.json",
    projectName: "test-app",
    analyzedAt: "2024-06-15T10:00:00Z",
    riskScore: 0,
    totalDependencies: 0,
    vulnerableDependencies: 0,
    totalVulnerabilities: 0,
    severityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 },
    dependencies: [],
    criticalDependencies: [],
    topRecommendations: [],
    summary: "",
    ...extras,
  };
}

describe("buildExportFileName", () => {
  it("uses the slugified project name, ISO date and requested extension", () => {
    expect(buildExportFileName("my-app", "json")).toMatch(
      /^pack-risk-my-app-\d{4}-\d{2}-\d{2}\.json$/
    );
    expect(buildExportFileName("my-app", "pdf")).toMatch(
      /^pack-risk-my-app-\d{4}-\d{2}-\d{2}\.pdf$/
    );
  });

  it("falls back to 'report' when project name is empty", () => {
    expect(buildExportFileName("", "json")).toMatch(
      /^pack-risk-report-\d{4}-\d{2}-\d{2}\.json$/
    );
  });

  it("replaces special characters with dashes and lowercases the slug", () => {
    expect(buildExportFileName("@scope/My App!", "json")).toMatch(
      /^pack-risk--scope-my-app--\d{4}-\d{2}-\d{2}\.json$/
    );
  });
});

describe("buildReportExport", () => {
  it("maps top-level metadata from AnalysisReport", () => {
    const out = buildReportExport(
      makeReport({
        projectName: "demo",
        riskScore: 42,
        totalDependencies: 7,
        vulnerableDependencies: 3,
        totalVulnerabilities: 5,
        severityBreakdown: { critical: 1, high: 1, medium: 2, low: 1 },
      })
    );

    expect(out.meta.projectName).toBe("demo");
    expect(out.meta.riskScore).toBe(42);
    expect(out.meta.totalDependencies).toBe(7);
    expect(out.meta.vulnerableDependencies).toBe(3);
    expect(out.meta.totalVulnerabilities).toBe(5);
    expect(out.meta.severityBreakdown).toEqual({
      critical: 1,
      high: 1,
      medium: 2,
      low: 1,
    });
  });

  it("preserves analyzedAt and adds exportedAt as a valid ISO timestamp", () => {
    const out = buildReportExport(
      makeReport({ analyzedAt: "2024-01-01T00:00:00Z" })
    );

    expect(out.meta.analyzedAt).toBe("2024-01-01T00:00:00Z");
    expect(() => new Date(out.meta.exportedAt).toISOString()).not.toThrow();
    expect(out.meta.exportedAt).not.toBe(out.meta.analyzedAt);
  });

  it("computes vulnerabilityCount from the vulnerabilities array length", () => {
    const dep = makeDep("foo", {
      vulnerabilities: [makeCVE("V1"), makeCVE("V2")],
    });
    const out = buildReportExport(makeReport({ dependencies: [dep] }));

    expect(out.dependencies[0].vulnerabilityCount).toBe(2);
  });

  it("preserves vulnerability fields including cveId, ghsaId, references and impact", () => {
    const cve = makeCVE("V1", {
      cveId: "CVE-2024-001",
      ghsaId: "GHSA-xxxx",
      references: [{ type: "ADVISORY", url: "https://example.com" }],
      impact: "Allows remote code execution",
    });
    const out = buildReportExport(
      makeReport({
        dependencies: [makeDep("foo", { vulnerabilities: [cve] })],
      })
    );

    const v = out.dependencies[0].vulnerabilities[0];
    expect(v.id).toBe("V1");
    expect(v.cveId).toBe("CVE-2024-001");
    expect(v.ghsaId).toBe("GHSA-xxxx");
    expect(v.references).toEqual([
      { type: "ADVISORY", url: "https://example.com" },
    ]);
    expect(v.impact).toBe("Allows remote code execution");
  });

  it("returns empty arrays when the report has no dependencies", () => {
    const out = buildReportExport(makeReport());

    expect(out.dependencies).toEqual([]);
    expect(out.criticalDependencies).toEqual([]);
    expect(out.topRecommendations).toEqual([]);
  });

  it("maps criticalDependencies separately from the full dependencies list", () => {
    const safe = makeDep("safe-pkg");
    const critical = makeDep("crit-pkg", {
      riskLevel: "critical",
      vulnerabilities: [makeCVE("V1", { severity: "critical" })],
    });
    const out = buildReportExport(
      makeReport({
        dependencies: [safe, critical],
        criticalDependencies: [critical],
      })
    );

    expect(out.dependencies).toHaveLength(2);
    expect(out.criticalDependencies).toHaveLength(1);
    expect(out.criticalDependencies[0].name).toBe("crit-pkg");
    expect(out.criticalDependencies[0].riskLevel).toBe("critical");
  });

  it("preserves summary and topRecommendations", () => {
    const out = buildReportExport(
      makeReport({
        summary: "Test summary",
        topRecommendations: ["Update foo", "Remove bar"],
      })
    );

    expect(out.summary).toBe("Test summary");
    expect(out.topRecommendations).toEqual(["Update foo", "Remove bar"]);
  });
});
