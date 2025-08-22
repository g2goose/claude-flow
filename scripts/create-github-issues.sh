#!/bin/bash
# GitHub Issues Creator - Bash Script Alternative
# 
# This script creates GitHub issues from GITHUB_ISSUES_TO_CREATE.md
# Each issue is assigned to @copilot as requested.
#
# Prerequisites:
#   - GitHub CLI installed and authenticated (gh auth login)
#   - Repository access permissions
#
# Usage:
#   ./scripts/create-github-issues.sh
#   ./scripts/create-github-issues.sh --dry-run

set -e

REPO="g2goose/claude-flow"
ASSIGNEE="copilot"
DRY_RUN=false

# Parse arguments
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo "🔍 DRY RUN MODE - No issues will be created"
fi

echo "🚀 GitHub Issues Creator (Bash)"
echo "Repository: $REPO"
echo "Assignee: @$ASSIGNEE"
echo ""

# Check GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Install from: https://cli.github.com/"
    exit 1
fi

# Check authentication (only if not dry run)
if [[ "$DRY_RUN" != "true" ]]; then
    if ! gh auth status &> /dev/null; then
        echo "❌ GitHub CLI not authenticated. Run: gh auth login"
        exit 1
    fi
fi

echo "✅ Prerequisites checked"
echo ""

# Function to create issue
create_issue() {
    local title="$1"
    local body_file="$2"
    local labels="$3"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "Would create issue:"
        echo "  Title: $title"
        echo "  Labels: $labels"
        echo "  Assignee: @$ASSIGNEE"
        echo "  Body file: $body_file"
        echo ""
        return
    fi
    
    # Create the issue
    if [[ -n "$labels" ]]; then
        gh issue create \
            --repo "$REPO" \
            --title "$title" \
            --body-file "$body_file" \
            --label "$labels" \
            --assignee "$ASSIGNEE"
    else
        gh issue create \
            --repo "$REPO" \
            --title "$title" \
            --body-file "$body_file" \
            --assignee "$ASSIGNEE"
    fi
    
    echo "✅ Created issue: $title"
    echo ""
    
    # Rate limiting
    sleep 1
}

# Create temporary directory for issue bodies
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Issue #1: CI/CD Pipeline
cat > "$TEMP_DIR/issue1.md" << 'EOF'
The main CI/CD pipeline (`.github/workflows/ci.yml`) is consistently failing due to TypeScript compilation errors.

## ✅ **RESOLVED**: Critical Compiler Bug
- **Fixed TypeScript compiler bug** by downgrading from v5.8.3 to v5.3.3
- Build process now produces actionable errors instead of crashing

## Remaining Issues
- 1078 TypeScript compilation errors across the codebase
- Most common error categories:
  - Agent type mismatches (`AgentType` enum inconsistencies)
  - Missing `await` statements on Promise operations
  - Property access on potentially undefined objects

## Error Examples
```typescript
// Agent type mismatches
Type '"requirements_analyst"' is not assignable to type 'AgentType'

// Missing await
if (cleanedCount > 0) { // Promise<number> vs number
// Should be: if (await cleanedCount > 0) {

// Undefined property access
console.log(`📍 Address: ${mcpConfig.host}:${mcpConfig.port}`); // mcpConfig possibly undefined
```

## Action Items
1. Fix agent type definitions for consistency
2. Add proper await statements for Promise operations
3. Add null checks for potentially undefined properties
4. Update type annotations throughout verification system
EOF

# Issue #2: Verification Pipeline
cat > "$TEMP_DIR/issue2.md" << 'EOF'
The Verification Pipeline workflow (`.github/workflows/verification-pipeline.yml`) is failing due to:

## Test Failures
- 8 failed, 3 passed, 11 total tests
- Verification Pipeline E2E Tests failing
- Error handling and recovery tests not passing

## Latest Run Issues (Run #17147939092)
```
Verification Pipeline E2E Tests › Error Handling and Recovery › should handle verification system failures
Expected: true
Received: false
```

## Type Compilation Issues
- Missing module dependencies in verification system
- Type mismatches in verification pipeline code
- Test configuration issues

## Action Items
1. Fix missing module imports in verification pipeline
2. Resolve test failures in E2E verification tests
3. Update type definitions for verification system
4. Verify test infrastructure is properly configured
EOF

# Issue #3: Truth Scoring Pipeline
cat > "$TEMP_DIR/issue3.md" << 'EOF'
The Truth Scoring Pipeline workflow (`.github/workflows/truth-scoring.yml`) is likely experiencing similar issues to the verification pipeline.

## Expected Issues
- TypeScript compilation errors in truth scoring components
- ESLint violations in verification-related code
- Test infrastructure dependencies

## Action Items
1. Investigate current status of truth scoring workflow
2. Fix any TypeScript compilation issues
3. Ensure test infrastructure supports truth scoring tests
4. Verify integration with verification pipeline
EOF

# Issue #4: Integration Tests
cat > "$TEMP_DIR/issue4.md" << 'EOF'
Integration tests workflow (`.github/workflows/integration-tests.yml`) has infrastructure issues.

## Identified Problems
- Test files located in non-standard directories
- Jest configuration misalignment with actual test locations
- Missing coverage directory causing artifact upload failures
- Test discovery issues

## Current Test Structure Issues
- Tests exist in `tests/` directory but some configs expect `src/__tests__/`
- ESLint trying to parse test files excluded from TypeScript compilation
- Coverage reports not being generated properly

## Action Items
1. Standardize test directory structure
2. Update Jest configuration for proper test discovery
3. Fix coverage reporting and artifact generation
4. Ensure test files are properly excluded from main compilation
EOF

# Issue #5: Docker Build
cat > "$TEMP_DIR/issue5.md" << 'EOF'
Docker Build workflow (`.github/workflows/docker.yml`) is failing because it depends on successful TypeScript compilation.

## Issues
- Cannot build Docker images due to failed TypeScript compilation
- Puppeteer download issues during dependency installation
- Build artifacts not being generated for Docker image

## Dependencies
- **Blocked by Issue #1** (TypeScript compilation)
- Needs successful build process before Docker can work

## Action Items
1. Wait for TypeScript compilation fixes
2. Address puppeteer download issues in Docker environment
3. Verify Docker build process works with corrected TypeScript
4. Test Docker image functionality
EOF

# Issue #6: Status Badge and Rollback Manager
cat > "$TEMP_DIR/issue6.md" << 'EOF'
These workflows may be working but need verification:
- `status-badges.yml`
- `rollback-manager.yml`

## Action Items
1. Test status badge workflow manually
2. Verify rollback manager functionality
3. Ensure proper integration with main workflows
4. Update if necessary based on main workflow fixes
EOF

echo "📋 Creating GitHub Issues..."
echo ""

# Create all issues
create_issue "[CRITICAL] CI/CD Pipeline failing with 1078 TypeScript compilation errors" \
    "$TEMP_DIR/issue1.md" \
    "bug,high-priority,ci/cd,typescript"

create_issue "[HIGH] Verification Pipeline tests failing with type compilation errors" \
    "$TEMP_DIR/issue2.md" \
    "bug,high-priority,testing,verification"

create_issue "[MEDIUM] Truth Scoring Pipeline likely failing due to verification system dependencies" \
    "$TEMP_DIR/issue3.md" \
    "bug,medium-priority,verification,truth-scoring"

create_issue "[MEDIUM] Integration Tests infrastructure needs reorganization" \
    "$TEMP_DIR/issue4.md" \
    "bug,medium-priority,testing,infrastructure"

create_issue "[MEDIUM] Docker Build workflow failing due to TypeScript compilation issues" \
    "$TEMP_DIR/issue5.md" \
    "bug,medium-priority,docker,build"

create_issue "[LOW] Status Badge and Rollback Manager workflows need verification" \
    "$TEMP_DIR/issue6.md" \
    "enhancement,low-priority,workflows"

echo "🎉 All issues have been assigned to @$ASSIGNEE as requested!"

if [[ "$DRY_RUN" == "true" ]]; then
    echo ""
    echo "To actually create the issues, run:"
    echo "  ./scripts/create-github-issues.sh"
fi