#!/bin/bash
# Quick Code Quality Issue Creator
# 
# This script creates a GitHub issue specifically for Code Quality job failures
# in the verification pipeline, addressing the limitation mentioned where the
# existing issue creation infrastructure couldn't handle individual job failures.

set -e

echo "🔍 Code Quality Issue Creator"
echo "=============================="
echo ""
echo "This script creates a GitHub issue for Code Quality job failures"
echo "in the verification pipeline workflow."
echo ""

# Parse arguments
DRY_RUN=false
WORKFLOW="verification-pipeline"
ASSIGNEE="g2goose"

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --workflow)
      WORKFLOW="$2"
      shift 2
      ;;
    --assignee)
      ASSIGNEE="$2"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --dry-run              Preview the issue without creating it"
      echo "  --workflow WORKFLOW    Specify the workflow name (default: verification-pipeline)"
      echo "  --assignee USER        Specify the assignee (default: g2goose)"
      echo "  --help                 Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0                     Create Code Quality issue"
      echo "  $0 --dry-run           Preview the issue"
      echo "  $0 --workflow ci       Create issue for 'ci' workflow"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

echo "📋 Configuration:"
echo "  Workflow: $WORKFLOW"
echo "  Assignee: @$ASSIGNEE"
echo "  Mode: $([ "$DRY_RUN" = "true" ] && echo "DRY RUN" || echo "CREATE ISSUE")"
echo ""

# Check if dynamic issue creator exists
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DYNAMIC_CREATOR="$SCRIPT_DIR/create-dynamic-issue.js"

if [[ ! -f "$DYNAMIC_CREATOR" ]]; then
    echo "❌ Error: Dynamic issue creator not found at $DYNAMIC_CREATOR"
    echo "Please ensure the enhanced issue creation infrastructure is properly installed."
    exit 1
fi

# Build command
CMD="node \"$DYNAMIC_CREATOR\" --type=job-failure --job=code-quality --workflow=\"$WORKFLOW\" --assignee=\"$ASSIGNEE\""

if [[ "$DRY_RUN" == "true" ]]; then
    CMD="$CMD --dry-run"
fi

echo "🚀 Creating Code Quality job failure issue..."
echo ""

# Execute the command
eval $CMD

if [[ "$DRY_RUN" != "true" ]]; then
    echo ""
    echo "✅ Code Quality issue created successfully!"
    echo ""
    echo "📊 Next steps:"
    echo "1. Check the verification pipeline logs for specific ESLint/TypeScript errors"
    echo "2. Run 'npm run lint' and 'npm run typecheck' locally to reproduce issues"
    echo "3. Fix the identified code quality issues"
    echo "4. Re-run the verification pipeline to confirm the fix"
    echo ""
    echo "🔗 View all issues: https://github.com/g2goose/claude-flow/issues"
else
    echo ""
    echo "🔍 DRY RUN completed - no issue was created"
    echo "Run without --dry-run to create the actual issue"
fi