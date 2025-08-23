# Creating GitHub Issues for Workflow Failures

This repository includes automated scripts to create GitHub issues from the `GITHUB_ISSUES_TO_CREATE.md` file. Each issue will be assigned to @g2goose (repository owner).

## Quick Start

### Option 1: Interactive Script (Easiest)
```bash
# Run the interactive script
./scripts/create-issues.sh
```

### Option 2: Direct Scripts
```bash
# Preview first (dry run)
npm run create-issues:dry-run

# Create issues using Node.js script
npm run create-issues

# Create issues using Bash script
npm run create-issues:bash
```

### Option 3: Manual Execution
```bash
# Test with Node.js script
node scripts/create-github-issues.js --dry-run

# Create issues
node scripts/create-github-issues.js

# Or use bash script
./scripts/create-github-issues.sh --dry-run
./scripts/create-github-issues.sh
```

## Prerequisites

1. **GitHub CLI Authentication**
   ```bash
   # Install GitHub CLI (if not already installed)
   # macOS: brew install gh
   # Ubuntu: apt install gh
   # Windows: winget install GitHub.cli
   
   # Authenticate
   gh auth login
   ```

2. **Repository Access**
   - Ensure you have write access to `g2goose/claude-flow`
   - Permission to create issues and assign users

## What Will Be Created

The scripts will create **6 GitHub issues** with the following details:

| Priority | Title | Labels | Assignee |
|----------|-------|--------|----------|
| 🔴 CRITICAL | CI/CD Pipeline failing with 1078 TypeScript compilation errors | `bug`, `high-priority`, `ci/cd`, `typescript` | @g2goose |
| 🔴 HIGH | Verification Pipeline tests failing with type compilation errors | `bug`, `high-priority`, `testing`, `verification` | @g2goose |
| 🟡 MEDIUM | Truth Scoring Pipeline likely failing due to verification system dependencies | `bug`, `medium-priority`, `verification`, `truth-scoring` | @g2goose |
| 🟡 MEDIUM | Integration Tests infrastructure needs reorganization | `bug`, `medium-priority`, `testing`, `infrastructure` | @g2goose |
| 🟡 MEDIUM | Docker Build workflow failing due to TypeScript compilation issues | `bug`, `medium-priority`, `docker`, `build` | @g2goose |
| 🟢 LOW | Status Badge and Rollback Manager workflows need verification | `enhancement`, `low-priority`, `workflows` | @g2goose |

## Available Scripts

- `npm run create-issues` - Create issues using Node.js script
- `npm run create-issues:bash` - Create issues using Bash script  
- `npm run create-issues:interactive` - Interactive creation with prompts
- `npm run create-issues:dry-run` - Preview issues without creating them

## Files Created

- `scripts/create-github-issues.js` - Advanced Node.js script with full parsing
- `scripts/create-github-issues.sh` - Simple Bash script using GitHub CLI
- `scripts/create-issues.sh` - Interactive script with user prompts
- `scripts/README.md` - Detailed documentation for the scripts

## Safety Features

- **Dry run mode** - Preview issues before creating
- **Authentication checks** - Verify GitHub CLI access
- **Rate limiting** - Prevent API limit issues
- **Error handling** - Graceful failure handling
- **Repository validation** - Ensure correct target repo

## Verification

After running the scripts, verify the issues were created:

1. Visit https://github.com/g2goose/claude-flow/issues
2. Check that 6 new issues exist
3. Verify each issue is assigned to @g2goose
4. Confirm proper labels are applied

## Troubleshooting

### Authentication Issues
```bash
# Check authentication status
gh auth status

# Re-authenticate if needed
gh auth login
```

### Permission Issues
- Ensure your GitHub account has repository write access
- Verify you can assign issues to @g2goose
- Check that @g2goose is a valid assignee for the repository

### Script Issues
- Ensure you're in the repository root directory
- Check that `GITHUB_ISSUES_TO_CREATE.md` exists
- Verify Node.js is installed (for Node.js scripts)

## Manual Creation (Fallback)

If scripts fail, create issues manually:

```bash
gh issue create \
  --repo "g2goose/claude-flow" \
  --title "[CRITICAL] CI/CD Pipeline failing with 1078 TypeScript compilation errors" \
  --body "Content from GITHUB_ISSUES_TO_CREATE.md Issue #1" \
  --label "bug,high-priority,ci/cd,typescript" \
  --assignee "g2goose"
```

## Repository Context

- **Target Repository**: `g2goose/claude-flow`
- **Source Document**: `GITHUB_ISSUES_TO_CREATE.md`
- **Assignee**: `@g2goose` (repository owner)
- **Total Issues**: 6 workflow failure issues
- **Priority Order**: Critical → High → Medium → Low

---

**Note**: These scripts have been updated to assign issues to @g2goose (repository owner) instead of the non-existent "copilot" user to fix the GraphQL assignment error.