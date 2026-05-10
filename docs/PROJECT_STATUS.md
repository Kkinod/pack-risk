# Project Status

This file describes the current implementation status, missing parts, and the next development priorities for the Pack Risk project.

## Development Roadmap

Detailed development roadmap is available in:

@docs/ROADMAP.md

## Current MVP Status

### Upload View

Status: mostly completed

- ✅ Drag & drop upload
- ✅ File picker
- ✅ Textarea for pasting `package.json` content
- ✅ JSON validation with `JSON.parse`
- ✅ `.json` file extension validation
- ✅ Start analysis button
- ✅ Sample `package.json`
- ✅ Short application description
- ✅ Local processing hint

Missing:

- ❌ More advanced package manifest validation (client-side; server-side `parseManifest` handles this)

### Analyze View

Status: mostly completed

Completed:

- ✅ Progress bar
- ✅ Analysis steps:
  - ✅ parse package
  - ✅ resolve dependencies
  - ✅ query vulnerabilities
  - ✅ calculate risk
- ✅ Step statuses:
  - ✅ queued
  - ✅ running
  - ✅ done
- ✅ Readable loading state

Missing:

- ❌ AI report generation step (UI only — backend ready)

### Report / Dashboard View

Status: partially completed

Completed:

- ✅ Risk score on a 0–100 scale
- ✅ RiskGauge component
- ✅ Total dependencies count
- ✅ Vulnerable dependencies count
- ✅ Severity breakdown:
  - ✅ critical
  - ✅ high
  - ✅ medium
  - ✅ low
- ✅ Dependency table
- ✅ Search, sort, and filter in the dependency table
- ✅ Expandable row with CVE details (ID, summary, CVSS, severity)
- ✅ New analysis button
- ✅ Latest available version column
- ✅ Most important issues section (`TopIssues` — priority summary above the table)
- ✅ Final report summary section (`ReportSummary` — algorithmic summary, critical deps, top recommendations)
- ✅ External vulnerability source links in expanded row (OSV always, GHSA and NVD when available)
- ✅ Impact description per vulnerability in expanded row
- ✅ JSON export of the analysis report (`Export report` button triggers download of `pack-risk-{project}-YYYY-MM-DD.json`)
- ✅ Export format selector (JSON / PDF) with disabled-while-exporting state and error feedback
- ✅ PDF export of the analysis report (header, risk score card, summary, critical dependencies, top recommendations, full dependency table, paginated footer)

Missing:

- ❌ AI recommendations section (UI only — backend ready)

## Backend / Analysis Logic Status

Status: implemented

Implemented:

- ✅ `POST /api/analyze` — full analysis endpoint with error handling and concurrency control
- ✅ `POST /api/ai-assessment` — accepts `{ report: AnalysisReport }`, returns `{ assessment: AISecurityAssessment }`; 503 when key missing, 502 on LLM failure; independent from technical analysis
- ✅ `features/package-analysis/server/parseManifest.ts` — parses and validates `package.json`, extracts deps from `dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies`, strips semver range operators
- ✅ `features/package-analysis/server/clients/osv.ts` — `POST /v1/querybatch` for all deps in one request, `GET /v1/vulns/{id}` for full vuln details, retry logic, timeout; `OsvVuln` includes `aliases` and `references`
- ✅ `features/package-analysis/server/clients/npm.ts` — npm Registry client; fetches `/{package}/latest`, handles scoped packages, 404 returns `null`, runs in parallel with OSV in `/api/analyze`
- ✅ `features/package-analysis/server/buildReport.ts` — severity classification, risk score, recommendations, `latestVersion`, `impact` text per vulnerability, `criticalDependencies`, `topRecommendations`, `summary`
- ✅ `features/package-analysis/server/ai/` — AI assessment module: `buildAIInput`, `buildPrompt`, `openaiClient`, `generateAssessment`; uses OpenAI chat completions with `response_format: json_object`
- ✅ `features/package-analysis/api/useAnalyze.ts` — React Query mutation hook calling real API
- ✅ `AppShell.tsx` — calls real API, shows error on failure, no mock data fallback
- ✅ `lib/http/client.ts` — shared HTTP client with retry and timeout
- ✅ `lib/concurrency.ts` — pool utility for concurrent vuln detail fetching
- ✅ `locales/en.ts` — i18n strings for all UI text including impact and report summary templates
- ✅ `features/package-analysis/utils/exportReport.ts` — JSON export utility with explicit `ReportExport` schema, decoupled from `AnalysisReport`; exposes shared `buildExportFileName` and `triggerBlobDownload` helpers
- ✅ `features/package-analysis/utils/ReportPdfDocument.tsx` — `@react-pdf/renderer` document component + `renderReportPdfBlob`
- ✅ `features/package-analysis/utils/exportReportPdf.ts` — PDF entry point; lazy-imports `ReportPdfDocument` so `@react-pdf/renderer` is only loaded when PDF export is triggered

OSV API is the primary vulnerability source. OpenAI API is used for AI security assessment generation.

## Current Priority

AI assessment backend is complete. Next priorities:

- ❌ AI Security Assessment UI section in dashboard (Step 3)
- ❌ AI generation step in Analyze view (Step 4)
- ❌ MVP stabilization (error handling, edge cases, README/changelog polish for thesis)

## Not a Priority Right Now

- Authentication
- Analysis history
- Additional charts
- UI polishing beyond current state
- AI recommendations (after UI report sections are done)

## Post-MVP — AI Assessment Optimizations

Out of MVP scope. Consider after thesis stabilization:

- Key-based AI response cache (hash of `AIInput` → cached `AISecurityAssessment`) to avoid repeated LLM calls for identical reports. In-memory LRU for dev, Redis / Vercel KV for production.
- Streaming responses (SSE) for perceived latency improvement.
- Per-user / per-IP rate limiting on `/api/ai-assessment` to control LLM cost exposure.
- Runtime schema validation of LLM JSON output (e.g. `zod`).
- Telemetry for token usage and assessment latency.

## Development Rule

Prioritize a working MVP with real analysis logic over adding more mock-based frontend features.
