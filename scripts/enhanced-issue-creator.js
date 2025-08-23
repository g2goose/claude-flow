#!/usr/bin/env node
/**
 * Enhanced Issue Creation Infrastructure
 * 
 * This script provides a unified interface for creating GitHub issues that supports:
 * 1. Template-based batch issue creation (existing functionality)
 * 2. Dynamic issue creation for workflow job failures (new capability)
 * 3. Custom issue creation with flexible parameters (new capability)
 * 
 * This removes the limitation where the existing infrastructure could only create
 * predefined issues from templates and now supports dynamic issue creation.
 * 
 * Usage:
 *   # Template-based batch creation (existing)
 *   node scripts/enhanced-issue-creator.js --mode=template
 *   
 *   # Dynamic job failure issue (new)
 *   node scripts/enhanced-issue-creator.js --mode=job-failure --job=code-quality --workflow=verification-pipeline
 *   
 *   # Custom issue (new)
 *   node scripts/enhanced-issue-creator.js --mode=custom --title="Issue title" --description="Issue description"
 *   
 *   # Interactive mode (new)
 *   node scripts/enhanced-issue-creator.js --mode=interactive
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the dynamic issue creator
const { generateIssueContent, createIssueWithCLI, JOB_FAILURE_TEMPLATES } = await import('./create-dynamic-issue.js');

// Configuration
const REPO_OWNER = 'g2goose';
const REPO_NAME = 'claude-flow';

// Parse command line arguments
const args = process.argv.slice(2);
const config = {
  mode: getArgValue('--mode', 'interactive'),
  job: getArgValue('--job'),
  workflow: getArgValue('--workflow'),
  title: getArgValue('--title'),
  description: getArgValue('--description'),
  labels: getArgValue('--labels', '').split(',').filter(Boolean),
  assignee: getArgValue('--assignee', 'g2goose'),
  priority: getArgValue('--priority', 'medium'),
  dryRun: args.includes('--dry-run'),
};

function getArgValue(argName, defaultValue = '') {
  const argIndex = args.findIndex(arg => arg.startsWith(argName));
  if (argIndex === -1) return defaultValue;
  
  const arg = args[argIndex];
  if (arg.includes('=')) {
    return arg.split('=')[1];
  }
  
  if (argIndex + 1 < args.length && !args[argIndex + 1].startsWith('--')) {
    return args[argIndex + 1];
  }
  
  return defaultValue;
}

/**
 * Interactive mode for guided issue creation
 */
async function interactiveMode() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  try {
    console.log('🤖 Interactive GitHub Issue Creator');
    console.log('==================================');
    console.log('');

    console.log('Available issue creation modes:');
    console.log('  1. Template-based (batch creation from GITHUB_ISSUES_TO_CREATE.md)');
    console.log('  2. Job failure (create issue for specific workflow job failure)');
    console.log('  3. Custom (create custom issue with your own details)');
    console.log('');

    const mode = await question('Select mode (1-3): ');
    
    if (mode === '1') {
      console.log('');
      console.log('📋 Template-based batch issue creation');
      console.log('This will create issues from GITHUB_ISSUES_TO_CREATE.md');
      
      const confirm = await question('Proceed with batch creation? (y/N): ');
      if (confirm.toLowerCase() === 'y') {
        rl.close();
        return runTemplateBased();
      }
    } else if (mode === '2') {
      console.log('');
      console.log('🔧 Job failure issue creation');
      console.log('Available job types:');
      Object.keys(JOB_FAILURE_TEMPLATES).forEach((job, index) => {
        console.log(`  ${index + 1}. ${job}`);
      });
      console.log('');
      
      const jobChoice = await question('Select job type (1-' + Object.keys(JOB_FAILURE_TEMPLATES).length + '): ');
      const jobTypes = Object.keys(JOB_FAILURE_TEMPLATES);
      const selectedJob = jobTypes[parseInt(jobChoice) - 1];
      
      if (!selectedJob) {
        console.log('❌ Invalid job type selection');
        rl.close();
        return;
      }
      
      const workflow = await question('Enter workflow name (optional): ') || 'verification-pipeline';
      const isDryRun = (await question('Preview only? (y/N): ')).toLowerCase() === 'y';
      
      rl.close();
      return createJobFailureIssue(selectedJob, workflow, isDryRun);
      
    } else if (mode === '3') {
      console.log('');
      console.log('✏️ Custom issue creation');
      
      const title = await question('Enter issue title: ');
      const description = await question('Enter issue description: ');
      const labelsInput = await question('Enter labels (comma-separated, optional): ');
      const assignee = await question('Enter assignee (default: g2goose): ') || 'g2goose';
      const isDryRun = (await question('Preview only? (y/N): ')).toLowerCase() === 'y';
      
      rl.close();
      return createCustomIssue(title, description, labelsInput.split(',').filter(Boolean), assignee, isDryRun);
    } else {
      console.log('❌ Invalid mode selection');
    }
    
    rl.close();
  } catch (error) {
    rl.close();
    throw error;
  }
}

/**
 * Run template-based issue creation (existing functionality)
 */
function runTemplateBased() {
  console.log('📋 Running template-based batch issue creation...');
  console.log('');
  
  try {
    // Use the existing create-github-issues.js script
    const scriptPath = path.join(__dirname, 'create-github-issues.js');
    const result = execSync(`node ${scriptPath}${config.dryRun ? ' --dry-run' : ''}`, {
      encoding: 'utf-8',
      stdio: 'inherit'
    });
    
    console.log('✅ Template-based issue creation completed');
  } catch (error) {
    console.error('❌ Template-based issue creation failed:', error.message);
    throw error;
  }
}

/**
 * Create job failure issue
 */
async function createJobFailureIssue(job, workflow = 'verification-pipeline', isDryRun = false) {
  console.log(`🔧 Creating job failure issue for: ${job}`);
  console.log(`📋 Workflow: ${workflow}`);
  console.log(`🔍 Mode: ${isDryRun ? 'DRY RUN' : 'CREATE ISSUE'}`);
  console.log('');
  
  try {
    // Use the dynamic issue creator
    const scriptPath = path.join(__dirname, 'create-dynamic-issue.js');
    const command = `node ${scriptPath} --type=job-failure --job=${job} --workflow=${workflow}${isDryRun ? ' --dry-run' : ''}`;
    
    execSync(command, {
      encoding: 'utf-8',
      stdio: 'inherit'
    });
    
    console.log('✅ Job failure issue creation completed');
  } catch (error) {
    console.error('❌ Job failure issue creation failed:', error.message);
    throw error;
  }
}

/**
 * Create custom issue
 */
async function createCustomIssue(title, description, labels, assignee, isDryRun = false) {
  console.log('✏️ Creating custom issue...');
  console.log(`📋 Title: ${title}`);
  console.log(`📝 Description length: ${description.length} characters`);
  console.log(`🏷️ Labels: ${labels.join(', ') || 'none'}`);
  console.log(`👤 Assignee: ${assignee}`);
  console.log(`🔍 Mode: ${isDryRun ? 'DRY RUN' : 'CREATE ISSUE'}`);
  console.log('');
  
  try {
    // Use the dynamic issue creator
    const scriptPath = path.join(__dirname, 'create-dynamic-issue.js');
    let command = `node ${scriptPath} --type=custom --title="${title}" --description="${description}"`;
    
    if (labels.length > 0) {
      command += ` --labels="${labels.join(',')}"`;
    }
    
    if (assignee) {
      command += ` --assignee="${assignee}"`;
    }
    
    if (isDryRun) {
      command += ' --dry-run';
    }
    
    execSync(command, {
      encoding: 'utf-8',
      stdio: 'inherit'
    });
    
    console.log('✅ Custom issue creation completed');
  } catch (error) {
    console.error('❌ Custom issue creation failed:', error.message);
    throw error;
  }
}

/**
 * Display help information
 */
function displayHelp() {
  console.log('Enhanced GitHub Issue Creator');
  console.log('============================');
  console.log('');
  console.log('This tool provides a unified interface for creating GitHub issues with multiple modes:');
  console.log('');
  console.log('Modes:');
  console.log('  --mode=template      Create issues from GITHUB_ISSUES_TO_CREATE.md (existing functionality)');
  console.log('  --mode=job-failure   Create issue for workflow job failure (new capability)');
  console.log('  --mode=custom        Create custom issue with flexible parameters (new capability)');
  console.log('  --mode=interactive   Interactive guided mode (default)');
  console.log('');
  console.log('Job Failure Mode Options:');
  console.log('  --job=JOB_TYPE       Job type (required for job-failure mode)');
  console.log('  --workflow=NAME      Workflow name (optional, defaults to verification-pipeline)');
  console.log('');
  console.log('Available job types:');
  Object.keys(JOB_FAILURE_TEMPLATES).forEach(job => {
    console.log(`    ${job}`);
  });
  console.log('');
  console.log('Custom Mode Options:');
  console.log('  --title="TITLE"      Issue title (required for custom mode)');
  console.log('  --description="DESC" Issue description (required for custom mode)');
  console.log('  --labels="a,b,c"     Comma-separated labels (optional)');
  console.log('  --assignee=USER      GitHub username to assign (optional, default: g2goose)');
  console.log('');
  console.log('Global Options:');
  console.log('  --dry-run            Preview without creating issues');
  console.log('  --help               Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  # Interactive mode (recommended for first-time users)');
  console.log('  node scripts/enhanced-issue-creator.js');
  console.log('');
  console.log('  # Create issue for Code Quality job failure');
  console.log('  node scripts/enhanced-issue-creator.js --mode=job-failure --job=code-quality');
  console.log('');
  console.log('  # Create custom bug report');
  console.log('  node scripts/enhanced-issue-creator.js --mode=custom --title="[BUG] API Error" --description="API returning 500 errors"');
  console.log('');
  console.log('  # Batch create from template (existing functionality)');
  console.log('  node scripts/enhanced-issue-creator.js --mode=template');
  console.log('');
  console.log('This enhanced infrastructure removes the limitation of only being able to create');
  console.log('predefined issues from templates and now supports dynamic issue creation for any');
  console.log('workflow job failure or custom issue type.');
}

/**
 * Main execution
 */
async function main() {
  try {
    if (args.includes('--help')) {
      displayHelp();
      return;
    }

    console.log('🚀 Enhanced GitHub Issue Creator');
    console.log(`Repository: ${REPO_OWNER}/${REPO_NAME}`);
    console.log(`Mode: ${config.mode}`);
    console.log('');

    switch (config.mode) {
      case 'template':
        return runTemplateBased();
        
      case 'job-failure':
        if (!config.job) {
          throw new Error('--job parameter required for job-failure mode. Use --help for available job types.');
        }
        return createJobFailureIssue(config.job, config.workflow, config.dryRun);
        
      case 'custom':
        if (!config.title || !config.description) {
          throw new Error('--title and --description parameters required for custom mode.');
        }
        return createCustomIssue(config.title, config.description, config.labels, config.assignee, config.dryRun);
        
      case 'interactive':
        return interactiveMode();
        
      default:
        throw new Error(`Unknown mode: ${config.mode}. Use 'template', 'job-failure', 'custom', or 'interactive'.`);
    }

  } catch (error) {
    console.error('');
    console.error('💥 Error:', error.message);
    console.error('');
    console.error('Use --help for detailed usage information.');
    process.exit(1);
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runTemplateBased, createJobFailureIssue, createCustomIssue };