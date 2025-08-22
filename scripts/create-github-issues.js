#!/usr/bin/env node
/**
 * GitHub Issues Creator Script
 * 
 * This script parses GITHUB_ISSUES_TO_CREATE.md and creates GitHub issues
 * using the GitHub CLI or API. It assigns @copilot to each issue as requested.
 * 
 * Usage:
 *   node scripts/create-github-issues.js
 *   node scripts/create-github-issues.js --dry-run  # Preview without creating
 *   node scripts/create-github-issues.js --method=api  # Use API instead of CLI
 * 
 * Prerequisites:
 *   - GitHub CLI authenticated: gh auth login
 *   - OR GITHUB_TOKEN environment variable set for API mode
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const issuesFile = path.join(rootDir, 'GITHUB_ISSUES_TO_CREATE.md');

// Configuration
const REPO_OWNER = 'g2goose';
const REPO_NAME = 'claude-flow';
const ASSIGNEE = 'copilot';

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const useAPI = args.includes('--method=api');

console.log('🚀 GitHub Issues Creator');
console.log(`Repository: ${REPO_OWNER}/${REPO_NAME}`);
console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'CREATE ISSUES'}`);
console.log(`Method: ${useAPI ? 'GitHub API' : 'GitHub CLI'}`);
console.log('');

/**
 * Parse GITHUB_ISSUES_TO_CREATE.md file to extract issue data
 */
function parseIssuesFile() {
  if (!fs.existsSync(issuesFile)) {
    throw new Error(`Issues file not found: ${issuesFile}`);
  }

  const content = fs.readFileSync(issuesFile, 'utf-8');
  const issues = [];
  
  // Split content by issue sections (## 🔴, ## 🟡, ## 🟢)
  const sections = content.split(/## [🔴🟡🟢]/);
  
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    
    // Extract title (first line after issue marker)
    const titleMatch = section.match(/Issue #(\d+):\s*(.+?)(?:\n|$)/);
    if (!titleMatch) continue;
    
    const issueNumber = titleMatch[1];
    const issueTitle = titleMatch[2].trim();
    
    // Extract structured data
    const titlePattern = /\*\*Title:\*\*\s*`(.+?)`/;
    const labelsPattern = /\*\*Labels:\*\*\s*(.+)/;
    const assigneePattern = /\*\*Assignee:\*\*\s*(.+)/;
    
    const actualTitle = section.match(titlePattern)?.[1] || issueTitle;
    const labelsText = section.match(labelsPattern)?.[1] || '';
    const assigneeText = section.match(assigneePattern)?.[1] || `@${ASSIGNEE}`;
    
    // Parse labels
    const labels = labelsText
      .split(',')
      .map(label => label.trim().replace(/`/g, ''))
      .filter(label => label && label !== '');
    
    // Extract description (everything after ### Description until next ###)
    const descriptionMatch = section.match(/### Description\s*\n([\s\S]*?)(?=###|$)/);
    let description = descriptionMatch?.[1]?.trim() || '';
    
    // Include the full section content as the body, cleaned up
    let body = section
      .replace(/\*\*Title:\*\*.*?\n/, '')
      .replace(/\*\*Labels:\*\*.*?\n/, '')
      .replace(/\*\*Assignee:\*\*.*?\n/, '')
      .trim();
    
    // Add issue number prefix to title if not already present
    const finalTitle = actualTitle.includes(`Issue #${issueNumber}`) 
      ? actualTitle 
      : `${actualTitle}`;
    
    issues.push({
      number: parseInt(issueNumber),
      title: finalTitle,
      body: body,
      labels: labels,
      assignees: [ASSIGNEE]
    });
  }
  
  return issues.sort((a, b) => a.number - b.number);
}

/**
 * Create issue using GitHub CLI
 */
function createIssueWithCLI(issue) {
  const labelsArg = issue.labels.length > 0 ? `--label "${issue.labels.join(',')}"` : '';
  const assigneesArg = `--assignee "${issue.assignees.join(',')}"`;
  
  // Escape double quotes in title and body
  const escapedTitle = issue.title.replace(/"/g, '\\"');
  const escapedBody = issue.body.replace(/"/g, '\\"');
  
  const command = [
    'gh', 'issue', 'create',
    `--repo "${REPO_OWNER}/${REPO_NAME}"`,
    `--title "${escapedTitle}"`,
    `--body "${escapedBody}"`,
    labelsArg,
    assigneesArg
  ].filter(Boolean).join(' ');
  
  if (isDryRun) {
    console.log(`Would execute: ${command}`);
    return { success: true, url: `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new` };
  }
  
  try {
    const output = execSync(command, { encoding: 'utf-8' });
    const urlMatch = output.match(/https:\/\/github\.com\/[^\s]+/);
    return { 
      success: true, 
      url: urlMatch?.[0] || 'Unknown URL',
      output: output.trim()
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      stderr: error.stderr?.toString() || ''
    };
  }
}

/**
 * Create issue using GitHub API
 */
async function createIssueWithAPI(issue) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is required for API mode');
  }
  
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`;
  const data = {
    title: issue.title,
    body: issue.body,
    labels: issue.labels,
    assignees: issue.assignees
  };
  
  if (isDryRun) {
    console.log(`Would POST to: ${url}`);
    console.log(`Data:`, JSON.stringify(data, null, 2));
    return { success: true, url: `${url}/new` };
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API Error ${response.status}: ${errorData}`);
    }
    
    const result = await response.json();
    return { 
      success: true, 
      url: result.html_url,
      number: result.number
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Check prerequisites
 */
function checkPrerequisites() {
  if (useAPI) {
    if (!process.env.GITHUB_TOKEN) {
      console.error('❌ GITHUB_TOKEN environment variable is required for API mode');
      process.exit(1);
    }
    return;
  }
  
  // Check GitHub CLI
  try {
    execSync('gh --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ GitHub CLI not found. Please install: https://cli.github.com/');
    process.exit(1);
  }
  
  if (!isDryRun) {
    try {
      execSync('gh auth status', { stdio: 'ignore' });
    } catch (error) {
      console.error('❌ GitHub CLI not authenticated. Run: gh auth login');
      process.exit(1);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    // Check prerequisites
    checkPrerequisites();
    
    // Parse issues
    console.log('📖 Parsing issues file...');
    const issues = parseIssuesFile();
    console.log(`Found ${issues.length} issues to create\n`);
    
    // Display issues preview
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. Issue #${issue.number}: ${issue.title}`);
      console.log(`   Labels: ${issue.labels.join(', ') || 'none'}`);
      console.log(`   Assignees: ${issue.assignees.join(', ')}`);
      console.log(`   Body length: ${issue.body.length} characters`);
      console.log('');
    });
    
    if (isDryRun) {
      console.log('🔍 DRY RUN - No issues will be created');
      return;
    }
    
    // Create issues
    console.log('🎯 Creating issues...\n');
    const results = [];
    
    for (const issue of issues) {
      console.log(`Creating Issue #${issue.number}: ${issue.title}`);
      
      let result;
      if (useAPI) {
        result = await createIssueWithAPI(issue);
      } else {
        result = createIssueWithCLI(issue);
      }
      
      if (result.success) {
        console.log(`✅ Created: ${result.url}`);
        results.push({ issue, success: true, url: result.url });
      } else {
        console.log(`❌ Failed: ${result.error}`);
        if (result.stderr) {
          console.log(`   stderr: ${result.stderr}`);
        }
        results.push({ issue, success: false, error: result.error });
      }
      
      console.log('');
      
      // Rate limiting delay
      if (!isDryRun) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('📊 Summary:');
    console.log(`✅ Successfully created: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\n🔄 Failed issues:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`- Issue #${r.issue.number}: ${r.error}`);
      });
    }
    
    if (successful > 0) {
      console.log('\n🎉 All issues have been assigned to @copilot as requested!');
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);