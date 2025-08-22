#!/bin/bash
# Quick GitHub Issues Creation Script
# 
# This script provides an interactive way to create GitHub issues
# from GITHUB_ISSUES_TO_CREATE.md with @copilot assignment.

set -e

echo "🚀 Claude Flow GitHub Issues Creator"
echo "===================================="
echo ""
echo "This script will create 6 GitHub issues from GITHUB_ISSUES_TO_CREATE.md"
echo "Each issue will be assigned to @copilot as requested."
echo ""

# Check if in correct directory
if [[ ! -f "GITHUB_ISSUES_TO_CREATE.md" ]]; then
    echo "❌ Error: GITHUB_ISSUES_TO_CREATE.md not found"
    echo "Please run this script from the repository root directory."
    exit 1
fi

echo "📋 Issues to be created:"
echo "  1. [CRITICAL] CI/CD Pipeline failing with TypeScript compilation errors"
echo "  2. [HIGH] Verification Pipeline tests failing with type compilation errors"
echo "  3. [MEDIUM] Truth Scoring Pipeline likely failing due to verification system dependencies"
echo "  4. [MEDIUM] Integration Tests infrastructure needs reorganization"
echo "  5. [MEDIUM] Docker Build workflow failing due to TypeScript compilation issues"
echo "  6. [LOW] Status Badge and Rollback Manager workflows need verification"
echo ""

# Check prerequisites
echo "🔧 Checking prerequisites..."

# Check GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found"
    echo "Please install GitHub CLI: https://cli.github.com/"
    echo ""
    echo "Quick install:"
    echo "  macOS: brew install gh"
    echo "  Ubuntu: curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && echo \"deb [arch=\$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main\" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null && sudo apt update && sudo apt install gh"
    echo "  Windows: winget install --id GitHub.cli"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub CLI not authenticated"
    echo "Please authenticate with GitHub:"
    echo "  gh auth login"
    echo ""
    echo "Follow the prompts to authenticate with your GitHub account."
    exit 1
fi

echo "✅ Prerequisites checked"
echo ""

# Show current authenticated user
current_user=$(gh api user --jq '.login')
echo "👤 Authenticated as: @$current_user"
echo "📍 Target repository: g2goose/claude-flow"
echo "👨‍💻 Issues will be assigned to: @copilot"
echo ""

# Confirmation prompt
read -p "Do you want to proceed with creating the issues? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled by user"
    exit 0
fi

echo ""
echo "🎯 Creating GitHub issues..."
echo ""

# Choose method
echo "Choose creation method:"
echo "  1. Bash script (simple, reliable)"
echo "  2. Node.js script (advanced, more features)"
echo ""
read -p "Enter choice (1 or 2, default: 1): " -n 1 -r
echo ""

if [[ $REPLY == "2" ]]; then
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found. Using bash script instead."
        METHOD="bash"
    else
        METHOD="node"
    fi
else
    METHOD="bash"
fi

echo "📝 Using $METHOD method..."
echo ""

# Execute the chosen method
if [[ $METHOD == "node" ]]; then
    # Use Node.js script
    if [[ -f "scripts/create-github-issues.js" ]]; then
        node scripts/create-github-issues.js
    else
        echo "❌ Node.js script not found, falling back to bash script"
        METHOD="bash"
    fi
fi

if [[ $METHOD == "bash" ]]; then
    # Use bash script
    if [[ -f "scripts/create-github-issues.sh" ]]; then
        ./scripts/create-github-issues.sh
    else
        echo "❌ Bash script not found"
        echo "Please ensure the scripts directory exists and contains the issue creation scripts."
        exit 1
    fi
fi

echo ""
echo "✨ Issue creation completed!"
echo ""
echo "📊 Next steps:"
echo "  1. Visit https://github.com/g2goose/claude-flow/issues to view created issues"
echo "  2. Verify that all issues are assigned to @copilot"
echo "  3. @copilot will receive notifications about the assigned issues"
echo ""
echo "🎯 All workflow failure issues have been documented and assigned!"