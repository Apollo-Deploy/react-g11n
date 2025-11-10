# Contributing to React G11n

Thank you for your interest in contributing to React G11n! We welcome contributions from the community and are grateful for your support.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your contribution
4. Make your changes
5. Push to your fork
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm

### Installation

```bash
# Clone your fork
git clone https://github.com/your-username/react-g11n.git
cd react-g11n

# Install dependencies
npm install

# Run tests to verify setup
npm test
```

### Available Scripts

```bash
# Development
npm run dev              # Watch mode for development

# Building
npm run build            # Build ESM, CJS, and type declarations
npm run build:esm        # Build ES modules only
npm run build:cjs        # Build CommonJS only
npm run build:types      # Generate TypeScript declarations only

# Testing
npm test                 # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Run tests with coverage report

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically
npm run format           # Format code with Prettier
npm run type-check       # Run TypeScript type checking

# Cleanup
npm run clean            # Remove build artifacts
```

## Project Structure

```
react-g11n/
├── src/
│   ├── core/              # Core services (framework-agnostic)
│   ├── react/             # React-specific components and hooks
│   ├── utils/             # Utility functions
│   ├── standalone.ts      # Standalone API
│   ├── types.ts           # Type definitions
│   └── index.ts           # Main entry point
├── tests/
│   ├── unit/              # Unit tests
│   ├── fixtures/          # Test fixtures
│   └── utils/             # Test utilities
├── examples/              # Example applications
└── dist/                  # Build output (gitignored)
```

## Coding Standards

### TypeScript

- Use TypeScript for all source code
- Enable strict mode
- Provide explicit types for public APIs
- Use type inference for internal implementation details
- Avoid `any` type unless absolutely necessary

### Code Style

We use ESLint and Prettier to enforce consistent code style:

```typescript
// Good
export function formatDate(date: Date, format: DateFormat): string {
  // Implementation
}

// Bad
export function formatDate(date: any, format: any) {
  // Implementation
}
```

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `locale-manager.ts`)
- **Classes**: `PascalCase` (e.g., `LocaleManager`)
- **Functions**: `camelCase` (e.g., `formatDate`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_LOCALE`)
- **Interfaces/Types**: `PascalCase` (e.g., `I18nConfig`)

### Comments and Documentation

- Use JSDoc comments for all public APIs
- Include examples in JSDoc when helpful
- Keep comments concise and meaningful
- Update documentation when changing behavior

```typescript
/**
 * Formats a date according to the current locale.
 *
 * @param date - The date to format
 * @param format - The format style ('short', 'medium', 'long', 'full')
 * @returns The formatted date string
 *
 * @example
 * ```typescript
 * formatDate(new Date(), 'long')
 * // Returns: "January 15, 2024"
 * ```
 */
export function formatDate(date: Date, format: DateFormat): string {
  // Implementation
}
```

## Testing

### Writing Tests

- Write tests for all new features
- Update tests when modifying existing features
- Aim for high test coverage (>80%)
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from '../core/format-service';

describe('formatDate', () => {
  it('should format date in short format', () => {
    // Arrange
    const date = new Date('2024-01-15');
    
    // Act
    const result = formatDate(date, 'short');
    
    // Assert
    expect(result).toBe('1/15/24');
  });
});
```

### Test Organization

- Place unit tests in `tests/unit/`
- Use test fixtures from `tests/fixtures/`
- Use test utilities from `tests/utils/`
- Group related tests with `describe` blocks

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- locale-manager.test.ts

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:run
```

## Pull Request Process

### Before Submitting

1. Ensure all tests pass: `npm run test:run`
2. Run linting: `npm run lint`
3. Run type checking: `npm run type-check`
4. Update documentation if needed
5. Add tests for new features
6. Update CHANGELOG.md with your changes

### PR Guidelines

1. **Title**: Use a clear, descriptive title
   - Good: "Add support for custom interpolation delimiters"
   - Bad: "Fix bug"

2. **Description**: Include:
   - What changes were made
   - Why the changes were necessary
   - Any breaking changes
   - Related issue numbers

3. **Commits**: 
   - Use meaningful commit messages
   - Follow conventional commits format when possible
   - Keep commits focused and atomic

4. **Size**: Keep PRs reasonably sized
   - Large changes should be discussed in an issue first
   - Consider breaking large PRs into smaller ones

### PR Template

When you create a PR, please include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing performed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] CHANGELOG.md updated
```

### Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be included in the next release

## Reporting Bugs

### Before Reporting

1. Check if the bug has already been reported
2. Verify you're using the latest version
3. Try to reproduce with a minimal example

### Bug Report Template

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:

- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, React version)
- Code samples or screenshots

## Suggesting Features

### Before Suggesting

1. Check if the feature has already been requested
2. Consider if it fits the project scope
3. Think about how it would benefit other users

### Feature Request Template

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) and include:

- Clear description of the feature
- Use cases and benefits
- Proposed API or implementation ideas
- Alternatives considered

## Documentation

### Types of Documentation

1. **Code Documentation**: JSDoc comments in source code
2. **README**: Overview, quick start, and basic usage
3. **Examples**: Working code examples in `examples/`
4. **API Reference**: Detailed API documentation

### Documentation Guidelines

- Keep documentation up-to-date with code changes
- Use clear, concise language
- Include code examples
- Explain the "why" not just the "what"
- Consider different skill levels

### Building Documentation

```bash
# Generate API documentation (if applicable)
npm run docs:build

# Preview documentation locally
npm run docs:serve
```

## Release Process

Releases are handled by maintainers:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag
4. Push tag to trigger CI/CD
5. Publish to npm

## Getting Help

- **Questions**: Open a [GitHub Discussion](https://github.com/Apollo-Deploy/react-g11n/discussions)
- **Bugs**: Open a [GitHub Issue](https://github.com/Apollo-Deploy/react-g11n/issues)
- **Chat**: Join our community chat (if available)

## Recognition

Contributors will be recognized in:
- CHANGELOG.md for their contributions
- GitHub contributors page
- Release notes

Thank you for contributing to React G11n! 🎉
