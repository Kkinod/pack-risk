# Testing Guidelines

This document defines the testing approach for backend-related logic in the Pack Risk project.

The goal is to keep tests focused, useful, and maintainable. Tests should verify real application logic, especially dependency analysis, vulnerability processing, risk scoring, and API behavior.

## Testing Scope

For the engineering thesis MVP, focus primarily on backend and server-side logic.

Prioritize tests for:

- package manifest parsing
- dependency extraction
- vulnerability data normalization
- severity classification
- risk score calculation
- recommendation generation
- external API clients with mocked responses
- `/api/analyze` integration flow

Frontend/UI tests are not a priority at this stage unless they cover critical behavior.

## Preferred Testing Tools

Use:

- Vitest for unit and integration tests
- MSW for mocking external API calls
- TypeScript-based test files

Do not call real external APIs in automated tests.

External services such as OSV API and npm Registry API should always be mocked.

## Test File Structure

Prefer keeping unit tests close to the backend module they test.

Example structure:

```txt
features/package-analysis/server/
├─ parseManifest.ts
├─ parseManifest.test.ts
├─ buildReport.ts
├─ buildReport.test.ts
├─ clients/
│  ├─ osv.ts
│  ├─ osv.test.ts
│  ├─ npm.ts
│  └─ npm.test.ts
```

For broader API flow tests, use:

```txt
tests/integration/
└─ analyze-api.test.ts
```

## Naming Convention

Use the following naming pattern:

```txt
*.test.ts
```

Examples:

```txt
parseManifest.test.ts
buildReport.test.ts
osv.test.ts
npm.test.ts
analyze-api.test.ts
```

## Unit Test Rules

Unit tests should focus on one module or function at a time.

Good candidates for unit tests:

- valid `package.json` parsing
- invalid JSON handling
- empty dependency sections
- dependency extraction from:
  - `dependencies`
  - `devDependencies`
  - `peerDependencies`
  - `optionalDependencies`
- semver range normalization
- severity mapping
- risk score calculation
- recommendation text generation
- partial results handling

Unit tests should not depend on network access, file system state, or real external APIs.

## API Client Test Rules

API client tests should mock external responses.

For OSV API client tests, cover:

- successful batch vulnerability response
- empty vulnerability response
- vulnerability detail fetching
- upstream API error
- timeout
- malformed response
- partial failure handling

For npm Registry API client tests, cover:

- successful latest version fetch
- scoped package name encoding
- missing package response
- timeout
- malformed response
- partial failure handling

## Integration Test Rules

Integration tests should verify how multiple backend modules work together.

The most important integration target is:

```txt
POST /api/analyze
```

Recommended test cases:

- returns a valid report for a valid `package.json`
- returns validation error for invalid JSON
- returns validation error when no dependencies are found
- returns dependency data with OSV vulnerability results
- returns partial results when some external calls fail
- calculates risk score based on mocked vulnerability data
- does not use mock report data as a fallback

Integration tests should mock OSV API and npm Registry API responses.

## What Not To Test Now

Do not prioritize tests for areas that are not critical for validating the backend analysis logic or the engineering thesis MVP.

Examples:

- visual UI details
- animations
- exact CSS classes
- full end-to-end browser tests
- generated recommendation quality

## Future Testing Scope

Add tests for the following areas only after they become part of the active project scope:

- authentication
- database-related behavior
- analysis history
- user accounts
- saved reports

## Test Quality Rules

Tests should be readable and focused.

Prefer clear arrange-act-assert structure.

Each test should verify one specific behavior.

Do not create tests only to increase coverage numbers.

Do not add comments to test code unless absolutely necessary.

Use descriptive test names.

Example:

```ts
it("extracts dependencies from all supported package.json dependency sections", () => {});
```

## Required Test Coverage Before Completing Backend Features

For every new backend feature, add tests for:

- successful path
- invalid input
- empty result or no-data scenario
- external API failure if applicable
- partial result behavior if applicable
- edge case related to the feature

A backend feature should not be considered complete until its core logic is covered by tests.
