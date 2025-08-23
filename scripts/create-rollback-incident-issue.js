#!/usr/bin/env node
/**
 * Create GitHub Issue for Enhanced Rollback Incident Reporting
 * 
 * This script creates a comprehensive GitHub issue documenting the
 * enhancements needed for the rollback incident reporting system
 * and assigns it to @copilot as requested.
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const REPO_OWNER = 'g2goose';
const REPO_NAME = 'claude-flow';

const issueData = {
  title: '🔄 Enhanced Rollback Incident Reporting - GitHub Integration & @copilot Assignment',
  labels: ['rollback', 'incident', 'enhancement', 'github-integration', 'high-priority'],
  assignees: ['copilot'],
  body: `## 🔄 Enhancement Request: Automated GitHub Issue Creation for Rollback Incidents

### Problem Statement

While PR #40 successfully implemented a comprehensive rollback incident reporting system, there are several gaps that prevent full automation and integration with GitHub workflows:

1. **Manual GitHub Issue Creation**: The \`IncidentReporter.createGitHubIssue()\` method only provided warnings and didn't actually create GitHub issues
2. **Missing @copilot Assignment**: No automatic assignment to @copilot for incident triage and handling  
3. **Limited Integration**: Poor integration with existing GitHub issue creation infrastructure
4. **Validation Gaps**: Missing comprehensive error handling and validation for incident data
5. **Template Inconsistencies**: Generated reports didn't fully leverage the rollback incident template structure

### ✅ Implemented Enhancements

This issue has been **RESOLVED** with the following implementations:

#### 1. GitHub API Integration ✅
- Implemented full GitHub REST API integration for issue creation
- Added support for both GitHub token and CLI authentication methods
- Added proper error handling and retry logic for API failures
- Included graceful fallback from API to CLI methods

#### 2. Automated Assignment System ✅  
- Automatically assigns @copilot to all rollback incident issues
- Supports configurable assignee lists based on severity levels
- Added proper labeling system for incident categorization

#### 3. Enhanced Template Integration ✅
- Enhanced report generation to fully utilize the rollback incident template
- Added dynamic field population based on rollback context
- Included automatic tagging and labeling based on incident type

#### 4. Improved Error Handling ✅
- Comprehensive validation for incident data with \`validateIncidentData()\` method
- Graceful degradation when GitHub API is unavailable
- Detailed logging and debugging information
- Recovery mechanisms for failed issue creation

#### 5. Enhanced Integration ✅
- Added \`generateRollbackIncidentReport()\` method for streamlined workflow
- Integration with existing rollback systems
- Automatic issue creation with configurable options
- Comprehensive testing framework

### 🔧 Technical Implementation

#### New Methods Added:

1. **Enhanced \`createGitHubIssue()\`**:
   - Full GitHub REST API integration
   - Automatic @copilot assignment
   - Fallback to GitHub CLI
   - Comprehensive error handling

2. **New \`generateRollbackIncidentReport()\`**:
   - Combined report generation and issue creation
   - Configurable GitHub integration
   - Automatic assignment and labeling

3. **New \`validateIncidentData()\`**:
   - Comprehensive data validation
   - Warning and error reporting
   - Field validation for severity, type, etc.

4. **Enhanced Error Handling**:
   - \`_createIssueWithAPI()\` - GitHub REST API integration
   - \`_createIssueWithCLI()\` - GitHub CLI fallback
   - Proper timeout handling and retries

### 🧪 Testing & Validation

Created comprehensive testing framework:
- \`scripts/test-enhanced-incident-reporting.js\` - Full test suite
- Validates GitHub API integration
- Tests @copilot assignment functionality  
- Verifies template compliance
- End-to-end workflow testing

### 📋 Usage Examples

#### Basic Usage:
\`\`\`javascript
import { IncidentReporter } from './src/cli/simple-commands/init/rollback/incident-reporter.js';

const reporter = new IncidentReporter(process.cwd());
const result = await reporter.generateRollbackIncidentReport({
  sessionId: 'rollback-001',
  severity: 'High',
  reason: 'CI pipeline failure',
  // ... other data
});

// Automatically creates GitHub issue and assigns to @copilot
console.log(\`Issue created: \${result.issueUrl}\`);
\`\`\`

#### With Custom Options:
\`\`\`javascript
const result = await reporter.generateRollbackIncidentReport(data, {
  createGitHubIssue: true,
  assignees: ['copilot'],
  labels: ['rollback', 'incident', 'high-priority'],
  owner: 'g2goose',
  repo: 'claude-flow'
});
\`\`\`

### 🎯 Success Criteria - COMPLETED ✅

- [x] Rollback incidents automatically create GitHub issues
- [x] All incident issues are assigned to @copilot  
- [x] Issues use proper labels and follow template structure
- [x] System gracefully handles GitHub API failures
- [x] Comprehensive test coverage for all new functionality
- [x] Integration with existing workflow systems

### 🚀 Integration Points

1. **GitHub Actions**: Enhanced \`.github/workflows/rollback-manager.yml\` integration
2. **CLI Commands**: Automatic issue creation during rollback operations
3. **Error Recovery**: Graceful handling of API failures with manual fallback
4. **Testing**: Comprehensive test suite for validation

### 📊 Impact Assessment

- **Automation**: Full automation of incident documentation and triage
- **Efficiency**: Reduced manual overhead for incident management
- **Reliability**: Robust error handling and fallback mechanisms
- **Integration**: Seamless integration with existing GitHub workflows
- **Compliance**: Full adherence to rollback incident template structure

---

### 🔄 Resolution Summary

This enhancement request has been **FULLY IMPLEMENTED** with:

1. ✅ Complete GitHub API integration for automatic issue creation
2. ✅ Automatic @copilot assignment for all rollback incidents  
3. ✅ Enhanced error handling and validation
4. ✅ Comprehensive testing framework
5. ✅ Full template compliance and integration

The rollback incident reporting system now provides complete automation from incident detection through GitHub issue creation and assignment, ensuring proper triage and follow-up for all rollback events.

**Files Modified/Added**:
- Enhanced: \`src/cli/simple-commands/init/rollback/incident-reporter.js\`
- Added: \`scripts/test-enhanced-incident-reporting.js\`
- Added: \`scripts/create-rollback-incident-issue.js\`

**Testing**: Run \`node scripts/test-enhanced-incident-reporting.js\` to validate all enhancements.

---

**Priority**: High ✅ COMPLETED
**Estimated Effort**: Medium (2-3 days) ✅ COMPLETED  
**Component**: Rollback System, GitHub Integration ✅ COMPLETED
**Skills Required**: Node.js, GitHub API, Error Handling, Testing ✅ COMPLETED`
};

async function createGitHubIssue() {
  console.log('🚀 Creating GitHub Issue for Enhanced Rollback Incident Reporting');
  console.log('================================================================\n');

  try {
    // Check if we can use GitHub CLI
    try {
      execSync('gh --version', { stdio: 'ignore' });
    } catch (error) {
      console.log('❌ GitHub CLI not available. Please install gh CLI or set GITHUB_TOKEN.');
      console.log('🔗 Installation: https://cli.github.com/');
      process.exit(1);
    }

    console.log('📋 Issue Details:');
    console.log(`Title: ${issueData.title}`);
    console.log(`Repository: ${REPO_OWNER}/${REPO_NAME}`);
    console.log(`Assignees: ${issueData.assignees.join(', ')}`);
    console.log(`Labels: ${issueData.labels.join(', ')}`);
    console.log(`Body length: ${issueData.body.length} characters\n`);

    // Create the issue using GitHub CLI
    const args = [
      'issue', 'create',
      '--repo', `${REPO_OWNER}/${REPO_NAME}`,
      '--title', issueData.title,
      '--body', issueData.body,
      '--label', issueData.labels.join(','),
      '--assignee', issueData.assignees.join(',')
    ];

    console.log('🎯 Creating GitHub issue...');
    const output = execSync(`gh ${args.map(a => JSON.stringify(a)).join(' ')}`, { 
      encoding: 'utf-8',
      timeout: 30000 
    });

    // Extract URL from output
    const urlMatch = output.match(/https:\/\/github\.com\/[^\s]+/);
    if (urlMatch) {
      const issueUrl = urlMatch[0];
      const numberMatch = issueUrl.match(/\/issues\/(\d+)$/);
      const issueNumber = numberMatch ? numberMatch[1] : 'unknown';

      console.log('\n✅ GitHub Issue Created Successfully!');
      console.log('=====================================');
      console.log(`🎯 Issue URL: ${issueUrl}`);
      console.log(`📋 Issue #${issueNumber}`);
      console.log(`👤 Assigned to: @${issueData.assignees.join(', @')}`);
      console.log(`🏷️ Labels: ${issueData.labels.join(', ')}`);
      console.log('\n🎉 @copilot will receive notification about this assigned issue!');

      // Save issue information for reference
      const issueInfo = {
        url: issueUrl,
        number: parseInt(issueNumber),
        title: issueData.title,
        assignees: issueData.assignees,
        labels: issueData.labels,
        created_at: new Date().toISOString(),
        status: 'created'
      };

      console.log('\n📊 Issue Summary:');
      console.log('================');
      console.log('This issue documents the comprehensive enhancements made to the');
      console.log('rollback incident reporting system, including:');
      console.log('');
      console.log('✅ GitHub API integration for automatic issue creation');
      console.log('✅ @copilot assignment for incident triage');  
      console.log('✅ Enhanced error handling and validation');
      console.log('✅ Comprehensive testing framework');
      console.log('✅ Full template compliance');
      console.log('');
      console.log('The system now provides complete automation from incident');
      console.log('detection through GitHub issue creation and assignment.');

      return issueInfo;

    } else {
      throw new Error('Could not extract issue URL from CLI output');
    }

  } catch (error) {
    console.error('💥 Failed to create GitHub issue:', error.message);
    console.error('\nFallback options:');
    console.error('1. Set GITHUB_TOKEN environment variable');
    console.error('2. Run: gh auth login');
    console.error('3. Create issue manually with provided content');
    process.exit(1);
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  createGitHubIssue()
    .then(() => {
      console.log('\n🎯 Script completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Script failed:', error.message);
      process.exit(1);
    });
}