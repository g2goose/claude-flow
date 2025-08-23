#!/bin/bash
# Create GitHub Issue for Code Quality Job Failure
#
# This script creates a GitHub issue documenting the Code Quality job failure
# and assigns it to @copilot as requested.

set -e

echo "🚨 Creating GitHub Issue: Code Quality Job Failure"
echo "=================================================="
echo ""

# Repository details
OWNER="g2goose"
REPO="claude-flow"
API_URL="https://api.github.com/repos/$OWNER/$REPO/issues"

# Issue details
TITLE="[CRITICAL] Code Quality job failing with 7,635 ESLint problems in Verification Pipeline"

# Read the detailed issue body from the markdown file
BODY_FILE="create-code-quality-issue.md"

if [[ ! -f "$BODY_FILE" ]]; then
    echo "❌ Error: $BODY_FILE not found"
    exit 1
fi

# Create JSON payload with issue details
cat > issue-payload.json << EOF
{
  "title": "$TITLE",
  "body": $(cat "$BODY_FILE" | jq -R -s '.'),
  "labels": ["bug", "critical", "ci/cd", "code-quality", "eslint", "typescript"],
  "assignees": ["copilot"]
}
EOF

echo "📋 Issue Details:"
echo "  Title: $TITLE"
echo "  Labels: bug, critical, ci/cd, code-quality, eslint, typescript"
echo "  Assignee: @copilot"
echo "  Repository: $OWNER/$REPO"
echo ""

# Show the issue creation command that would be executed
echo "🔧 GitHub API Command:"
echo "curl -X POST \\"
echo "  -H \"Accept: application/vnd.github+json\" \\"
echo "  -H \"Authorization: Bearer \$GITHUB_TOKEN\" \\"
echo "  -H \"X-GitHub-Api-Version: 2022-11-28\" \\"
echo "  $API_URL \\"
echo "  -d @issue-payload.json"
echo ""

# Note about authentication
echo "📝 Note: This script requires:"
echo "  1. GITHUB_TOKEN environment variable with repo access"
echo "  2. The token must have 'issues:write' permission"
echo "  3. Execute with: GITHUB_TOKEN=your_token bash create-code-quality-issue.sh"
echo ""

echo "📁 Generated Files:"
echo "  - create-code-quality-issue.md (Issue body content)"
echo "  - issue-payload.json (GitHub API payload)"
echo "  - create-code-quality-issue.sh (This script)"
echo ""

# If GITHUB_TOKEN is provided, attempt to create the issue
if [[ -n "$GITHUB_TOKEN" ]]; then
    echo "🚀 Creating issue with provided GITHUB_TOKEN..."
    
    RESPONSE=$(curl -s -X POST \
        -H "Accept: application/vnd.github+json" \
        -H "Authorization: Bearer $GITHUB_TOKEN" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "$API_URL" \
        -d @issue-payload.json)
    
    # Check if issue was created successfully
    ISSUE_URL=$(echo "$RESPONSE" | jq -r '.html_url // empty')
    
    if [[ -n "$ISSUE_URL" ]]; then
        echo "✅ Issue created successfully!"
        echo "🔗 Issue URL: $ISSUE_URL"
        ISSUE_NUMBER=$(echo "$RESPONSE" | jq -r '.number')
        echo "📋 Issue Number: #$ISSUE_NUMBER"
        echo ""
        echo "🎯 Next Steps:"
        echo "  1. Visit $ISSUE_URL"
        echo "  2. Verify @copilot is assigned"
        echo "  3. @copilot will receive notifications about this issue"
        echo "  4. Monitor progress on fixing the Code Quality job"
    else
        echo "❌ Failed to create issue"
        echo "Response: $RESPONSE"
        exit 1
    fi
else
    echo "⚠️  GITHUB_TOKEN not provided - issue not created"
    echo "   Run: GITHUB_TOKEN=your_token bash create-code-quality-issue.sh"
fi

echo ""
echo "🎯 Issue Summary:"
echo "  Problem: Code Quality job failing with 7,635 ESLint problems"
echo "  Impact: Blocks CI/CD pipeline and PR merges" 
echo "  Solution: Fix ESLint errors and warnings systematically"
echo "  Workflow: https://github.com/g2goose/claude-flow/actions/runs/17175189889/job/48730140423"
echo ""
echo "✨ Issue creation completed!"