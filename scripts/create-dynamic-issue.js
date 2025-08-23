#!/usr/bin/env node
/**
 * Dynamic GitHub Issue Creator Script
 * 
 * This script creates GitHub issues dynamically for any workflow job failure
 * or custom issue type, removing the limitation of only being able to create
 * predefined issues from templates.
 * 
 * Usage Examples:
 *   # Create issue for Code Quality job failure
 *   node scripts/create-dynamic-issue.js --type="job-failure" --job="code-quality" --workflow="verification-pipeline"
 *   
 *   # Create custom issue with specific details
 *   node scripts/create-dynamic-issue.js --type="custom" --title="[BUG] API endpoint failing" --description="API endpoint returning 500 errors"
 *   
 *   # Preview without creating (dry run)
 *   node scripts/create-dynamic-issue.js --type="job-failure" --job="code-quality" --workflow="verification-pipeline" --dry-run
 * 
 * Prerequisites:
 *   - GitHub CLI authenticated: gh auth login
 *   - OR GITHUB_TOKEN environment variable set
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const REPO_OWNER = 'g2goose';
const REPO_NAME = 'claude-flow';
const DEFAULT_ASSIGNEE = 'g2goose';

// Parse command line arguments
const args = process.argv.slice(2);
const config = {
  type: getArgValue('--type', 'custom'),
  job: getArgValue('--job'),
  workflow: getArgValue('--workflow'),
  title: getArgValue('--title'),
  description: getArgValue('--description'),
  body: getArgValue('--body'),
  labels: getArgValue('--labels', '').split(',').filter(Boolean),
  assignee: getArgValue('--assignee', DEFAULT_ASSIGNEE),
  priority: getArgValue('--priority', 'medium'),
  dryRun: args.includes('--dry-run'),
  method: getArgValue('--method', 'cli'), // 'cli' or 'api'
};

function getArgValue(argName, defaultValue = '') {
  const argIndex = args.findIndex(arg => arg.startsWith(argName));
  if (argIndex === -1) return defaultValue;
  
  const arg = args[argIndex];
  if (arg.includes('=')) {
    return arg.split('=')[1];
  }
  
  // Check next argument
  if (argIndex + 1 < args.length && !args[argIndex + 1].startsWith('--')) {
    return args[argIndex + 1];
  }
  
  return defaultValue;
}

/**
 * Job failure templates for common workflow jobs
 */
const JOB_FAILURE_TEMPLATES = {
  'code-quality': {
    title: '[HIGH] Code Quality job failing in verification pipeline',
    labels: ['bug', 'high-priority', 'code-quality', 'ci/cd'],
    description: `
## Problem Description

The Code Quality job in the verification pipeline is failing, preventing the pipeline from completing successfully.

## Affected Workflow
- **Workflow**: {{workflow}} 
- **Job**: Code Quality (📝 Code Quality)
- **Pipeline**: Verification Pipeline

## Common Causes
1. **ESLint violations**: Code style or quality issues detected
2. **TypeScript compilation errors**: Type checking failures
3. **Formatting issues**: Code not properly formatted with Prettier
4. **Code complexity**: Code complexity metrics exceeding thresholds

## Investigation Steps
1. Check the workflow run logs for specific ESLint errors
2. Run \`npm run lint\` locally to reproduce issues
3. Run \`npm run typecheck\` to identify TypeScript errors  
4. Run \`npm run format\` to check formatting issues
5. Review code complexity reports if available

## Resolution Actions
- [ ] Fix ESLint violations identified in the logs
- [ ] Resolve TypeScript compilation errors
- [ ] Apply code formatting fixes with \`npm run format\`
- [ ] Refactor code if complexity thresholds are exceeded
- [ ] Update ESLint configuration if rules need adjustment

## Acceptance Criteria
- [ ] Code Quality job passes in verification pipeline
- [ ] All ESLint violations resolved
- [ ] TypeScript compilation successful
- [ ] Code formatting compliance achieved
- [ ] No regression in code quality metrics

## Additional Context
This issue was automatically created due to a Code Quality job failure. 
Review the specific workflow run for detailed error messages and failed checks.
`.trim(),
  },
  'security-verification': {
    title: '[CRITICAL] Security Verification job failing in verification pipeline',
    labels: ['bug', 'critical-priority', 'security', 'ci/cd'],
    description: `
## Problem Description

The Security Verification job in the verification pipeline is failing, indicating potential security vulnerabilities or compliance issues.

## Affected Workflow
- **Workflow**: {{workflow}}
- **Job**: Security Verification (🛡️ Security Verification) 
- **Pipeline**: Verification Pipeline

## Common Causes
1. **High/Critical vulnerabilities**: npm audit findings
2. **License compliance issues**: Incompatible or prohibited licenses
3. **Dependency vulnerabilities**: Security issues in dependencies
4. **Security configuration**: Audit configuration issues

## Investigation Steps
1. Review security audit reports in workflow artifacts
2. Run \`npm audit\` locally to identify vulnerabilities
3. Check license compliance report for prohibited licenses
4. Review dependency vulnerability scan results

## Resolution Actions
- [ ] Update vulnerable dependencies to secure versions
- [ ] Remove or replace dependencies with prohibited licenses
- [ ] Configure audit exceptions for false positives (if appropriate)
- [ ] Update security policies if needed

## Acceptance Criteria
- [ ] Security Verification job passes in verification pipeline
- [ ] No high or critical vulnerabilities remaining
- [ ] All licenses compliant with project requirements
- [ ] Security scan passes without issues

## Additional Context
This issue was automatically created due to a Security Verification job failure.
Security issues should be treated with highest priority.
`.trim(),
  },
  'test-verification': {
    title: '[HIGH] Test Verification job failing in verification pipeline',
    labels: ['bug', 'high-priority', 'testing', 'ci/cd'],
    description: `
## Problem Description

The Test Verification job in the verification pipeline is failing, indicating test failures or testing infrastructure issues.

## Affected Workflow
- **Workflow**: {{workflow}}
- **Job**: Test Verification (🧪 Test Verification)
- **Pipeline**: Verification Pipeline

## Common Causes
1. **Unit test failures**: Logic or implementation issues
2. **Integration test failures**: Component interaction issues  
3. **E2E test failures**: End-to-end workflow issues
4. **Test infrastructure**: Test setup or configuration problems
5. **Flaky tests**: Intermittent test failures

## Investigation Steps
1. Review test failure logs in workflow artifacts
2. Run tests locally: \`npm run test\`
3. Run specific test suites to isolate failures
4. Check for environmental differences between local and CI

## Resolution Actions
- [ ] Fix failing unit tests
- [ ] Resolve integration test issues
- [ ] Address E2E test failures
- [ ] Update test infrastructure if needed
- [ ] Stabilize flaky tests

## Acceptance Criteria
- [ ] Test Verification job passes in verification pipeline
- [ ] All unit tests passing
- [ ] Integration tests stable
- [ ] E2E tests successful
- [ ] Test coverage requirements met

## Additional Context
This issue was automatically created due to a Test Verification job failure.
Review specific test output for detailed failure information.
`.trim(),
  },
  'build-verification': {
    title: '[HIGH] Build Verification job failing in verification pipeline',
    labels: ['bug', 'high-priority', 'build', 'ci/cd'],
    description: `
## Problem Description

The Build Verification job in the verification pipeline is failing, preventing successful compilation and packaging.

## Affected Workflow
- **Workflow**: {{workflow}}
- **Job**: Build Verification (🏗️ Build Verification)
- **Pipeline**: Verification Pipeline

## Common Causes
1. **TypeScript compilation errors**: Type checking or compilation issues
2. **Missing dependencies**: Required packages not installed
3. **Build configuration**: Invalid build settings or scripts
4. **Binary creation failures**: PKG or binary build issues
5. **CLI functionality**: Command-line interface not working

## Investigation Steps
1. Review build logs for compilation errors
2. Run \`npm run build\` locally to reproduce issues  
3. Check TypeScript configuration and dependencies
4. Test CLI functionality after local build

## Resolution Actions
- [ ] Fix TypeScript compilation errors
- [ ] Update dependencies if needed
- [ ] Correct build configuration issues
- [ ] Resolve binary creation problems
- [ ] Ensure CLI functionality works correctly

## Acceptance Criteria
- [ ] Build Verification job passes in verification pipeline
- [ ] TypeScript compilation successful
- [ ] Binary creation working
- [ ] CLI commands functional
- [ ] Package creation successful

## Additional Context
This issue was automatically created due to a Build Verification job failure.
Build failures block deployment and distribution.
`.trim(),
  }
};

/**
 * Generate issue content based on type and parameters
 */
function generateIssueContent() {
  if (config.type === 'job-failure' && config.job) {
    const template = JOB_FAILURE_TEMPLATES[config.job];
    if (!template) {
      throw new Error(`Unknown job type: ${config.job}. Available: ${Object.keys(JOB_FAILURE_TEMPLATES).join(', ')}`);
    }
    
    return {
      title: config.title || template.title,
      body: template.description.replace(/\{\{workflow\}\}/g, config.workflow || 'Unknown'),
      labels: [...new Set([...template.labels, ...config.labels])],
    };
  }
  
  if (config.type === 'custom') {
    return {
      title: config.title || '[ISSUE] Custom issue',
      body: config.body || config.description || 'No description provided',
      labels: config.labels.length > 0 ? config.labels : ['bug'],
    };
  }
  
  throw new Error(`Unknown issue type: ${config.type}. Use 'job-failure' or 'custom'`);
}

/**
 * Create issue using GitHub CLI
 */
function createIssueWithCLI(issueData) {
  const args = [
    'issue', 'create',
    '--repo', `${REPO_OWNER}/${REPO_NAME}`,
    '--title', issueData.title,
    '--body', issueData.body,
  ];
  
  if (issueData.labels.length > 0) {
    args.push('--label', issueData.labels.join(','));
  }
  
  if (config.assignee) {
    args.push('--assignee', config.assignee);
  }

  if (config.dryRun) {
    console.log(`Would execute: gh ${args.map(a => JSON.stringify(a)).join(' ')}`);
    return { 
      success: true, 
      url: `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new`,
      dryRun: true
    };
  }

  try {
    const output = execSync(`gh ${args.map(a => JSON.stringify(a)).join(' ')}`, { 
      encoding: 'utf-8' 
    });
    
    const urlMatch = output.match(/https:\/\/github\.com\/[^\s]+/);
    const numberMatch = output.match(/#(\d+)/);
    
    return { 
      success: true, 
      url: urlMatch?.[0] || 'Unknown URL',
      number: numberMatch?.[1] || 'Unknown',
      output: output.trim()
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
    };
  }
}

/**
 * Validate prerequisites
 */
function validatePrerequisites() {
  // Check GitHub CLI
  try {
    execSync('gh --version', { stdio: 'ignore' });
  } catch (error) {
    throw new Error('GitHub CLI not found. Install from: https://cli.github.com/');
  }

  // Check authentication (only if not dry run)
  if (!config.dryRun) {
    try {
      execSync('gh auth status', { stdio: 'ignore' });
    } catch (error) {
      throw new Error('GitHub CLI not authenticated. Run: gh auth login');
    }
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 Dynamic GitHub Issue Creator');
    console.log(`Repository: ${REPO_OWNER}/${REPO_NAME}`);
    console.log(`Type: ${config.type}`);
    console.log(`Mode: ${config.dryRun ? 'DRY RUN' : 'CREATE ISSUE'}`);
    console.log('');

    // Validate configuration
    if (config.type === 'job-failure') {
      if (!config.job) {
        throw new Error('--job parameter required for job-failure type');
      }
      console.log(`Job: ${config.job}`);
      console.log(`Workflow: ${config.workflow || 'Not specified'}`);
    } else if (config.type === 'custom') {
      if (!config.title && !config.description && !config.body) {
        throw new Error('--title, --description, or --body required for custom type');
      }
    }

    // Check prerequisites
    console.log('🔧 Validating prerequisites...');
    validatePrerequisites();
    console.log('✅ Prerequisites validated');
    console.log('');

    // Generate issue content
    console.log('📝 Generating issue content...');
    const issueData = generateIssueContent();
    
    console.log(`Title: ${issueData.title}`);
    console.log(`Labels: ${issueData.labels.join(', ')}`);
    console.log(`Assignee: ${config.assignee}`);
    console.log(`Body length: ${issueData.body.length} characters`);
    console.log('');

    if (config.dryRun) {
      console.log('📋 Issue Preview:');
      console.log('==================');
      console.log(`Title: ${issueData.title}`);
      console.log(`Labels: ${issueData.labels.join(', ')}`);
      console.log('');
      console.log('Body:');
      console.log(issueData.body);
      console.log('');
      console.log('🔍 DRY RUN - No issue created');
      return;
    }

    // Create the issue
    console.log('🎯 Creating GitHub issue...');
    const result = createIssueWithCLI(issueData);

    if (result.success) {
      console.log('');
      console.log('✅ Issue created successfully!');
      console.log(`🔗 URL: ${result.url}`);
      if (result.number) {
        console.log(`📋 Issue #${result.number}`);
      }
      console.log(`👤 Assigned to: @${config.assignee}`);
      console.log(`🏷️ Labels: ${issueData.labels.join(', ')}`);
      
      if (config.type === 'job-failure') {
        console.log('');
        console.log('📊 Next Steps:');
        console.log('1. Review the workflow run logs for specific error details');
        console.log('2. Follow the investigation steps outlined in the issue');
        console.log('3. Implement the resolution actions');
        console.log('4. Verify the fix by re-running the workflow');
      }
    } else {
      console.error('');
      console.error('❌ Failed to create issue:', result.error);
      console.error('');
      console.error('Troubleshooting:');
      console.error('1. Ensure GitHub CLI is authenticated: gh auth login');
      console.error('2. Check repository permissions');
      console.error('3. Verify repository name and owner are correct');
      process.exit(1);
    }

  } catch (error) {
    console.error('');
    console.error('💥 Error:', error.message);
    console.error('');
    console.error('Usage Examples:');
    console.error('  node scripts/create-dynamic-issue.js --type="job-failure" --job="code-quality" --workflow="verification-pipeline"');
    console.error('  node scripts/create-dynamic-issue.js --type="custom" --title="[BUG] API issue" --description="Description here"');
    console.error('');
    console.error('Available job types for --job:');
    console.error(`  ${Object.keys(JOB_FAILURE_TEMPLATES).join(', ')}`);
    process.exit(1);
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateIssueContent, createIssueWithCLI, JOB_FAILURE_TEMPLATES };