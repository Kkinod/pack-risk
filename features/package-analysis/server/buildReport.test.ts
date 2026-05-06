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

  it("uses latestVersion in recommendation when fixedIn is absent", () => {
    const vuln = makeVuln("GHSA-NOFIX", "HIGH");
    const report = buildReport({
      ...baseParams,
      vulnsBatch: [["GHSA-NOFIX"]],
      vulnDetails: new Map([["GHSA-NOFIX", vuln]]),
      npmLatestVersions: new Map([["lodash", "4.17.22"]]),
    });
    expect(report.dependencies[0].recommendation).toContain("4.17.22");
  });

  it("shows both latestVersion and fixedIn in recommendation when latestVersion is newer", () => {
    const vuln: OsvVuln = {
      id: "GHSA-BOTH",
      database_specific: { severity: "HIGH" },
      affected: [
        {
          package: { ecosystem: "npm", name: "lodash" },
          ranges: [
            {
              type: "SEMVER",
              events: [{ introduced: "0" }, { fixed: "4.17.20" }],
            },
          ],
        },
      ],
    };
    const report = buildReport({
      ...baseParams,
      vulnsBatch: [["GHSA-BOTH"]],
      vulnDetails: new Map([["GHSA-BOTH", vuln]]),
      npmLatestVersions: new Map([["lodash", "4.17.22"]]),
    });
    const rec = report.dependencies[0].recommendation;
    expect(rec).toContain("Update to 4.17.22.");
    expect(rec).toContain("Minimum fixed version is 4.17.20.");
  });

  it("uses fixedIn when it is newer than latestVersion", () => {
    const vuln: OsvVuln = {
      id: "GHSA-FIXNEWER",
      database_specific: { severity: "HIGH" },
      affected: [
        {
          package: { ecosystem: "npm", name: "lodash" },
          ranges: [
            {
              type: "SEMVER",
              events: [{ introduced: "0" }, { fixed: "4.17.25" }],
            },
          ],
        },
      ],
    };
    const report = buildReport({
      ...baseParams,
      vulnsBatch: [["GHSA-FIXNEWER"]],
      vulnDetails: new Map([["GHSA-FIXNEWER", vuln]]),
      npmLatestVersions: new Map([["lodash", "4.17.20"]]),
    });
    expect(report.dependencies[0].recommendation).toContain("4.17.25");
    expect(report.dependencies[0].recommendation).not.toContain("4.17.20");
  });

  it("uses generic recommendation text when neither fixedIn nor latestVersion is available", () => {
    const vuln = makeVuln("GHSA-NOVER", "HIGH");
    const report = buildReport({
      ...baseParams,
      vulnsBatch: [["GHSA-NOVER"]],
      vulnDetails: new Map([["GHSA-NOVER", vuln]]),
    });
    expect(report.dependencies[0].recommendation).not.toContain("Upgrade");
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

  it("extracts cveId and ghsaId from primary id and aliases", () => {
    const vuln: OsvVuln = {
      id: "GHSA-aaaa-bbbb-cccc",
      summary: "alias test",
      database_specific: { severity: "HIGH" },
      aliases: ["CVE-2024-9999"],
    };
    const report = buildReport({
      ...baseParams,
      vulnsBatch: [["GHSA-aaaa-bbbb-cccc"]],
      vulnDetails: new Map([["GHSA-aaaa-bbbb-cccc", vuln]]),
    });
    const cve = report.dependencies[0].vulnerabilities[0];
    expect(cve.ghsaId).toBe("GHSA-aaaa-bbbb-cccc");
    expect(cve.cveId).toBe("CVE-2024-9999");
    expect(cve.aliases).toEqual(["CVE-2024-9999"]);
  });

  it("falls back to undefined ids when no matching alias is present", () => {
    const vuln: OsvVuln = {
      id: "OSV-2024-1",
      database_specific: { severity: "MEDIUM" },
    };
    const report = buildReport({
      ...baseParams,
      vulnsBatch: [["OSV-2024-1"]],
      vulnDetails: new Map([["OSV-2024-1", vuln]]),
    });
    const cve = report.dependencies[0].vulnerabilities[0];
    expect(cve.cveId).toBeUndefined();
    expect(cve.ghsaId).toBeUndefined();
    expect(cve.aliases).toEqual([]);
  });

  it("normalizes references and keeps known types", () => {
    const vuln: OsvVuln = {
      id: "GHSA-REF",
      database_specific: { severity: "HIGH" },
      references: [
        { type: "ADVISORY", url: "https://example.com/advisory" },
        { type: "FIX", url: "https://example.com/fix" },
        { type: "UNKNOWN", url: "https://example.com/other" },
      ],
    };
    const report = buildReport({
      ...baseParams,
      vulnsBatch: [["GHSA-REF"]],
      vulnDetails: new Map([["GHSA-REF", vuln]]),
    });
    const refs = report.dependencies[0].vulnerabilities[0].references;
    expect(refs).toHaveLength(3);
    expect(refs.find((r) => r.type === "ADVISORY")?.url).toBe(
      "https://example.com/advisory"
    );
    expect(refs.find((r) => r.url === "https://example.com/other")?.type).toBe(
      "WEB"
    );
  });

  it("filters out references with empty url", () => {
    const vuln: OsvVuln = {
      id: "GHSA-EMPTY",
      database_specific: { severity: "LOW" },
      references: [
        { type: "WEB", url: "" },
        { type: "WEB", url: "https://ok" },
      ],
    };
    const report = buildReport({
      ...baseParams,
      vulnsBatch: [["GHSA-EMPTY"]],
      vulnDetails: new Map([["GHSA-EMPTY", vuln]]),
    });
    const refs = report.dependencies[0].vulnerabilities[0].references;
    expect(refs).toHaveLength(1);
    expect(refs[0].url).toBe("https://ok");
  });

  it("assigns runtime impact text for prod dependencies", () => {
    const vuln = makeVuln("GHSA-IMP", "CRITICAL");
    const report = buildReport({
      ...baseParams,
      extractedDeps: [{ name: "lodash", version: "1.0.0", type: "prod" }],
      vulnsBatch: [["GHSA-IMP"]],
      vulnDetails: new Map([["GHSA-IMP", vuln]]),
    });
    const impact = report.dependencies[0].vulnerabilities[0].impact;
    expect(impact).toMatch(/running application/i);
  });

  it("assigns tooling impact text for dev dependencies", () => {
    const vuln = makeVuln("GHSA-DEV", "CRITICAL");
    const report = buildReport({
      ...baseParams,
      extractedDeps: [{ name: "vite", version: "1.0.0", type: "dev" }],
      vulnsBatch: [["GHSA-DEV"]],
      vulnDetails: new Map([["GHSA-DEV", vuln]]),
    });
    const impact = report.dependencies[0].vulnerabilities[0].impact;
    expect(impact).toMatch(/development tooling|build pipeline/i);
  });

  it("returns critical dependencies sorted by weight", () => {
    const critA = makeVuln("GHSA-A", "CRITICAL");
    const critB = makeVuln("GHSA-B", "CRITICAL");
    const high = makeVuln("GHSA-C", "HIGH");
    const report = buildReport({
      ...baseParams,
      extractedDeps: [
        { name: "one-crit", version: "1.0.0", type: "prod" },
        { name: "two-crit", version: "1.0.0", type: "prod" },
        { name: "high-only", version: "1.0.0", type: "prod" },
      ],
      vulnsBatch: [["GHSA-A"], ["GHSA-A", "GHSA-B"], ["GHSA-C"]],
      vulnDetails: new Map([
        ["GHSA-A", critA],
        ["GHSA-B", critB],
        ["GHSA-C", high],
      ]),
    });
    expect(report.criticalDependencies.map((d) => d.name)).toEqual([
      "two-crit",
      "one-crit",
    ]);
  });

  it("returns top recommendations limited to 5 vulnerable deps", () => {
    const sevs = ["CRITICAL", "CRITICAL", "HIGH", "HIGH", "MEDIUM", "MEDIUM"];
    const extractedDeps = sevs.map((_, i) => ({
      name: `pkg-${i}`,
      version: "1.0.0",
      type: "prod" as const,
    }));
    const vulnsBatch = sevs.map((_, i) => [`V-${i}`]);
    const vulnDetails = new Map(
      sevs.map((sev, i) => [`V-${i}`, makeVuln(`V-${i}`, sev)])
    );
    const report = buildReport({
      ...baseParams,
      extractedDeps,
      vulnsBatch,
      vulnDetails,
    });
    expect(report.topRecommendations).toHaveLength(5);
    expect(report.topRecommendations[0]).toContain("pkg-0");
    expect(
      report.topRecommendations.find((r) => r.includes("pkg-5"))
    ).toBeUndefined();
  });

  it("ranks production deps higher than dev deps for tied severity", () => {
    const vuln = makeVuln("GHSA-TIE", "HIGH");
    const report = buildReport({
      ...baseParams,
      extractedDeps: [
        { name: "dev-pkg", version: "1.0.0", type: "dev" },
        { name: "prod-pkg", version: "1.0.0", type: "prod" },
      ],
      vulnsBatch: [["GHSA-TIE"], ["GHSA-TIE"]],
      vulnDetails: new Map([["GHSA-TIE", vuln]]),
    });
    expect(report.topRecommendations[0]).toContain("prod-pkg");
  });

  it("excludes safe dependencies from top recommendations and critical list", () => {
    const vuln = makeVuln("GHSA-S", "HIGH");
    const report = buildReport({
      ...baseParams,
      extractedDeps: [
        { name: "vuln-pkg", version: "1.0.0", type: "prod" },
        { name: "safe-pkg", version: "1.0.0", type: "prod" },
      ],
      vulnsBatch: [["GHSA-S"], []],
      vulnDetails: new Map([["GHSA-S", vuln]]),
    });
    expect(report.topRecommendations).toHaveLength(1);
    expect(report.topRecommendations[0]).toContain("vuln-pkg");
    expect(report.criticalDependencies).toHaveLength(0);
  });

  it("produces all-clean summary when no vulnerabilities are found", () => {
    const report = buildReport({
      ...baseParams,
      extractedDeps: [
        { name: "a", version: "1.0.0", type: "prod" },
        { name: "b", version: "1.0.0", type: "prod" },
      ],
      vulnsBatch: [[], []],
    });
    expect(report.summary).toMatch(/clean|no known vulnerabilities/i);
  });

  it("produces high-risk summary when score is high", () => {
    const vulns = Array.from({ length: 5 }, (_, i) =>
      makeVuln(`G-${i}`, "CRITICAL")
    );
    const report = buildReport({
      ...baseParams,
      vulnsBatch: [vulns.map((v) => v.id)],
      vulnDetails: new Map(vulns.map((v) => [v.id, v])),
    });
    expect(report.summary).toMatch(/immediate action/i);
  });

  it("produces low-risk summary when only low/medium issues exist", () => {
    const vuln = makeVuln("G-LOW", "LOW");
    const report = buildReport({
      ...baseParams,
      vulnsBatch: [["G-LOW"]],
      vulnDetails: new Map([["G-LOW", vuln]]),
    });
    expect(report.summary).toMatch(/low-impact|routine maintenance/i);
  });
});
