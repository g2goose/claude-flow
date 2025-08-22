# GitHub Directory

This directory contains GitHub-specific configurations, workflows, and automation for the Claude Flow repository. It includes CI/CD pipelines, issue templates, pull request workflows, and repository automation.

## Table of Contents

1. [Workflows](#workflows) (CI/CD automation)
2. [Issue Templates](#issue-templates) (Bug reports and features)
3. [Pull Request Templates](#pull-request-templates) (PR guidelines)
4. [Repository Configuration](#repository-configuration) (Settings and rules)
5. [GitHub Actions](#github-actions) (Automation scripts)
6. [Quick Reference](#quick-reference)

---

## Workflows

### Continuous Integration
**Automated testing and validation on every push and pull request**
- Automated test execution across multiple Node.js versions
- Code quality checks and linting validation
- Security scanning and dependency audits
- Build verification and artifact generation

**Key Workflows:**
- **CI/CD Pipeline**: `.github/workflows/ci.yml`
- **Release Management**: `.github/workflows/release.yml`
- **Security Scanning**: `.github/workflows/security.yml`
- **Performance Testing**: `.github/workflows/performance.yml`
- **Documentation**: `.github/workflows/docs.yml`

### Deployment Automation
**Automated deployment and release management**
- NPM package publishing to alpha and stable channels
- Docker image building and registry publishing
- Documentation site deployment and updates
- Release notes generation and GitHub releases

**Deployment Triggers:**
- **Alpha Releases**: On push to `main` branch
- **Stable Releases**: On version tag creation
- **Hotfixes**: On push to `hotfix/*` branches
- **Documentation**: On changes to `docs/` directory

---

## Issue Templates

### Bug Report Template
**Standardized bug reporting for consistent issue tracking**
```markdown
## Bug Description
A clear and concise description of the bug.

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- Claude Flow Version: [e.g., 2.0.0-alpha.90]
- Node.js Version: [e.g., 18.17.0]
- Operating System: [e.g., macOS 13.4]
- Package Manager: [e.g., npm 9.8.1]

## Additional Context
Any additional information or screenshots.
```

### Feature Request Template
**Structured feature requests for new functionality**
```markdown
## Feature Summary
A clear and concise description of the proposed feature.

## Use Case
Describe the problem this feature would solve.

## Proposed Solution
Describe your proposed implementation approach.

## Alternatives Considered
Other approaches you've considered.

## Implementation Details
Technical considerations and requirements.

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2
- [ ] Criteria 3
```

### Documentation Request Template
**Template for documentation improvements and additions**
```markdown
## Documentation Request
What documentation needs to be added or improved?

## Current State
What documentation currently exists (if any)?

## Proposed Changes
What should be added, changed, or improved?

## Target Audience
Who is the intended audience for this documentation?

## Priority
- [ ] High - Critical for users
- [ ] Medium - Important for adoption
- [ ] Low - Nice to have
```

---

## Pull Request Templates

### Standard PR Template
**Guidelines for all pull requests**
```markdown
## Description
Brief description of the changes in this PR.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Performance impact assessed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated if needed
- [ ] No breaking changes (or clearly documented)
- [ ] Tests added for new functionality

## Related Issues
Closes #(issue number)
Related to #(issue number)
```

### Release PR Template
**Template for release pull requests**
```markdown
## Release Summary
Version: [e.g., 2.0.0-alpha.91]
Release Date: [e.g., 2024-01-15]

## Changes Included
### Features
- Feature 1 description
- Feature 2 description

### Bug Fixes
- Bug fix 1 description
- Bug fix 2 description

### Documentation
- Documentation update 1
- Documentation update 2

## Breaking Changes
- [ ] No breaking changes
- [ ] Breaking changes documented below:

## Release Checklist
- [ ] Version bumped in package.json
- [ ] CHANGELOG.md updated
- [ ] Documentation updated
- [ ] Tests passing
- [ ] Alpha testing completed
- [ ] Security review completed
```

---

## Repository Configuration

### Branch Protection Rules
**Automated protection for critical branches**
- **Main Branch**: Requires PR reviews, status checks, and up-to-date branches
- **Release Branches**: Additional protection with admin approval required
- **Hotfix Branches**: Fast-track protection with reduced requirements

### Status Checks
**Required checks before merging**
- All CI tests must pass
- Code coverage threshold met
- Security scan completed
- Documentation build successful
- Performance regression check passed

### Repository Settings
```yaml
# Repository configuration
settings:
  has_issues: true
  has_projects: true
  has_wiki: false
  has_downloads: true
  default_branch: main
  allow_squash_merge: true
  allow_merge_commit: false
  allow_rebase_merge: true
  delete_branch_on_merge: true
```

---

## GitHub Actions

### Custom Actions
**Reusable workflow components**
- **Setup Claude Flow**: Common setup steps for CI workflows
- **Test Runner**: Standardized test execution with reporting
- **Security Scanner**: Automated security and vulnerability scanning
- **Performance Benchmarker**: Performance regression testing
- **Release Publisher**: Automated package and release publishing

### Workflow Utilities
```yaml
# Setup Claude Flow action
- name: Setup Claude Flow
  uses: ./.github/actions/setup
  with:
    node-version: '18'
    cache-dependencies: true
    install-dependencies: true

# Run tests with coverage
- name: Run Tests
  uses: ./.github/actions/test-runner
  with:
    test-type: 'all'
    coverage: true
    upload-results: true
```

### Environment Secrets
**Secure configuration for automated workflows**
- `NPM_TOKEN`: NPM registry authentication
- `DOCKER_TOKEN`: Docker registry authentication
- `CODECOV_TOKEN`: Code coverage reporting
- `SLACK_WEBHOOK`: Notification integration
- `GITHUB_TOKEN`: Repository automation (auto-provided)

---

## Quick Reference

### Workflow Triggers
```yaml
# Common trigger patterns
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  release:
    types: [published]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
```

### Common Workflow Commands
```bash
# Trigger workflow manually
gh workflow run ci.yml

# View workflow status
gh run list

# Download workflow artifacts
gh run download <run-id>

# View workflow logs
gh run view <run-id>
```

### Issue Management
```bash
# Create issue from template
gh issue create --template bug_report.md

# List open issues
gh issue list --state open

# Assign issue
gh issue edit <issue-number> --assignee username

# Close issue
gh issue close <issue-number>
```

### Pull Request Management
```bash
# Create PR
gh pr create --template pull_request_template.md

# List PRs
gh pr list

# Review PR
gh pr review <pr-number> --approve

# Merge PR
gh pr merge <pr-number> --squash
```

### Release Management
```bash
# Create release
gh release create v2.0.0-alpha.91 --generate-notes

# Upload release assets
gh release upload v2.0.0-alpha.91 dist/*.tar.gz

# List releases
gh release list
```

### Repository Automation
- **Auto-assign**: Automatically assign PRs to team members
- **Label Management**: Automatic labeling based on file changes
- **Stale Issue Management**: Automatic closure of inactive issues
- **Dependency Updates**: Automated dependency update PRs
- **Security Alerts**: Automatic security vulnerability notifications

### Best Practices
- **Clear Descriptions**: Use descriptive commit messages and PR descriptions
- **Small PRs**: Keep pull requests focused and manageable
- **Test Coverage**: Maintain high test coverage for all changes
- **Documentation**: Update documentation for feature changes
- **Security**: Regular security scans and dependency updates
- **Performance**: Monitor performance impact of changes

---

*Last Updated: ${new Date().toISOString()}*

This GitHub directory provides comprehensive repository automation, ensuring consistent development workflows and high-quality releases for Claude Flow.