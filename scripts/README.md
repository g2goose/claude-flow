# GitHub Issues Creation Scripts

This directory contains scripts to automatically create GitHub issues from the `GITHUB_ISSUES_TO_CREATE.md` file, with each issue assigned to @copilot as requested.

## Available Scripts

### 1. Node.js Script (`create-github-issues.js`)
- **Full-featured script** with advanced parsing and error handling
- Supports both GitHub CLI and GitHub API methods
- Detailed logging and progress tracking
- Robust error handling and retry logic

### 2. Bash Script (`create-github-issues.sh`)
- **Simple and reliable** shell script alternative
- Uses GitHub CLI exclusively
- Lightweight with minimal dependencies
- Easy to understand and modify

## Prerequisites

### For GitHub CLI Method (Recommended)
```bash
# Install GitHub CLI
# macOS
brew install gh

# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Windows
winget install --id GitHub.cli

# Authenticate
gh auth login
```

### For GitHub API Method (Node.js script only)
```bash
# Set environment variable
export GITHUB_TOKEN="your_github_token_here"
```

## Usage

### Quick Start (Bash Script - Recommended)
```bash
# 1. Test first (dry run)
./scripts/create-github-issues.sh --dry-run

# 2. Create issues
./scripts/create-github-issues.sh
```

### Advanced Usage (Node.js Script)
```bash
# 1. Test parsing and preview issues
node scripts/create-github-issues.js --dry-run

# 2. Create issues using GitHub CLI (default)
node scripts/create-github-issues.js

# 3. Create issues using GitHub API
GITHUB_TOKEN="your_token" node scripts/create-github-issues.js --method=api
```

## What Issues Will Be Created

The scripts will create **6 GitHub issues** based on `GITHUB_ISSUES_TO_CREATE.md`:

1. **[CRITICAL]** CI/CD Pipeline failing with 1078 TypeScript compilation errors
   - Labels: `bug`, `high-priority`, `ci/cd`, `typescript`
   - Assignee: `@copilot`

2. **[HIGH]** Verification Pipeline tests failing with type compilation errors
   - Labels: `bug`, `high-priority`, `testing`, `verification`
   - Assignee: `@copilot`

3. **[MEDIUM]** Truth Scoring Pipeline likely failing due to verification system dependencies
   - Labels: `bug`, `medium-priority`, `verification`, `truth-scoring`
   - Assignee: `@copilot`

4. **[MEDIUM]** Integration Tests infrastructure needs reorganization
   - Labels: `bug`, `medium-priority`, `testing`, `infrastructure`
   - Assignee: `@copilot`

5. **[MEDIUM]** Docker Build workflow failing due to TypeScript compilation issues
   - Labels: `bug`, `medium-priority`, `docker`, `build`
   - Assignee: `@copilot`

6. **[LOW]** Status Badge and Rollback Manager workflows need verification
   - Labels: `enhancement`, `low-priority`, `workflows`
   - Assignee: `@copilot`

## Features

### Node.js Script Features
- ✅ Parses `GITHUB_ISSUES_TO_CREATE.md` automatically
- ✅ Extracts titles, descriptions, labels, and assignees
- ✅ Supports both GitHub CLI and API methods
- ✅ Comprehensive error handling and retry logic
- ✅ Rate limiting protection
- ✅ Detailed progress reporting
- ✅ Dry run mode for testing

### Bash Script Features
- ✅ Simple and reliable GitHub CLI integration
- ✅ Pre-structured issue content for consistency
- ✅ Built-in rate limiting
- ✅ Error checking and validation
- ✅ Dry run mode for testing
- ✅ Easy to understand and modify

## Safety Features

Both scripts include:
- **Dry run mode** to preview before creating issues
- **Authentication checks** before attempting to create issues
- **Rate limiting** to avoid hitting GitHub API limits
- **Error handling** for network issues and API errors
- **Repository validation** to ensure correct target

## Troubleshooting

### Authentication Issues
```bash
# Check GitHub CLI authentication
gh auth status

# Re-authenticate if needed
gh auth login

# For API method, verify token
echo $GITHUB_TOKEN
```

### Permission Issues
Ensure your GitHub account has:
- Read/write access to the repository
- Permission to create issues
- Permission to assign users (for @copilot assignment)

### Rate Limiting
If you hit rate limits:
- Wait for the limit to reset (usually 1 hour)
- Use the built-in delays between requests
- Consider using a GitHub token with higher limits

## Manual Issue Creation

If the scripts don't work for any reason, you can manually create issues using:

```bash
# Example for Issue #1
gh issue create \
  --repo "g2goose/claude-flow" \
  --title "[CRITICAL] CI/CD Pipeline failing with 1078 TypeScript compilation errors" \
  --body "$(cat GITHUB_ISSUES_TO_CREATE.md | sed -n '/## 🔴 Issue #1:/,/## 🔴 Issue #2:/p' | head -n -1)" \
  --label "bug,high-priority,ci/cd,typescript" \
  --assignee "copilot"
```

## Repository Context

- **Repository**: `g2goose/claude-flow`
- **Source File**: `GITHUB_ISSUES_TO_CREATE.md`
- **Target Assignee**: `@copilot` (as requested)
- **Issue Count**: 6 issues total
- **Priority Order**: Critical → High → Medium → Low

## Success Metrics

After running the scripts successfully, you should see:
- 6 new GitHub issues created
- Each issue assigned to @copilot
- Proper labels applied to each issue
- Issues numbered according to the priority order
- Links to the created issues for verification