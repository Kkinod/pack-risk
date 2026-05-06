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
- ✅ Latest available version column

Missing:

- ❌ Working export report action (button present, no handler)
- ❌ Most important issues section
- ❌ AI recommendations section
- ❌ Final report summary section
- ❌ External vulnerability source links in expanded row (NVD, GHSA, OSV)
- ❌ Impact description per vulnerability in expanded row

## Backend / Analysis Logic Status

Status: implemented

Implemented:

- ✅ `POST /api/analyze` — full analysis endpoint with error handling and concurrency control
- ✅ `features/package-analysis/server/parseManifest.ts` — parses and validates `package.json`, extracts deps from `dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies`, strips semver range operators
- ✅ `features/package-analysis/server/clients/osv.ts` — `POST /v1/querybatch` for all deps in one request, `GET /v1/vulns/{id}` for full vuln details, retry logic, timeout; `OsvVuln` includes `aliases` and `references`
- ✅ `features/package-analysis/server/clients/npm.ts` — npm Registry client; fetches `/{package}/latest`, handles scoped packages, 404 returns `null`, runs in parallel with OSV in `/api/analyze`
- ✅ `features/package-analysis/server/buildReport.ts` — severity classification, risk score, recommendations, `latestVersion`, `impact` text per vulnerability, `criticalDependencies`, `topRecommendations`, `summary`
- ✅ `features/package-analysis/api/useAnalyze.ts` — React Query mutation hook calling real API
- ✅ `AppShell.tsx` — calls real API, shows error on failure, no mock data fallback
- ✅ `lib/http/client.ts` — shared HTTP client with retry and timeout
- ✅ `lib/concurrency.ts` — pool utility for concurrent vuln detail fetching
- ✅ `locales/en.ts` — i18n strings for all UI text including impact and report summary templates

OSV API is the primary vulnerability source.

## Current Priority

Report improvements Step 1 (backend) is complete. Next priorities:

- ❌ Step 2: Most important issues UI section
- ❌ Step 3: Final report summary UI section
- ❌ Step 4: Extended expanded dependency row with links and impact
- ❌ Export report (JSON)

## Not a Priority Right Now

- Authentication
- Analysis history
- Additional charts
- UI polishing beyond current state
- AI recommendations (after UI report sections are done)

## Development Rule

Prioritize a working MVP with real analysis logic over adding more mock-based frontend features.
