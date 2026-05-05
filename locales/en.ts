export const en = {
  meta: {
    title: "Dependency Risk Analyzer",
    description: "Analyze package.json for security risks",
  },
  shell: {
    brandName: "Dependency Risk Analyzer",
    brandTag: "v0.3 · MVP",
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
  },
  upload: {
    eyebrow: "Step 1 — Source",
    title: "Analyze your package.json for security risk",
    subtitle:
      "Upload a package.json file and we'll cross-reference its dependencies against public vulnerability databases to surface critical issues, outdated packages, and recommended fixes.",
    dropzone: {
      title: "Drop package.json here",
      sub: "or click to browse — .json files only",
      removeFile: "Remove file",
    },
    divider: "or paste content",
    contentLabel: "package.json content",
    loadSample: "Load sample →",
    placeholder: '{\n  "name": "my-app",\n  "dependencies": { ... }\n}',
    hint: "Your file is processed locally — nothing is uploaded.",
    startAnalysis: "Start analysis",
    errors: {
      jsonFileOnly: "Please upload a .json file.",
      emptyContent: "Upload a file or paste package.json content first.",
      invalidJson: "Invalid JSON. Please check the file content.",
      analysisFailed:
        "Analysis failed. Please check your connection and try again.",
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
    },
    status: {
      done: "✓ done",
      running: "running…",
      queued: "queued",
    },
  },
  dashboard: {
    title: "Security report",
    projectLabel: "project",
    exportReport: "Export report",
    newAnalysis: "New analysis",
    panels: {
      riskScore: "Overall risk score",
      dependencies: "Dependencies",
      vulnerabilities: "Vulnerabilities by severity",
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
        vulns: "Vulnerabilities",
        risk: "Risk",
        recommendation: "Recommendation",
      },
    },
    depRow: {
      knownVulns: (n: number) => `${n} known vulnerabilities`,
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
    critical: "Critical vulnerabilities detected.",
    high: "High severity vulnerabilities found.",
    medium: "Medium severity vulnerabilities found.",
    low: "Low severity vulnerabilities found.",
  },
};

export type Locale = typeof en;
