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

- ❌ AI report generation step

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

Missing:

- ❌ Working export report action (button present, no handler)
- ✅ Latest available version column
- ❌ List of most important issues section
- ❌ AI recommendations section
- ❌ Final report section (AI summary, top-5 recommendations, critical deps list)
- ❌ External vulnerability source links (NVD, GHSA)
- ❌ Impact description for the analyzed project
- ❌ AI-generated recommendation per package

## Backend / Analysis Logic Status

Status: implemented

Implemented:

- ✅ `POST /api/analyze` — full analysis endpoint with error handling and concurrency control
- ✅ `features/package-analysis/server/parseManifest.ts` — parses and validates `package.json`, extracts deps from `dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies`, strips semver range operators
- ✅ `features/package-analysis/server/clients/osv.ts` — `POST /v1/querybatch` for all deps in one request, `GET /v1/vulns/{id}` for full vuln details, retry logic, timeout
- ✅ `features/package-analysis/server/clients/npm.ts` — npm Registry client; fetches `/{package}/latest`, handles scoped packages, 404 returns `null`, runs in parallel with OSV in `/api/analyze`
- ✅ `features/package-analysis/server/buildReport.ts` — severity classification (GHSA `database_specific.severity` first, CVSS vector heuristic as fallback), risk score calculation, recommendations, `latestVersion` per dependency
- ✅ `features/package-analysis/api/useAnalyze.ts` — React Query mutation hook calling real API
- ✅ `AppShell.tsx` — calls real API, shows error on failure, no mock data fallback
- ✅ `lib/http/client.ts` — shared HTTP client with retry and timeout
- ✅ `lib/concurrency.ts` — pool utility for concurrent vuln detail fetching
- ✅ `locales/en.ts` — i18n strings for all UI text

OSV API is the primary vulnerability source.

## Current Priority

npm Registry integration (Steps 1–3) is complete. Next priorities:

- ❌ Export report (PDF or JSON)
- ❌ AI recommendations section
- ❌ Final report summary section

## Not a Priority Right Now

- Authentication
- Analysis history
- Additional charts
- UI polishing beyond current state

## Development Rule

Prioritize a working MVP with real analysis logic over adding more mock-based frontend features.
