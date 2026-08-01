export const en = {
  meta: {
    title: "Dependency Risk Analyzer",
    description: "Analyze package.json for security risks",
  },
  shell: {
    brandName: "Pack Risk",
    brandTag: "v0.2",
    nav: {
      progressLabel: "Progress",
      upload: "Upload",
      analyze: "Analyze",
      report: "Report",
    },
    theme: {
      toLightLabel: "Switch to light theme",
      toDarkLabel: "Switch to dark theme",
    },
    footer: {
      copyright: (year: number) => `© ${year} PackRisk. All rights reserved.`,
      builtBy: "Designed & built by",
      authorLinkText: "pawelek.dev",
    },
  },
  upload: {
    heroBadge: "No installation or repository access required",
    heroTitle: "Find vulnerabilities in your project dependencies",
    heroSubtitle: "Upload or paste your",
    heroSubtitleBold: "package.json",
    heroSubtitleRest:
      ", or enter dependencies manually, to identify vulnerable packages, understand the overall risk, and get clear recommendations on what to update first.",
    heroAudience:
      "A simple way to understand the security risk in your project dependencies.",
    dropzone: {
      title: "Drop package.json here",
      sub: "or click to browse — .json files only",
      removeFile: "Remove file",
    },
    divider: "or paste content",
    contentLabel: "package.json content",
    contentFormatTooltip:
      'Accepted formats:\n• Full package.json file\n• Object with "dependencies", "devDependencies", "peerDependencies" or "optionalDependencies" sections\n• Bare map of package names to versions: { "react": "^18.0.0", ... }\n• Raw lines without braces: "react": "^18.0.0", ...',
    loadSample: "Load sample",
    loadSampleHint: "Try it with an example project first.",
    placeholder: '{\n  "name": "my-app",\n  "dependencies": { ... }\n}',
    hint: "Your file is processed locally in the browser. Nothing is uploaded, stored, or shared.",
    hintBadge: "Runs locally",
    startAnalysis: "Start analysis",
    errors: {
      jsonFileOnly: "Please upload a .json file.",
      emptyContent: "Upload a file or paste package.json content first.",
      invalidJson: "Invalid JSON. Please check the file content.",
      analysisFailed:
        "Analysis failed. Please check your connection and try again.",
      manualEntryEmpty: "Add at least one package to analyze.",
      manualEntryInvalidRow: "Every package must have a name and version.",
    },
    modes: {
      filePaste: "File / Paste",
      manualEntry: "Manual entry",
    },
    manualEntry: {
      namePlaceholder: "Package name, e.g. react",
      versionPlaceholder: "Version, e.g. 18.0.0",
      addPackage: "+ Add package",
      removeAriaLabel: "Remove package",
      nameAriaLabel: (n: number) => `Package name ${n}`,
      versionAriaLabel: (n: number) => `Version ${n}`,
    },
  },
  loading: {
    eyebrow: "Step 2 — Scan in progress",
    title: "Analyzing dependencies",
    subtitle:
      "This usually takes a few seconds. We're checking your packages against the public vulnerability database.",
    progressLabel: "Progress",
    steps: {
      parse: "Parsing package.json",
      deps: "Resolving dependency tree",
      vuln: "Querying vulnerability databases",
      risk: "Calculating risk score",
      ai: "Generating AI-based security assessment",
    },
    status: {
      done: "✓ done",
      running: "running…",
      queued: "queued",
      optional: "available on report",
    },
    aiGroupLabel: "AI-assisted (optional)",
    technicalGroupLabel: "Technical analysis",
  },
  dashboard: {
    title: "Security report",
    projectLabel: "project",
    exportReport: "Export report",
    exporting: "Exporting…",
    exportFormat: {
      label: "Export format",
      json: "JSON",
      pdf: "PDF",
    },
    exportError: "Export failed. Please try again.",
    newAnalysis: "New analysis",
    panels: {
      riskScore: "Overall risk score",
      dependencies: "Dependencies",
      vulnerabilities: "Vulnerabilities by severity",
    },
    riskGauge: {
      outOf100: "/ 100",
    },
    stats: {
      withVulns: "with known vulnerabilities",
      packagesClean: "packages clean",
      acrossPackages: (n: number) => `across ${n} packages`,
    },
    depTable: {
      search: "Search packages…",
      empty: "No packages match the current filters.",
      filters: {
        all: "All",
        critical: "Critical",
        high: "High",
        medium: "Medium",
        low: "Low",
        safe: "Safe",
      },
      cols: {
        package: "Package",
        version: "Version",
        latest: "Latest",
        vulns: "Vulnerabilities",
        risk: "Risk",
        recommendation: "Recommendation",
      },
    },
    depRow: {
      knownVulns: (n: number) => `${n} known vulnerabilities`,
      latestUnknown: "Unknown",
      cvssLabel: (score: number) => `CVSS ${score.toFixed(1)}`,
      links: {
        osv: "OSV",
        ghsa: "GHSA",
        nvd: "NVD",
      },
    },
    summarySection: {
      title: "Report Summary",
      criticalDepsLabel: "Critical Dependencies",
      topRecsLabel: "Top Recommendations",
    },
  },
  risk: {
    critical: {
      label: "Critical",
      verdict: "Critical risk — act immediately",
      desc: "Multiple critical vulnerabilities detected. Patch the highest-severity packages before deploying.",
    },
    high: {
      label: "High",
      verdict: "High risk — patch this week",
      desc: "Several known vulnerabilities. Review the table below and prioritize critical and high items.",
    },
    medium: {
      label: "Medium",
      verdict: "Medium risk — monitor and plan upgrades",
      desc: "A handful of moderate issues. Schedule upgrades during your next maintenance window.",
    },
    low: {
      label: "Low",
      verdict: "Low risk — minor cleanup recommended",
      desc: "Only minor issues found. Keep dependencies fresh, no urgent action required.",
    },
    safe: {
      label: "Safe",
      verdict: "Safe — no known issues",
      desc: "No known vulnerabilities found in the dependency tree.",
    },
  },
  recommendations: {
    safe: "No known vulnerabilities.",
    noDescription: "No description available.",
    upgradeTo: (version: string) => `Upgrade to ${version}.`,
    updateTo: (version: string) => `Update to ${version}.`,
    minFixedVersion: (version: string) =>
      `Minimum fixed version is ${version}.`,
    critical: "Critical vulnerabilities detected.",
    high: "High severity vulnerabilities found.",
    medium: "Medium severity vulnerabilities found.",
    low: "Low severity vulnerabilities found.",
  },
  impact: {
    critical: {
      runtime:
        "Critical risk to the running application. Successful exploitation may lead to full system compromise, data exposure, or remote code execution.",
      tooling:
        "Critical issue in development tooling. Limited runtime exposure, but may affect build pipeline integrity or CI/CD security.",
    },
    high: {
      runtime:
        "High risk to the running application. May allow remote exploitation, privilege escalation, or sensitive data leakage.",
      tooling:
        "High risk in development tooling. Limited production exposure, but should be patched to keep the toolchain secure.",
    },
    medium: {
      runtime:
        "Moderate risk. Exploitation requires specific conditions, but the issue should be addressed in the next release.",
      tooling:
        "Moderate dev-only risk. Can wait for routine maintenance, but plan to upgrade.",
    },
    low: {
      runtime:
        "Low impact. Minor issue with limited exploitability under realistic conditions.",
      tooling:
        "Minimal impact. Cosmetic or low-severity issue in development tooling.",
    },
  },
  aiAssessment: {
    title: "AI Security Assessment",
    intro:
      "AI-generated synthesis on top of the technical report: prioritized action plan with effort and breaking-change estimates, cross-package reasoning, and strategic recommendations beyond single CVEs.",
    generate: "Generate AI Security Assessment",
    regenerate: "Regenerate",
    poweredBy:
      "AI-generated reasoning on top of OSV + npm Registry data. Verify breaking-change estimates before acting.",
    sections: {
      executiveSummary: "Executive Summary",
      prioritizedActionPlan: "Prioritized Action Plan",
      reasoning: "Reasoning & Risk Correlations",
      strategicRecommendations: "Strategic Recommendations",
    },
    actionPlan: {
      effortLabel: "Effort",
      breakingRiskLabel: "Breaking risk",
      unblocksLabel: "Unblocks",
      effort: {
        low: "Low (~5 min)",
        medium: "Medium (~1 h)",
        high: "High (½ day+)",
      },
      breakingRisk: {
        low: "Low",
        medium: "Medium",
        high: "High",
      },
      stepLabel: (n: number) => `Step ${n}`,
    },
    reasoning: {
      orderRationaleLabel: "Why this order",
      correlationsLabel: "Cross-package correlations",
      affectedLabel: "Affected:",
    },
    strategic: {
      categoryLabel: {
        deprecation: "Deprecation",
        architecture: "Architecture",
        tooling: "Tooling",
        process: "Process",
      },
    },
    loading: {
      label: "Generating AI security assessment",
      hint: "Calling the language model. This typically takes a few seconds.",
    },
    errors: {
      generic:
        "AI security assessment could not be generated. Please try again.",
      notConfigured:
        "AI security assessment is not configured on this server. The technical report remains fully available.",
      upstream: "The language model returned an error. Try again in a moment.",
      retry: "Try again",
    },
    empty: {
      prioritizedActionPlan: "No prioritized actions returned for this report.",
      correlations: "No cross-package correlations identified.",
      strategicRecommendations: "No strategic recommendations returned.",
    },
  },
  topIssues: {
    title: "Most Important Issues",
    helper:
      "Full technical details are available in the dependency table below.",
    priority: {
      critical: "Fix first",
      high: "High-priority update",
      medium: "Schedule update",
      low: "Routine update",
    },
    depType: {
      prod: "Production",
      dev: "Dev",
      peer: "Peer",
      optional: "Optional",
    },
    reason: (depType: string, count: number, severity: string) =>
      `${depType} dependency with ${count} ${severity} ${
        count === 1 ? "vulnerability" : "vulnerabilities"
      }`,
  },
  pdf: {
    author: "Pack Risk",
    docTitle: (name: string) => `Pack Risk Report — ${name}`,
    eyebrow: "Pack Risk Report",
    sourceLabel: (fileName: string) => `Source: ${fileName}`,
    datesLine: (analyzed: string, exported: string) =>
      `Analyzed: ${analyzed} · Exported: ${exported}`,
    scoreOf100: (score: number) => `${score}/100`,
    scoreLabel: {
      critical: "Critical risk",
      high: "High risk",
      medium: "Medium risk",
      low: "Low risk",
      safe: "Safe",
    },
    stats: {
      dependencies: "dependencies",
      vulnerable: "vulnerable",
      vulnerabilities: "vulnerabilities",
    },
    sections: {
      summary: "Summary",
      criticalDeps: "Critical dependencies",
      topRecs: "Top recommendations",
      depTable: "Dependencies",
    },
    tableHeaders: {
      package: "Package",
      version: "Version",
      latest: "Latest",
      vulns: "Vulns",
      risk: "Risk",
    },
    vulnCount: (n: number) => `${n} ${n === 1 ? "vuln" : "vulns"}`,
    footerBrand: (name: string) => `Pack Risk · ${name}`,
    footerPage: (current: number, total: number) =>
      `Page ${current} / ${total}`,
  },
  topRecommendation: {
    line: (name: string, recommendation: string) =>
      `${name}: ${recommendation}`,
  },
  reportSummary: {
    allClean: (total: number) =>
      `All ${total} dependencies are clean. No known vulnerabilities found in the analyzed manifest.`,
    lowRisk: (total: number, vulnerable: number) =>
      `${total} dependencies analyzed, ${vulnerable} with known vulnerabilities. Mostly low-impact issues — keep dependencies fresh during routine maintenance.`,
    midRisk: (total: number, vulnerable: number, high: number) =>
      `${total} dependencies analyzed, ${vulnerable} vulnerable. ${high} high-severity issues should be addressed in the next release.`,
    highRisk: (total: number, vulnerable: number, critical: number) =>
      `${total} dependencies analyzed, ${vulnerable} vulnerable, including ${critical} critical issues. Immediate action recommended.`,
  },
};

export type Locale = typeof en;
