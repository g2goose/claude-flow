# Claude Flow Scripts Directory

This directory contains utility scripts for building, testing, deploying, and maintaining the Claude Flow project. The scripts are organized into categories to help developers find the right tool for their needs.

## Table of Contents

1. [GitHub Issues Management](#github-issues-management) (3 scripts)
2. [Build & TypeScript Fixes](#build--typescript-fixes) (15 scripts)  
3. [Docker Management](#docker-management) (4 scripts)
4. [Testing & Quality Assurance](#testing--quality-assurance) (10 scripts)
5. [Performance & Monitoring](#performance--monitoring) (6 scripts)
6. [Installation & Setup](#installation--setup) (4 scripts)
7. [Import & Code Fixes](#import--code-fixes) (6 scripts)
8. [Claude Flow Wrappers & Utilities](#claude-flow-wrappers--utilities) (5 scripts)
9. [Migration & Cleanup](#migration--cleanup) (4 scripts)
10. [Quick Reference](#quick-reference)

---

## GitHub Issues Management

Automated tools for creating and managing GitHub issues.

### `create-github-issues.js`
**Purpose**: Full-featured Node.js script for creating GitHub issues from markdown files  
**Type**: Node.js Script  

```bash
# Preview issues without creating them
node scripts/create-github-issues.js --dry-run

# Create issues using GitHub CLI (recommended)
node scripts/create-github-issues.js

# Create issues using GitHub API
GITHUB_TOKEN="your_token" node scripts/create-github-issues.js --method=api
```

**Features**:
- ✅ Parses `GITHUB_ISSUES_TO_CREATE.md` automatically
- ✅ Supports both GitHub CLI and API methods
- ✅ Comprehensive error handling and retry logic
- ✅ Rate limiting protection
- ✅ Detailed progress reporting

**Prerequisites**: GitHub CLI (`gh`) or `GITHUB_TOKEN` environment variable

### `create-github-issues.sh`
**Purpose**: Simple and reliable bash alternative for GitHub issue creation  
**Type**: Shell Script  

```bash
# Test first (dry run)
./scripts/create-github-issues.sh --dry-run

# Create issues
./scripts/create-github-issues.sh
```

**Features**:
- ✅ Simple GitHub CLI integration
- ✅ Pre-structured issue content
- ✅ Built-in rate limiting
- ✅ Easy to understand and modify

**Prerequisites**: GitHub CLI (`gh`) authenticated

### `create-issues.sh`
**Purpose**: Additional issue creation utility  
**Type**: Shell Script  

```bash
./scripts/create-issues.sh
```

---

## Build & TypeScript Fixes

Scripts for building the project and fixing TypeScript compilation errors.

### `build-with-filter.sh`
**Purpose**: Build script that filters out Deno deprecation warnings  
**Type**: Shell Script  

```bash
./scripts/build-with-filter.sh
```

**Features**:
- ✅ Works around Deno compile deprecation warnings
- ✅ Creates binary even if warnings occur
- ✅ Automatic bin directory creation

### `fix-typescript-errors.js`
**Purpose**: Categorizes and fixes common TypeScript errors in parallel  
**Type**: Node.js Script  

```bash
node scripts/fix-typescript-errors.js
```

**Features**:
- ✅ Fixes TS1361 (import type issues)
- ✅ Fixes TS2339 (property does not exist)
- ✅ Automated error categorization
- ✅ Parallel processing for speed

### `fix-ts-advanced.js`
**Purpose**: Advanced TypeScript error fixing with sophisticated patterns  
**Type**: Node.js Script  

```bash
node scripts/fix-ts-advanced.js
```

### `fix-ts-targeted-batch.js`
**Purpose**: Batch processing of targeted TypeScript fixes  
**Type**: Node.js Script  

```bash
node scripts/fix-ts-targeted-batch.js
```

### `fix-ts-comprehensive.py`
**Purpose**: Comprehensive TypeScript error analysis and fixes  
**Type**: Python Script  

```bash
python3 scripts/fix-ts-comprehensive.py
```

### `build-migration.sh`
**Purpose**: Handles build system migrations  
**Type**: Shell Script  

```bash
./scripts/build-migration.sh
```

### `build-workaround.sh`
**Purpose**: Alternative build approach for problematic environments  
**Type**: Shell Script  

```bash
./scripts/build-workaround.sh
```

### `safe-build.sh`
**Purpose**: Safe build with comprehensive error checking  
**Type**: Shell Script  

```bash
./scripts/safe-build.sh
```

### `force-build.sh`
**Purpose**: Force build ignoring minor errors  
**Type**: Shell Script  

```bash
./scripts/force-build.sh
```

### Additional Build Scripts
- `build-monitor.js` - Monitor build processes
- `build-prompt-copier.sh` - Copy build prompts
- `batch-fix-ts.sh` - Batch TypeScript fixes
- `fix-ts-final.sh` - Final TypeScript error cleanup
- `fix-ts-targeted.sh` - Targeted TypeScript fixes
- `quick-fix-ts.js` - Quick TypeScript error fixes

---

## Docker Management

Comprehensive Docker operations for Claude Flow deployment and management.

### `docker-manager.sh`
**Purpose**: Comprehensive Docker operations manager  
**Type**: Shell Script  

```bash
# Check prerequisites
./scripts/docker-manager.sh check

# Build Docker image
./scripts/docker-manager.sh build

# Run container
./scripts/docker-manager.sh run

# Clean up
./scripts/docker-manager.sh clean
```

**Features**:
- ✅ Multi-platform support
- ✅ Registry operations (ghcr.io)
- ✅ Comprehensive error checking
- ✅ Cleanup and maintenance

### `validate-docker-setup.sh`
**Purpose**: Validates Docker environment and configuration  
**Type**: Shell Script  

```bash
./scripts/validate-docker-setup.sh
```

**Features**:
- ✅ Docker installation verification
- ✅ Compose plugin checking
- ✅ Network configuration validation

### `setup-docker-env.sh` / `setup-docker-env.ps1`
**Purpose**: Environment setup for Docker operations  
**Type**: Shell Script / PowerShell Script  

```bash
# Linux/macOS
./scripts/setup-docker-env.sh

# Windows
./scripts/setup-docker-env.ps1
```

---

## Testing & Quality Assurance

Comprehensive testing and quality validation scripts.

### `test-comprehensive.js`
**Purpose**: Comprehensive test runner for all Claude Flow components  
**Type**: Node.js Script  

```bash
node scripts/test-comprehensive.js
```

**Features**:
- ✅ Unit tests execution
- ✅ Integration tests
- ✅ Performance benchmarks
- ✅ Configurable timeouts

### `test-runner.ts`
**Purpose**: TypeScript-based test orchestration  
**Type**: TypeScript Script  

```bash
deno run --allow-all scripts/test-runner.ts
```

### `test-swarm-integration.sh`
**Purpose**: Swarm system integration testing  
**Type**: Shell Script  

```bash
./scripts/test-swarm-integration.sh
```

### `test-mcp.ts`
**Purpose**: MCP (Model Context Protocol) testing  
**Type**: TypeScript Script  

```bash
deno run --allow-all scripts/test-mcp.ts
```

### `coverage-report.ts`
**Purpose**: Generate code coverage reports  
**Type**: TypeScript Script  

```bash
deno run --allow-all scripts/coverage-report.ts
```

### `check-performance-regression.ts`
**Purpose**: Performance regression detection  
**Type**: TypeScript Script  

```bash
deno run --allow-all scripts/check-performance-regression.ts
```

### `check-links.ts`
**Purpose**: Documentation link checker  
**Type**: TypeScript Script  

```bash
deno run --allow-net --allow-read scripts/check-links.ts
```

**Features**:
- ✅ Scans documentation for broken links
- ✅ Configurable timeout and concurrency
- ✅ Detailed reporting

### Additional Testing Scripts
- `validate-examples.ts` - Validate example code
- `validation-summary.ts` - Generate validation reports
- `test-claude-spawn-options.sh` - Test Claude spawn options

---

## Performance & Monitoring

Scripts for performance optimization and system monitoring.

### `claude-monitor.py`
**Purpose**: Claude usage monitoring and analytics  
**Type**: Python Script  

```bash
python3 scripts/claude-monitor.py
```

**Features**:
- ✅ Usage tracking with ccusage integration
- ✅ Timezone-aware reporting
- ✅ JSON output parsing
- ✅ Human-readable time formatting

### `optimize-performance.js`
**Purpose**: Automated performance optimization  
**Type**: Node.js Script  

```bash
node scripts/optimize-performance.js
```

### `performance-monitor.js`
**Purpose**: Real-time performance monitoring  
**Type**: Node.js Script  

```bash
node scripts/performance-monitor.js
```

### `load-test-swarm.js`
**Purpose**: Load testing for swarm systems  
**Type**: Node.js Script  

```bash
node scripts/load-test-swarm.js
```

### Additional Performance Scripts
- `build-monitor.js` - Monitor build performance
- `demo-task-system.ts` - Demo task system performance

---

## Installation & Setup

Scripts for installing and configuring Claude Flow.

### `install.js`
**Purpose**: Primary installation script with Deno setup  
**Type**: Node.js Script  

```bash
node scripts/install.js
```

**Features**:
- ✅ Automatic Deno detection and installation
- ✅ Multi-platform support (Windows, macOS, Linux)
- ✅ Fallback installation methods

### `install-arm64.js`
**Purpose**: ARM64-specific installation optimizations  
**Type**: Node.js Script  

```bash
node scripts/install-arm64.js
```

### `prepare-publish.js`
**Purpose**: Prepare package for publishing  
**Type**: Node.js Script  

```bash
node scripts/prepare-publish.js
```

### `update-bin-version.js`
**Purpose**: Update binary version information  
**Type**: Node.js Script  

```bash
node scripts/update-bin-version.js
```

---

## Import & Code Fixes

Scripts for fixing import paths and code structure issues.

### `fix-import-paths.js`
**Purpose**: Fix incorrect import paths in the codebase  
**Type**: Node.js Script  

```bash
node scripts/fix-import-paths.js
```

**Features**:
- ✅ Fixes CLI command import paths
- ✅ Automatic relative path correction
- ✅ Batch processing of files

### `fix-imports.js`
**Purpose**: General import statement fixes  
**Type**: Node.js Script  

```bash
node scripts/fix-imports.js
```

### `fix-duplicate-imports.js`
**Purpose**: Remove duplicate import statements  
**Type**: Node.js Script  

```bash
node scripts/fix-duplicate-imports.js
```

### `fix-cliffy-imports.js`
**Purpose**: Fix Cliffy library import issues  
**Type**: Node.js Script  

```bash
node scripts/fix-cliffy-imports.js
```

### `fix-shebang.js`
**Purpose**: Fix shebang lines in executable scripts  
**Type**: Node.js Script  

```bash
node scripts/fix-shebang.js
```

### `fix-error-handling.cjs`
**Purpose**: Error handling improvements  
**Type**: CommonJS Script  

```bash
node scripts/fix-error-handling.cjs
```

---

## Claude Flow Wrappers & Utilities

Scripts for wrapping and enhancing Claude Flow functionality.

### `claude-wrapper.sh`
**Purpose**: TTY-aware Claude wrapper for better terminal handling  
**Type**: Shell Script  

```bash
./scripts/claude-wrapper.sh [claude-arguments]
```

**Features**:
- ✅ Automatic TTY detection
- ✅ Pseudo-TTY creation when needed
- ✅ Cross-platform compatibility

### `claude-flow-wrapper.sh`
**Purpose**: Enhanced Claude Flow execution wrapper  
**Type**: Shell Script  

```bash
./scripts/claude-flow-wrapper.sh [arguments]
```

### `spawn-claude-terminal.sh`
**Purpose**: Spawn Claude in a new terminal window  
**Type**: Shell Script  

```bash
./scripts/spawn-claude-terminal.sh prompt-file.txt [arguments]
```

**Features**:
- ✅ Multi-platform terminal detection
- ✅ Supports macOS Terminal.app
- ✅ Linux terminal emulator support
- ✅ Windows command prompt support

### `claude-sparc.sh`
**Purpose**: SPARC (Structured Programming and Rapid Creation) mode wrapper  
**Type**: Shell Script  

```bash
./scripts/claude-sparc.sh [mode] [arguments]
```

### `check-claude-flow-linux.sh`
**Purpose**: Linux-specific Claude Flow environment checking  
**Type**: Shell Script  

```bash
./scripts/check-claude-flow-linux.sh
```

---

## Migration & Cleanup

Scripts for system migrations and maintenance.

### `migrate-hooks.js`
**Purpose**: Migrate Claude Flow settings to new hooks format  
**Type**: Node.js Script  

```bash
node scripts/migrate-hooks.js
```

**Features**:
- ✅ Compatible with Claude Code 1.0.51+
- ✅ Automatic backup creation
- ✅ Settings format validation
- ✅ Migration status checking

### `cleanup-root.sh`
**Purpose**: Clean up root directory from development artifacts  
**Type**: Shell Script  

```bash
./scripts/cleanup-root.sh
```

### Additional Migration Scripts
- `migration-examples.ts` - Migration examples and patterns
- `ruv-swarm-safe.js` - Safe migration for ruv-swarm components

---

## Quick Reference

### Most Common Commands

```bash
# Build the project
./scripts/build-with-filter.sh

# Run comprehensive tests
node scripts/test-comprehensive.js

# Fix TypeScript errors
node scripts/fix-typescript-errors.js

# Docker operations
./scripts/docker-manager.sh build
./scripts/docker-manager.sh run

# Create GitHub issues
./scripts/create-github-issues.sh --dry-run  # Preview first
./scripts/create-github-issues.sh            # Create issues

# Monitor performance
python3 scripts/claude-monitor.py

# Setup and installation
node scripts/install.js
```

### Prerequisites Summary

**Required Tools:**
- Node.js (v16+)
- Deno (installed automatically by install.js)
- Docker (for Docker operations)
- Python 3 (for monitoring scripts)
- GitHub CLI (`gh`) for issue management

**Environment Variables:**
- `GITHUB_TOKEN` (optional, for API-based issue creation)
- `DOCKER_REGISTRY` (optional, defaults to ghcr.io)

### Getting Help

Most scripts support `--help` or have detailed comments at the top of the file. For script-specific documentation, check the file headers or run:

```bash
# For Node.js scripts
node scripts/[script-name].js --help

# For shell scripts
./scripts/[script-name].sh --help
```

---

*Last updated: $(date +'%Y-%m-%d')*