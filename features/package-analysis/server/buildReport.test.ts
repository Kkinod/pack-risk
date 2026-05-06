import { describe, expect, it } from "vitest";
import { buildReport } from "./buildReport";
import type { OsvVuln } from "./clients/osv";

function makeVuln(id: string, dbSeverity: string, cvss?: number): OsvVuln {
  return {
    id,
    summary: `Summary for ${id}`,
    published: "2024-01-01T00:00:00Z",
    database_specific: {
      severity: dbSeverity,
      ...(cvss !== undefined ? { cvss: { score: cvss } } : {}),
    },
  };
}

const baseParams = {
  fileName: "package.json",
  projectName: "test-app",
  extractedDeps: [
    { name: "lodash", version: "4.17.21", type: "prod" as const },
  ],
  vulnsBatch: [[]],
  vulnDetails: new Map<string, OsvVuln>(),
  npmLatestVersions: new Map<string, string>(),
};

describe("buildReport", () => {
  it("returns safe risk level for a dependency with no vulnerabilities", () => {
    const report = buildReport(baseParams);
    expect(report.dependencies[0].riskLevel).toBe("safe");
    expect(report.riskScore).toBe(0);
    expect(report.vulnerableDependencies).toBe(0);
  });

  it("classifies severity from database_specific.severity", () => {
    const vuln = makeVuln("GHSA-001", "CRITICAL");
    const report = buildReport({
      ...baseParams,
      vulnsBatch: [["GHSA-001"]],
      vulnDetails: new Map([["GHSA-001", vuln]]),
    });
    expect(report.dependencies[0].vulnerabilities[0].severity).toBe("critical");
    expect(report.dependencies[0].riskLevel).toBe("critical");
  });

  it("classifies MODERATE database severity as medium", () => {
    const vuln = makeVuln("GHSA-002", "MODERATE");
    const report = buildReport({
      ...baseParams,
      vulnsBatch: [["GHSA-002"]],
      vulnDetails: new Map([["GHSA-002", vuln]]),
    });
    expect(report.dependencies[0].vulnerabilities[0].severity).toBe("medium");
  });

  it("classifies severity from CVSS_V3 vector when database_specific.severity is absent", () => {
    const vuln: OsvVuln = {
      id: "CVE-001",
      severity: [
        {
          type: "CVSS_V3",
          score: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
        },
      ],
    };
    const report = buildReport({
      ...baseParams,
      vulnsBatch: [["CVE-001"]],
      vulnDetails: new Map([["CVE-001", vuln]]),
    });
    expect(report.dependencies[0].vulnerabilities[0].severity).toBe("critical");
  });

  it("calculates risk score based on vulnerability severity weights", () => {
    const critVuln = makeVuln("GHSA-CRIT", "CRITICAL");
    const highVuln = makeVuln("GHSA-HIGH", "HIGH");
    const report = buildReport({
      ...baseParams,
      extractedDeps: [
        { name: "a", version: "1.0.0", type: "prod" },
        { name: "b", version: "1.0.0", type: "prod" },
      ],
      vulnsBatch: [["GHSA-CRIT"], ["GHSA-HIGH"]],
      vulnDetails: new Map([
        ["GHSA-CRIT", critVuln],
        ["GHSA-HIGH", highVuln],
      ]),
    });
    expect(report.riskScore).toBe(23);
  });

  it("caps risk score at 100", () => {
    const vulns = Array.from({ length: 10 }, (_, i) =>
      makeVuln(`GHSA-${i}`, "CRITICAL")
    );
    const report = buildReport({
      ...baseParams,
      vulnsBatch: [vulns.map((v) => v.id)],
      vulnDetails: new Map(vulns.map((v) => [v.id, v])),
    });
    expect(report.riskScore).toBe(100);
  });

  it("includes latestVersion from npmLatestVersions map", () => {
    const report = buildReport({
      ...baseParams,
      npmLatestVersions: new Map([["lodash", "4.17.22"]]),
    });
    expect(report.dependencies[0].latestVersion).toBe("4.17.22");
  });

  it("omits latestVersion when package not in npmLatestVersions", () => {
    const report = buildReport(baseParams);
    expect(report.dependencies[0].latestVersion).toBeUndefined();
  });

  it("extracts fixedIn from SEMVER range events and includes it in recommendation", () => {
    const vuln: OsvVuln = {
      id: "GHSA-FIX",
      database_specific: { severity: "HIGH" },
      affected: [
        {
          package: { ecosystem: "npm", name: "lodash" },
          ranges: [
            {
              type: "SEMVER",
              events: [{ introduced: "0" }, { fixed: "4.17.22" }],
            },
          ],
        },
      ],
    };
    const report = buildReport({
      ...baseParams,
      vulnsBatch: [["GHSA-FIX"]],
      vulnDetails: new Map([["GHSA-FIX", vuln]]),
    });
    expect(report.dependencies[0].fixedIn).toBe("4.17.22");
    expect(report.dependencies[0].recommendation).toContain("4.17.22");
  });

  it("skips vulnerabilities missing from vulnDetails map", () => {
    const report = buildReport({
      ...baseParams,
      vulnsBatch: [["GHSA-MISSING"]],
      vulnDetails: new Map(),
    });
    expect(report.dependencies[0].vulnerabilities).toHaveLength(0);
    expect(report.dependencies[0].riskLevel).toBe("safe");
  });

  it("builds correct severity breakdown across all dependencies", () => {
    const vulns = [
      makeVuln("V1", "CRITICAL"),
      makeVuln("V2", "HIGH"),
      makeVuln("V3", "MODERATE"),
      makeVuln("V4", "LOW"),
    ];
    const report = buildReport({
      ...baseParams,
      vulnsBatch: [vulns.map((v) => v.id)],
      vulnDetails: new Map(vulns.map((v) => [v.id, v])),
    });
    expect(report.severityBreakdown).toEqual({
      critical: 1,
      high: 1,
      medium: 1,
      low: 1,
    });
  });

  it("counts vulnerable dependencies correctly", () => {
    const vuln = makeVuln("GHSA-X", "HIGH");
    const report = buildReport({
      ...baseParams,
      extractedDeps: [
        { name: "a", version: "1.0.0", type: "prod" },
        { name: "b", version: "2.0.0", type: "prod" },
      ],
      vulnsBatch: [["GHSA-X"], []],
      vulnDetails: new Map([["GHSA-X", vuln]]),
    });
    expect(report.vulnerableDependencies).toBe(1);
    expect(report.totalDependencies).toBe(2);
  });
});
