## Changelog

All notable changes to this project will be documented in this section.

## [0.4.0] - 2026-08-01

### Added

- Report is now available as its own page, directly accessible at `/report`

### Changed

- Report stays available across page refresh within the same browser session

## [0.3.0] - 2026-08-01

### Changed

- Refreshed global visual style — colors, spacing, and typography updated across the app
- Polished upload view UI
- Improved accessibility throughout

## [0.2.0] - 2026-07-29

### Added

- Manual Entry mode in the upload view — users can add packages by name and version via dynamic input fields without uploading a file
- Mode switcher (File / Paste ↔ Manual Entry) with smooth sliding segmented control
- Hero section above the upload card with title, subtitle, and audience label
- Page footer with copyright and link to author's website

### Changed

- `parseManifest` now accepts partial JSON (bare object without `dependencies` key) and raw key-value pairs without outer braces — input is auto-normalized before parsing
- Content format tooltip updated to reflect all accepted input formats
- Theme state now uses `useSyncExternalStore` — eliminates `useEffect`/`setState` pattern and avoids cascading re-renders
- Upload view code split into `useUpload` and `useManualEntry` hooks and a dedicated `ManualEntry` component

### Fixed

- Theme hydration mismatch — inline script in `layout.tsx` sets `data-theme` before React hydrates, preventing flash of wrong theme on page load
- Manual Entry inputs now wrap to separate rows on narrow screens with correct alignment
- `modeTabs` margin kept in sync with `body` padding across all responsive breakpoints — version input no longer visually overflows the mode switcher at widths below 900px

## [0.11.1] - 2026-05-17

### Fixed

- `fixedIn` field now stores the highest minimum fixed version across all vulnerabilities for a package instead of the first one found — prevents recommending a version lower than the one already installed
- `fixedIn` is set to `undefined` when it is not higher than the currently installed version — eliminates misleading downgrade arrows in the Version column
- `isVersionAtLeast` extracted to `features/package-analysis/utils/risk.ts` as a shared utility (previously duplicated in `buildReport.ts`)
- Recommendation text simplified — no longer shows "Minimum fixed version is X" alongside "Update to Y"; always recommends a single target version

### Dependencies

- Upgraded `next` and `eslint-config-next` from 16.2.4 to 16.2.6
- Added `pnpm.overrides` to force `postcss >= 8.5.10`, resolving a moderate XSS advisory (GHSA-qx2v-qp2m-jg93) in the transitive dependency

## [0.11.0] - 2026-05-16

### Added

- `AIAssessment` component (`features/package-analysis/views/Dashboard/components/AIAssessment.tsx`) — AI Security Assessment section rendered between `TopIssues` and the dependency table; gated by an explicit `Generate AI Security Assessment` button so the LLM is only called on user action
- `useAIAssessment` React Query mutation hook (`features/package-analysis/api/useAIAssessment.ts`) calling `POST /api/ai-assessment` with the current `AnalysisReport`
- Loading, error, and result states for the AI section; 503 surfaces as "not configured", 502 as "upstream error", everything else as generic with a retry button
- Four reasoning-focused result blocks: executive summary (narrative synthesis), prioritized action plan (numbered steps with `effort` + `breakingRisk` badges, `rationale`, optional `unblocks` highlight), reasoning (`orderRationale` prose + cross-package `correlations` cards with affected-package chips), strategic recommendations grouped by category (`deprecation` / `architecture` / `tooling` / `process`)
- Analyze view (`Loading.tsx`) now shows a visually separated `AI-assisted (optional)` group below the technical steps, with a `Generating AI-based security assessment` row and `available on report` status meta — clarifies that AI runs separately from deterministic analysis
- `aiAssessment.*`, `loading.steps.ai`, `loading.status.optional`, `loading.aiGroupLabel`, and `loading.technicalGroupLabel` i18n strings in `locales/en.ts`
- Unit tests covering the new schema: invalid `effort` enum, invalid strategic category, and default-empty `unblocks` field

### Changed

- `AISecurityAssessment` output schema reshaped to deliver reasoning instead of paraphrasing the dependency table: `executiveSummary`, `prioritizedActionPlan[ActionStep]` (with `effort`, `breakingRisk`, `rationale`, optional `unblocks`), `reasoning` (`orderRationale` + `correlations[]`), `strategicRecommendations[]`. Replaces the previous `generalAssessment` / `riskExplanation` / `repairPriorities` / `keyPackagesReasoning` / `dependencyRecommendations` shape
- `buildPrompt.ts` system prompt rewritten to demand synthesis, trade-off reasoning, cross-package correlations, and strategic non-CVE recommendations; explicitly forbids paraphrasing OSV / npm data and authorizes ecosystem-knowledge use (deprecations, alternatives, breaking-change estimates) while still forbidding invented CVE IDs, package names, and version numbers
- `generateAssessment` Zod schema updated to validate the new shape with strict enums for `effort`, `breakingRisk`, and strategic `category`

## [0.10.0] - 2026-05-09

### Added

- AI security assessment module (`features/package-analysis/server/ai/`) - generates a human-readable security assessment from an existing `AnalysisReport` using an external LLM (OpenAI `gpt-4o-mini` by default)
- `AIInput` type - a trimmed projection of `AnalysisReport` sent to the model (top 10 vulnerable deps by severity weight, truncated summaries, no raw OSV data)
- `AISecurityAssessment` type - structured LLM output: `generalAssessment`, `riskExplanation`, `repairPriorities`, `keyPackagesReasoning`, `dependencyRecommendations`
- `buildAIInput(report)` - builds `AIInput` from `AnalysisReport`; ranks deps by severity + prod boost, limits to 10, truncates vuln summaries to 240 chars
- `buildPrompt` - system prompt enforcing JSON-only output and no hallucination of CVE data; `buildUserPrompt(input)` injects the `AIInput` payload
- `openaiClient` - thin wrapper around shared `httpClient` with 30 s timeout, retry ×2, `Authorization: Bearer` header loaded from `OPENAI_API_KEY` env var; model configurable via `OPENAI_MODEL` (default `gpt-4o-mini`)
- `generateAssessment(report, client?)` - orchestrates input building → chat completion call (`temperature: 0.2`, `response_format: json_object`) → JSON parsing → typed `AISecurityAssessment`; throws `AIAssessmentError` on any failure
- `POST /api/ai-assessment` - accepts `{ report: AnalysisReport }`, returns `{ assessment: AISecurityAssessment }`; returns 503 when API key is missing, 502 on LLM failure — technical report from `/api/analyze` is unaffected
- `.env.example` - template with `OPENAI_API_KEY` and `OPENAI_MODEL`
- 12 new unit tests across `buildAIInput` and `generateAssessment`
- Post-MVP optimization notes in `ROADMAP.md` and `PROJECT_STATUS.md`: key-based response cache, SSE streaming, rate limiting, token telemetry
- Zod schema validation for `AISecurityAssessment` — replaces manual JSON parsing; non-empty string constraints on all required fields
- `max_tokens: 2000` cap and explicit `finish_reason` checks (`length`, `content_filter`) on AI responses
- `getOpenAIClient()` lazy singleton — client created once and reused across calls
- `generateAssessment` accepts optional `{ signal?: AbortSignal }` for request cancellation
- `buildUserPrompt` wraps input in `<USER_DATA>` delimiters with prompt injection defense in system prompt
- `buildUserPrompt` uses compact `JSON.stringify` (no pretty-print) to reduce prompt token count
- `zod` dependency for runtime schema validation

### Changed

- `.gitignore` - added `!.env.example` exception so the template is committed

## [0.9.0] - 2026-05-07

### Added

- PDF export of the analysis report — generates an A4 PDF with header, risk score card, severity breakdown, summary, critical dependencies, top recommendations, full dependency table, and paginated footer
- Export format selector (`JSON` / `PDF`) next to the export button — selected format is used when the button is clicked
- `Exporting…` button label and disabled state while export is running; inline error message when export fails
- `features/package-analysis/utils/ReportPdfDocument.tsx` — `@react-pdf/renderer` document component and `renderReportPdfBlob`
- `features/package-analysis/utils/exportReportPdf.ts` — PDF entry point with lazy import of the document module so `@react-pdf/renderer` (~300 KB) is only loaded when PDF export is triggered
- i18n strings: `dashboard.exportFormat.{label,json,pdf}`, `dashboard.exporting`, `dashboard.exportError` in `locales/en.ts`

### Changed

- `exportReport.ts` exposes shared `buildExportFileName(projectName, ext)` and `triggerBlobDownload(blob, fileName)` helpers reused by both JSON and PDF export paths

### Dependencies

- Added `@react-pdf/renderer ^4.5.1`

## [0.8.0] - 2026-05-07

### Added

- JSON export of the analysis report — `Export report` button now triggers a browser download of the full report as a structured `.json` file
- `features/package-analysis/utils/exportReport.ts` — export utility with `buildReportExport()` and `downloadReportJson()`
- Explicit `ReportExport`, `ReportExportMeta`, `ReportExportDependency`, and `ReportExportVulnerability` types — decoupled from the internal `AnalysisReport` to keep the export schema stable across future report changes
- Export filename uses a sluggified project name and ISO date: `pack-risk-{project}-YYYY-MM-DD.json` (falls back to `pack-risk-report-YYYY-MM-DD.json` when no project name is available)
- Export metadata includes `exportedAt` separate from `analyzedAt`, plus risk score, severity breakdown, and dependency totals

## [0.7.0] - 2026-05-07

### Added

- `TopIssues` component above the dependency table — priority summary of critical packages with risk badge, reason (dep type + dominant severity count), and recommended action; hidden when no critical dependencies exist
- `ReportSummary` component below the dependency table — displays algorithmic `report.summary` text, critical dependencies list with risk tags, and top recommendations as a numbered list
- Advisory links in expanded dependency row — OSV link per vulnerability (always present), GHSA and NVD links when `ghsaId` / `cveId` are available
- Impact text per vulnerability in expanded dependency row
- i18n strings for `topIssues.*` and `dashboard.summarySection.*` in `locales/en.ts`
- `dashboard.depRow.links` i18n strings for OSV, GHSA, NVD labels

## [0.6.0] - 2026-05-06

### Added

- `aliases`, `references`, `cveId`, `ghsaId`, and `impact` fields on `CVE` type
- `VulnReference` type with `{ type, url }` shape
- `criticalDependencies`, `topRecommendations`, and `summary` fields on `AnalysisReport`
- `OsvVuln` extended with `aliases: string[]` and `references: OsvReference[]`
- Algorithmic `impact` text per vulnerability based on severity and dependency type (runtime vs tooling)
- `criticalDependencies` — vulnerable deps with `riskLevel === "critical"`, sorted by weighted severity score
- `topRecommendations` — top 5 vulnerable deps by weight, production deps boosted ×1.2
- `summary` — single-sentence report summary generated from vulnerability counts and risk score
- i18n strings: `impact.*`, `topRecommendation.line`, `reportSummary.*` in `locales/en.ts`
- 13 new unit tests for aliases, references, impact grouping, ranking, and summary generation

### Removed

- Unused `MOCK_REPORT` export from `mockData.ts`

## [0.5.1] - 2026-05-06

### Changed

- Recommendation text now shows both `latestVersion` and `fixedIn` when the latest release is newer than the minimum fix: `"Update to X. Minimum fixed version is Y."`
- When only one version is available, falls back to `"Upgrade to X."`
- When `latestVersion` is older than `fixedIn` (fix not yet in latest), recommends `fixedIn` only

## [0.5.0] - 2026-05-06

### Added

- `Latest` column in dependency table showing `latestVersion` from npm Registry or `Unknown` fallback
- `cols.latest` and `depRow.latestUnknown` i18n strings in `locales/en.ts`
- Unit tests for `parseManifest`, `buildReport`, `osv` client
- Integration tests for `POST /api/analyze` in `tests/integration/`

### Fixed

- CVSS vector metric parsing in `buildReport` — regex now anchors on `/` separator to avoid matching partial metric names (e.g. `AC:L` no longer matched as `C:L`)

## [0.4.0] - 2026-05-06

### Added

- `features/package-analysis/server/clients/npm.ts` — npm Registry client using shared `httpClient` factory; fetches `/{package}/latest`, handles scoped packages, returns `null` on 404
- `latestVersion?: string` field on `Dependency` type
- npm metadata fetching runs in parallel with `batchQueryOSV` in `/api/analyze`, capped at 8 concurrent requests
- API response now includes `failedNpmCount` alongside existing `failedVulnCount`

### Changed

- `buildReport` accepts `npmLatestVersions: Map<string, string>` and populates `latestVersion` per dependency
- `partialResults` flag in API response now also covers failed npm fetches

## [0.3.1] - 2026-05-06

### Added

- Added `docs/PROJECT_STATUS.md`
- Added `docs/ROADMAP.md`

### Changed

- Updated project documentation structure

## [0.3.0] - 2026-05-05

### Added

- Real OSV API integration: batch vulnerability queries and per-vulnerability detail fetching
- `lib/http/client.ts` - typed HTTP client factory with timeout, retry (exponential backoff), and structured errors
- `lib/http/errors.ts` - `HttpError`, `TimeoutError`, `NetworkError`, `UpstreamError`, `ParseError` hierarchy
- `lib/concurrency.ts` - `pool()` for capped parallel async operations
- `locales/en.ts` - single source of truth for all UI strings, foundation for multi-language support
- `features/package-analysis/server/parseManifest.ts` - manifest parser with validation
- `features/package-analysis/server/clients/osv.ts` - OSV API client using `httpClient` factory
- `features/package-analysis/server/buildReport.ts` - severity classification, risk scoring, report assembly
- TanStack Query: `QueryProvider`, `apiFetch`, `useAnalyze` mutation hook
- Input validation: 1 MB size limit on `/api/analyze`
- Partial results reporting: API response includes `partialResults` and `failedVulnCount`

### Changed

- `/api/analyze` route fully rewritten — real OSV data, concurrency limit of 8 parallel vuln fetches
- `AppShell` refactored to use TanStack Query mutation instead of manual fetch state
- Error state now surfaces to user via `serverError` prop on Upload view instead of silent mock fallback
- Centralize all UI strings into locales/en.ts

### Removed

- Mock analysis data removed entirely

## [0.2.0] - 2026-05-02

### Added

- MVP frontend flow for package analysis
- Package input view for providing `package.json` content
- Basic package manifest validation flow
- Initial dependency extraction presentation flow

## [0.1.1] - 2026-05-02

### Added

- Initial project configuration
- ESLint configuration
- Husky pre-commit setup
- lint-staged configuration
- TypeScript type checking script
- SCSS Modules setup
- Basic modular project structure

## [0.1.0] - 2026-05-02

### Added

- Initial Next.js project setup
- TypeScript configuration
- App Router structure
- Basic application layout
- Initial project files generated with `create-next-app`
