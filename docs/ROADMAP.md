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

### Step 1 — Backend: extend report data with links and impact information

Status: completed

Tasks:

- ✅ Extend `OsvVuln` with `aliases` and `references`
- ✅ Add reference objects with `{ type, url }`
- ✅ Extend vulnerability-related types in `types.ts` with:
  - ✅ `aliases`
  - ✅ `references`
  - ✅ `cveId`
  - ✅ `ghsaId`
- ✅ Update `buildReport.ts` to map aliases and references from OSV vulnerability details
- ✅ Add algorithmic `impact` text per vulnerability based on severity and dependency type
- ✅ Extend `AnalysisReport` with:
  - ✅ `criticalDependencies: Dependency[]`
  - ✅ `topRecommendations: string[]`
  - ✅ `summary: string`

### Step 2 — UI: add "Most Important Issues" section above the dependency table

Status: completed

Tasks:

- ✅ Add `TopIssues` component
- ✅ Rank issues by severity weight, vulnerability count, and production dependency priority
- ✅ Show package name, priority label, short reason, and recommended action per item
- ✅ Section renders only when critical dependencies are present
- ✅ Add required UI strings to `locales/en.ts`

### Step 3 — UI: add Final Report Summary section without AI

Status: completed

Tasks:

- ✅ Add `ReportSummary` component below the dependency table
- ✅ Display algorithmic report summary from `report.summary`
- ✅ Display critical dependencies from `report.criticalDependencies`
- ✅ Display top recommendations from `report.topRecommendations`
- ✅ Generate this section only from existing report data, without AI

### Step 4 — UI: extend expanded dependency row

Status: completed

Tasks:

- ✅ Extend `DependencyRow` expanded content
- ✅ Add advisory links for each vulnerability (OSV always, GHSA and NVD when available)
- ✅ Display impact text per vulnerability
- ✅ Keep the expanded row focused on package-level technical details

Recommended branch:

```bash
feat/report-improvements
```

## 4. Report export

Goal: allow users to export the completed analysis report.

The first implementation should focus on JSON export. PDF export can be added later as an extension.

### Step 1 — Prepare export data

Status: completed

Tasks:

- ✅ Create a report export data structure based on the current `AnalysisReport`
- ✅ Include basic metadata:
  - ✅ export date
  - ✅ project/package name when available
  - ✅ total dependencies
  - ✅ vulnerable dependencies
  - ✅ risk score
  - ✅ severity breakdown
- ✅ Include analyzed dependencies with:
  - ✅ package name
  - ✅ current version
  - ✅ fixed version
  - ✅ latest version
  - ✅ vulnerability count
  - ✅ risk level
  - ✅ recommendation
- ✅ Include vulnerability details:
  - ✅ vulnerability ID
  - ✅ CVE ID when available
  - ✅ GHSA ID when available
  - ✅ severity
  - ✅ summary
  - ✅ impact
  - ✅ source links
- ✅ Include report-level data:
  - ✅ summary
  - ✅ critical dependencies
  - ✅ top recommendations

### Step 2 — Implement JSON export

Status: completed

Tasks:

- ✅ Add export handler for the existing `Export report` button
- ✅ Generate a `.json` file from the current report data
- ✅ Use a readable file name, for example `pack-risk-report-YYYY-MM-DD.json`
- ✅ Trigger browser download on click
- ✅ Keep export logic separated from UI components, for example in a utility function

### Step 3 — Add UI feedback

Status: completed

Tasks:

- ✅ Add export format selection to the report UI
- ✅ Support `JSON` and `PDF` as export options
- ✅ Use the selected format when the export button is clicked
- ✅ Keep JSON export based on the existing implementation
- ✅ Add required UI strings to `locales/en.ts`

### Step 4 — Implement PDF export

Status: completed

Tasks:

- ✅ Generate a readable PDF report from the existing export data structure
- ✅ Include risk score, dependency summary, severity breakdown, most important issues, critical dependencies, top recommendations, and dependency table summary
- ✅ Use a readable file name, for example `pack-risk-report-YYYY-MM-DD.pdf`
- ✅ Keep PDF generation logic separated from UI components

Recommended branch:

```bash
feat/report-export
```

## 5. AI security assessment and recommendations

Goal: add an AI-assisted security assessment based on the completed technical analysis report.

The AI module should not replace OSV-based vulnerability detection, npm Registry metadata, or the algorithmic risk score. Its purpose is to transform the existing technical report into a clearer security assessment and actionable recommendations.

The AI module should use a large language model available through an external API, for example OpenAI API, to generate the AI Security Assessment from the existing technical report data.

The AI security assessment should include:

- General assessment of the project's security situation
- Simple-language explanation of the risk level
- Repair priorities based on detected vulnerabilities, severity, dependency type, and available safe versions
- Explanation of why selected packages are considered the most important
- Recommendations for selected dependencies when useful

### Step 1 — Prepare AI input data

Status: done

Tasks:

- ✅ Define the AI report data structure (`AIInput`, `AISecurityAssessment`, `RepairPriority`, `KeyPackageReasoning`, `DependencyRecommendation` in `features/package-analysis/server/ai/types.ts`)
- ✅ Build AI input from the existing `AnalysisReport` (`buildAIInput` — top 10 vulnerable deps by severity weight, prod boost ×1.2, vuln summary truncation to 240 chars)
- ✅ Include risk score, severity breakdown, critical dependencies, top recommendations, package versions, fixed versions, latest versions, and vulnerability summaries
- ✅ Keep AI input limited to already verified OSV and npm Registry data
- ✅ Exclude unnecessary raw data from the AI prompt

### Step 2 — Backend AI security assessment generation

Status: done

Tasks:

- ✅ Add server-side AI assessment generation module (`features/package-analysis/server/ai/`)
- ✅ Generate a project-level security assessment
- ✅ Generate simple-language risk explanation
- ✅ Generate repair priorities
- ✅ Generate reasoning for why selected packages should be fixed first
- ✅ Generate recommendations for selected dependencies
- ✅ Add fallback behavior when AI generation fails (`AIAssessmentError`, 502/503 responses)
- ✅ Keep the technical report available even if AI generation fails (separate endpoint `POST /api/ai-assessment`)

### Step 3 — UI: add AI Security Assessment section

Status: planned

Tasks:

- Add `AI Security Assessment` section to the report view
- Display general project assessment
- Display simple-language risk explanation
- Display prioritized repair actions
- Display explanations for selected high-priority packages
- Display dependency-level AI recommendations when useful
- Add loading and error states
- Add required UI strings to `locales/en.ts`

### Step 4 — Analyze View update

Status: planned

Tasks:

- Add `Generating AI-based security assessment` step to the Analyze view
- Clearly separate technical analysis from AI-assisted assessment
- Show the normal technical report even if AI generation fails

Recommended branch:

```bash
feat/ai-security-assessment
```

### Post-MVP — AI assessment optimizations

Status: not in MVP scope. Consider after thesis stabilization.

Possible improvements:

- Key-based response cache (hash of `AIInput` → cached `AISecurityAssessment`) to avoid repeated LLM calls for identical reports. Storage options: in-memory LRU for short-lived dev runs, or Redis / Vercel KV for production deployments.
- Streaming responses (SSE) to improve perceived latency in the UI.
- Per-user / per-IP rate limiting on `/api/ai-assessment` to control LLM cost exposure.
- Structured output validation with a runtime schema validator (e.g. `zod`) to harden parsing of LLM JSON responses.
- Telemetry for token usage and assessment latency.

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

These integrations are not part of the current engineering thesis MVP scope. They should be considered after the core MVP is completed and stabilized.

Current data sources and references:

- OSV API is used as the primary vulnerability data source
- npm Registry API is used for package metadata and latest version information
- OSV, GHSA, and NVD links are used as external references for vulnerability verification

Future integrations should focus on data enrichment, not on replacing the current OSV-based analysis flow.

Potential future integrations:

- GitHub Advisory Database API for additional GHSA advisory metadata, affected version ranges, patched versions, publication dates, and source references
- NVD API for additional CVE metadata, CVSS details, CWE classification, publication dates, modification dates, and official vulnerability descriptions
- Snyk API for additional vulnerability intelligence, if API access and licensing conditions make it practical

Planned enrichment approach:

- Keep OSV API as the primary vulnerability detection source
- Use additional APIs only to enrich already detected vulnerabilities
- Match enriched data by CVE ID, GHSA ID, or OSV aliases
- Display enriched data inside expanded vulnerability details
- Keep one unified risk score instead of separate scores per external source
- Clearly show which data source provided each piece of additional information

These integrations may be considered for future development, for example as part of a master's thesis extension.
