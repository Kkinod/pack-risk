# Pack Risk

Pack Risk is a web application for analyzing security risks in JavaScript/Node.js project dependencies based on a `package.json` file.

The project is developed as part of an engineering thesis in Computer Science, specialization in Cybersecurity.

## Project Overview

The application helps users quickly understand potential risks related to project dependencies without requiring them to set up or run the analyzed project locally.

Users provide a `package.json` file or paste its content. The application validates the manifest, extracts dependency information, cross-references packages against public vulnerability databases, calculates a risk score, and presents the results in a structured report. An optional AI-assisted security assessment can be generated on top of the technical report.

The target users are mainly developers, but the report is designed to be understandable for less technical users such as project managers or testers.

## Features

- Upload or paste `package.json` content
- Parse and validate the package manifest
- Query the [OSV API](https://osv.dev) for known vulnerabilities across all dependencies
- Fetch latest package versions from the npm Registry
- Calculate an algorithmic risk score (0–100) based on severity weights
- Display a structured report with severity breakdown, dependency table, and recommendations
- Most Important Issues section highlighting critical packages
- Report Summary with top recommendations
- Expandable dependency rows with CVE details, advisory links (OSV, GHSA, NVD), and impact descriptions
- Export report as JSON or PDF
- Optional AI Security Assessment — generates executive summary, prioritized action plan with effort and breaking-change estimates, cross-package reasoning, and strategic recommendations using the OpenAI API

## Tech Stack

- Next.js 16 (App Router, API routes)
- React 19
- TypeScript 5
- TanStack Query 5
- Zod 4
- SCSS Modules (Sass)
- @react-pdf/renderer 4
- Vitest 4
- MSW 2
- ESLint 9
- Prettier 3
- Husky
- pnpm

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Run tests:

```bash
pnpm test
```

Run type checking:

```bash
pnpm typecheck
```

Run linting:

```bash
pnpm lint
```

Build the application:

```bash
pnpm build
```

## Environment Variables

The application works without any environment variables. The AI Security Assessment module is optional and requires an OpenAI API key to function.

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable         | Required | Description                                                                                             |
| ---------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `OPENAI_API_KEY` | No       | OpenAI API key. Without it, the AI module returns 503 and the technical report remains fully available. |
| `OPENAI_MODEL`   | No       | OpenAI model to use. Defaults to `gpt-4o-mini`.                                                         |

## Project Structure

```
app/                          # Next.js App Router pages and API routes
  api/analyze/                # POST /api/analyze — dependency analysis endpoint
  api/ai-assessment/          # POST /api/ai-assessment — AI assessment endpoint
components/                   # Shared reusable components
features/
  package-analysis/
    api/                      # React Query mutation hooks (useAnalyze, useAIAssessment)
    server/                   # Server-side analysis logic
      clients/                # OSV API and npm Registry clients
      ai/                     # AI assessment module
    utils/                    # Export utilities (JSON, PDF)
    views/                    # UI views (Upload, Loading, Dashboard)
    types.ts                  # Shared TypeScript types
lib/
  http/                       # Shared HTTP client with retry and timeout
  concurrency.ts              # Concurrency pool utility
locales/
  en.ts                       # All UI strings (single source of truth)
docs/                         # Project documentation
tests/                        # Integration tests
```

## Project Documentation

- [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) — current implementation status, completed features, and priorities
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — development roadmap and milestone history
- [`CHANGELOG.md`](CHANGELOG.md) — version history

## Thesis Context

This project is created as part of an engineering thesis focused on cybersecurity and software dependency risk analysis.

The application demonstrates the design and implementation of a web-based system supporting dependency risk assessment in JavaScript/Node.js projects, including integration with public vulnerability databases (OSV API, npm Registry) and an optional AI-assisted interpretation layer.

## License

This project is licensed under the MIT License.
