import type { AnalysisReport, AnalysisStep } from "../types";
import { t } from "@/locales";

export const ANALYSIS_STEPS: AnalysisStep[] = [
  { id: "parse", label: t.loading.steps.parse, duration: 700 },
  { id: "deps", label: t.loading.steps.deps, duration: 1100 },
  { id: "vuln", label: t.loading.steps.vuln, duration: 1400 },
  { id: "risk", label: t.loading.steps.risk, duration: 800 },
];

export const SAMPLE_PACKAGE_JSON = `{
  "name": "checkout-service",
  "version": "2.4.1",
  "private": true,
  "dependencies": {
    "express": "4.17.1",
    "lodash": "4.17.20",
    "axios": "0.21.1",
    "moment": "2.29.1",
    "minimist": "1.2.5",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "node-fetch": "2.6.1",
    "ws": "7.4.5",
    "jsonwebtoken": "8.5.1"
  },
  "devDependencies": {
    "typescript": "5.3.3",
    "vite": "4.5.0",
    "eslint": "8.57.0"
  }
}`;

export const MOCK_REPORT: AnalysisReport = {
  fileName: "package.json",
  projectName: "checkout-service",
  analyzedAt: new Date().toISOString(),
  riskScore: 64,
  totalDependencies: 13,
  vulnerableDependencies: 6,
  totalVulnerabilities: 11,
  severityBreakdown: {
    critical: 2,
    high: 3,
    medium: 4,
    low: 2,
  },
  dependencies: [
    {
      name: "lodash",
      version: "4.17.20",
      type: "prod",
      riskLevel: "critical",
      fixedIn: "4.17.21",
      recommendation: "Upgrade to 4.17.21 to patch prototype pollution.",
      vulnerabilities: [
        {
          id: "CVE-2021-23337",
          summary: "Command injection via template function.",
          severity: "high",
          cvss: 7.2,
          publishedAt: "2021-02-15",
        },
        {
          id: "GHSA-35jh-r3h4-6jhm",
          summary: "Prototype pollution in zipObjectDeep.",
          severity: "critical",
          cvss: 9.1,
          publishedAt: "2020-05-06",
        },
      ],
    },
    {
      name: "minimist",
      version: "1.2.5",
      type: "prod",
      riskLevel: "critical",
      fixedIn: "1.2.6",
      recommendation: "Upgrade to 1.2.6+ — exploited in supply-chain attacks.",
      vulnerabilities: [
        {
          id: "CVE-2021-44906",
          summary:
            "Prototype pollution allowing arbitrary property assignment.",
          severity: "critical",
          cvss: 9.8,
          publishedAt: "2022-03-17",
        },
      ],
    },
    {
      name: "axios",
      version: "0.21.1",
      type: "prod",
      riskLevel: "high",
      fixedIn: "0.21.4",
      recommendation: "Upgrade to 0.21.4 or later.",
      vulnerabilities: [
        {
          id: "CVE-2021-3749",
          summary: "Inefficient regex causing ReDoS during URL parsing.",
          severity: "high",
          cvss: 7.5,
          publishedAt: "2021-08-31",
        },
        {
          id: "CVE-2020-28168",
          summary: "Server-Side Request Forgery in HTTP redirect handling.",
          severity: "medium",
          cvss: 5.9,
          publishedAt: "2020-11-06",
        },
      ],
    },
    {
      name: "node-fetch",
      version: "2.6.1",
      type: "prod",
      riskLevel: "high",
      fixedIn: "2.6.7",
      recommendation: "Upgrade to 2.6.7 to mitigate exfiltration risk.",
      vulnerabilities: [
        {
          id: "CVE-2022-0235",
          summary: "Exposure of sensitive headers on cross-origin redirect.",
          severity: "high",
          cvss: 7.4,
          publishedAt: "2022-01-16",
        },
      ],
    },
    {
      name: "jsonwebtoken",
      version: "8.5.1",
      type: "prod",
      riskLevel: "medium",
      fixedIn: "9.0.0",
      recommendation: "Major upgrade required — review breaking changes.",
      vulnerabilities: [
        {
          id: "CVE-2022-23529",
          summary: "Insecure default algorithm allows verification bypass.",
          severity: "medium",
          cvss: 6.4,
          publishedAt: "2022-12-22",
        },
        {
          id: "CVE-2022-23539",
          summary: "Weak key validation in jwt.verify.",
          severity: "medium",
          cvss: 5.9,
          publishedAt: "2022-12-22",
        },
      ],
    },
    {
      name: "ws",
      version: "7.4.5",
      type: "prod",
      riskLevel: "medium",
      fixedIn: "7.4.6",
      recommendation: "Patch upgrade to 7.4.6 fixes ReDoS.",
      vulnerabilities: [
        {
          id: "CVE-2021-32640",
          summary: "ReDoS via Sec-Websocket-Protocol header parsing.",
          severity: "medium",
          cvss: 5.3,
          publishedAt: "2021-05-25",
        },
      ],
    },
    {
      name: "moment",
      version: "2.29.1",
      type: "prod",
      riskLevel: "low",
      fixedIn: "2.29.4",
      recommendation:
        "Consider migrating to date-fns or Luxon — moment is in maintenance mode.",
      vulnerabilities: [
        {
          id: "CVE-2022-31129",
          summary: "ReDoS in rfc2822 string parsing.",
          severity: "low",
          cvss: 3.7,
          publishedAt: "2022-07-06",
        },
      ],
    },
    {
      name: "express",
      version: "4.17.1",
      type: "prod",
      riskLevel: "low",
      fixedIn: "4.19.2",
      recommendation: "Minor upgrade recommended for the latest patches.",
      vulnerabilities: [
        {
          id: "CVE-2024-29041",
          summary: "Open redirect via malformed URL in res.location().",
          severity: "low",
          cvss: 3.5,
          publishedAt: "2024-03-25",
        },
      ],
    },
    {
      name: "react",
      version: "18.2.0",
      type: "prod",
      riskLevel: "safe",
      recommendation: "Up to date. No known vulnerabilities.",
      vulnerabilities: [],
    },
    {
      name: "react-dom",
      version: "18.2.0",
      type: "prod",
      riskLevel: "safe",
      recommendation: "Up to date. No known vulnerabilities.",
      vulnerabilities: [],
    },
    {
      name: "typescript",
      version: "5.3.3",
      type: "dev",
      riskLevel: "safe",
      recommendation: "Up to date. No known vulnerabilities.",
      vulnerabilities: [],
    },
    {
      name: "vite",
      version: "4.5.0",
      type: "dev",
      riskLevel: "safe",
      recommendation: "Newer minor available (5.x) — non-urgent.",
      vulnerabilities: [],
    },
    {
      name: "eslint",
      version: "8.57.0",
      type: "dev",
      riskLevel: "safe",
      recommendation: "Up to date. No known vulnerabilities.",
      vulnerabilities: [],
    },
  ],
};
