## Changelog

All notable changes to this project will be documented in this section.

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
