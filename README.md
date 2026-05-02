# Pack Risk

Pack Risk is a web application for analyzing security risks in JavaScript/Node.js project dependencies based on a `package.json` file.

The project is developed as part of an engineering thesis in Computer Science, specialization in Cybersecurity.

## Project Overview

The main goal of the application is to help users quickly understand potential risks related to project dependencies without requiring them to set up or run the analyzed project locally.

The application allows users to provide a `package.json` file or its content, validate its structure, extract dependency information, analyze potential security risks, and present the results in a clear and understandable report.

The target users are mainly developers, but the application should also be understandable for less technical users, such as project managers, testers, or people who want to quickly assess dependency-related risk in a project.

## Core Features

- Upload or paste `package.json` content
- Validate package manifest structure
- Extract dependencies from the provided file
- Analyze dependency-related security risks
- Display dependency risk summary
- Present results in a clear report view
- Support future extension with scoring, AI-based interpretation, and update recommendations

## Tech Stack

- Next.js
- TypeScript
- SCSS Modules
- pnpm
- ESLint
- Husky

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
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

## Project Structure

```txt
app/                         # Next.js App Router pages and API routes
components/                  # Shared reusable components
features/                    # Feature-based application modules
features/package-analysis/   # Main feature for package.json analysis
public/                      # Static assets
```

## Development Guidelines

The application is developed with a modular structure.

Code should be split into smaller components, hooks, utilities, and modules when it improves readability, maintainability, testability, or reusability.

The project follows a use-case-oriented structure rather than grouping code only by generic domain nouns. For example, modules should be organized around responsibilities such as package validation, dependency analysis, risk calculation, report generation, and result presentation.

## Future Development

The current version is focused on the engineering thesis scope, but the architecture should allow further development in the future.

Possible future extensions include:

- Advanced dependency risk scoring
- AI-based vulnerability interpretation
- Dependency update recommendations
- Analysis history
- More detailed reporting
- Support for additional package ecosystems
- Integration with external vulnerability databases

## Thesis Context

This project is created as part of an engineering thesis focused on cybersecurity and software dependency risk analysis.

The application is intended to demonstrate the design and implementation of a web-based system supporting dependency risk assessment in JavaScript/Node.js projects.

## Changelog

All notable changes to this project will be documented in this section.

### Unreleased

#### Added

- Initial Next.js project setup
- TypeScript configuration
- SCSS Modules setup
- Basic project structure
- Husky pre-commit configuration

#### Changed

- Replaced Tailwind CSS with SCSS Modules

#### Removed

- Removed unused Tailwind CSS configuration

## License

This project is licensed under the MIT License.

```

```
