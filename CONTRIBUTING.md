# Contributing to Eventbrite MCP Server

Thank you for your interest in contributing to the Eventbrite MCP Server! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow. Please be respectful and constructive in all interactions.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Set up the development environment
4. Create a new branch for your changes
5. Make your changes
6. Test your changes
7. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- An Eventbrite API token for testing

### Installation

1. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/eventbrite-mcp-server.git
cd eventbrite-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your Eventbrite API token
```

4. Build the project:
```bash
npm run build
```

5. Run tests:
```bash
npm test
```

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-new-tool` for new features
- `fix/handle-api-errors` for bug fixes
- `docs/update-readme` for documentation updates

### Code Style

- Use TypeScript for all new code
- Follow existing code formatting
- Add JSDoc comments for public functions
- Use meaningful variable and function names

### Testing

- Add tests for new functionality
- Ensure all existing tests pass
- Test with real Eventbrite API when possible
- Include error handling tests

### Documentation

- Update README.md if adding new features
- Add JSDoc comments for new functions
- Update examples if changing API

## Submitting Changes

### Pull Request Process

1. Update your branch with the latest main:
```bash
git checkout main
git pull upstream main
git checkout your-branch
git rebase main
```

2. Ensure all tests pass:
```bash
npm test
npm run build
```

3. Create a pull request with:
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Reference any related issues
   - Screenshots if applicable

### Pull Request Guidelines

- Keep changes focused and atomic
- Write clear commit messages
- Include tests for new functionality
- Update documentation as needed
- Ensure CI passes

## Reporting Issues

When reporting issues, please include:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node.js version, OS, etc.)
- Error messages or logs
- Minimal code example if applicable

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or improvement
- `documentation` - Documentation needs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed

## Feature Requests

We welcome feature requests! Please:

1. Check if the feature already exists or is planned
2. Open an issue with the `enhancement` label
3. Describe the use case and expected behavior
4. Discuss the implementation approach
5. Consider contributing the feature yourself

## Development Guidelines

### Adding New Tools

When adding new Eventbrite API tools:

1. Add the tool definition to the `tools` array in `index.ts`
2. Implement the handler in the `handleToolCall` function
3. Add proper error handling
4. Include JSDoc documentation
5. Add tests for the new tool
6. Update README.md with usage examples

### Error Handling

- Use descriptive error messages
- Handle API rate limits gracefully
- Validate input parameters
- Log errors appropriately
- Return meaningful error responses

### API Integration

- Follow Eventbrite API best practices
- Handle pagination for list operations
- Respect rate limits
- Use appropriate HTTP methods
- Validate API responses

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a release tag
4. Publish to npm (maintainers only)

## Getting Help

- Open an issue for bugs or feature requests
- Check existing issues and documentation
- Join discussions in pull requests
- Contact maintainers for questions

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributors page

Thank you for contributing to the Eventbrite MCP Server! 