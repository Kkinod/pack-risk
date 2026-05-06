# Development Roadmap

This document defines the recommended order of further development. It should be used as a roadmap for manual work.

## Completed Milestones

The following milestones have already been completed:

- Initial Next.js project setup
- Initial project configuration with TypeScript, ESLint, Husky and SCSS Modules
- MVP frontend flow with Upload, Analyze and Report views
- Real OSV API integration for dependency vulnerability analysis
- Backend analysis flow in `/api/analyze`

## 1. Clean up project status file

Goal: keep project documentation clear and up to date.

Tasks:

- Keep completed, missing, and current priority sections consistent
- Update `docs/PROJECT_STATUS.md` after every larger feature branch is completed

## 2. npm Registry API integration

Goal: enrich dependency data with package metadata from the npm Registry.

### Step 1 — npm Registry client

Status: completed

Backend-only scope.

Tasks:

- ✅ Add `features/package-analysis/server/clients/npm.ts`
- ✅ Fetch latest package metadata from `https://registry.npmjs.org/{package}/latest`
- ✅ Properly encode package names, including scoped packages such as `@scope/package`
- ✅ Add `latestVersion` to dependency report data
- ✅ Integrate npm Registry fetching into `POST /api/analyze`
- ✅ Fetch npm metadata in parallel with OSV-related processing where possible
- ✅ Handle missing packages, timeouts, network errors, and partial results

### Step 2 — display npm data in UI

Status: completed

Tasks:

- ✅ Add `Latest` column to the dependency table
- ✅ Display `latestVersion` when available
- ✅ Display fallback state when `latestVersion` is missing, for example `Unknown`
- ✅ Add required UI strings to `locales/en.ts`

### Step 3 — use latest version data in recommendations

Status: completed

Tasks:

- ✅ Improve recommendation text when `latestVersion` is available
- ✅ Prefer specific recommendations such as `Update to X.Y.Z`
- ✅ Compare `latestVersion` with `fixedIn` when possible
- ✅ Keep generic recommendation text only when no reliable version data is available

Recommended branch:

```bash
feat/npm-registry-integration
```

## 3. Report improvements

Goal: turn the current dependency table into a more complete and user-friendly report based on real OSV and npm data, without adding AI yet.

The dependency table already presents technical package-level data. This step should add higher-level report sections that help users quickly understand what is most important and what should be fixed first.

Tasks:

- Add "Most Important Issues" section above the dependency table
- Highlight the highest-risk packages based on severity, vulnerability count, and recommended action
- Add external vulnerability source links when available, such as:
  - OSV advisory link
  - GHSA advisory link
  - NVD CVE link
- Add simple algorithmic impact description for vulnerable dependencies
- Add final report summary generated without AI
- Add list of critical dependencies
- Add report-level recommendations based on the highest-risk dependencies
- Keep the dependency table as the detailed technical part of the report

Recommended branch:

```bash
feat/report-improvements
```

## 4. Report export

Goal: allow users to export analysis results.

Tasks:

- Add working export report handler
- Start with JSON export
- Export current report data with metadata, dependencies, vulnerabilities, risk score, and recommendations
- Later extend export to PDF if needed

Recommended branch:

```bash
feat/report-export
```

## 5. AI recommendations

Goal: add AI-assisted explanation and recommendations after the report contains enough real data.

Tasks:

- Add AI recommendations section
- Generate simple-language vulnerability explanations
- Generate top recommendations for the whole project
- Generate per-package recommendation when useful
- Add "Generating AI-based report" step to Analyze view
- Keep AI output grounded in OSV and npm data

Recommended branch:

```bash
feat/ai-recommendations
```

## 6. Final thesis MVP stabilization

Goal: prepare the application for engineering thesis presentation.

Tasks:

- Improve error handling and edge cases
- Add loading and empty states where missing
- Test with multiple real `package.json` examples
- Verify report accuracy
- Update README and changelog
- Prepare screenshots or demo flow for the thesis

Recommended branch:

```bash
chore/mvp-stabilization
```

## Recommended Development Order

Follow this order:

1. Clean project status documentation
2. npm Registry API integration
3. Report improvements
4. Report export
5. AI recommendations
6. MVP stabilization

Do not start AI-related work before npm Registry integration and report improvements are completed.

---

## Future External API Integrations

Potential future integrations:

- GitHub Advisory Database for additional GHSA advisory details and source links
- NVD API for additional CVE and CVSS metadata
- Snyk API for additional vulnerability intelligence

These integrations are not part of the current MVP scope.
