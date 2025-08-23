#!/usr/bin/env node

/**
 * CLI tool for creating rollback incident reports
 * This can be used for manual rollbacks or when the automated system is not available
 */

import { readFileSync, writeFileSync } from 'fs';
import { generateRollbackIncidentReport } from './generate-rollback-incident-report.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('🔄 Rollback Incident Report Generator');
  console.log('=====================================\n');
  
  try {
    // Gather incident information interactively
    const sessionId = await question('Rollback Session ID (or press Enter for auto-generated): ') || 
                     `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const incidentType = await question('Incident Type (Manual Rollback/Automated Rollback/Rollback Failure): ') || 'Manual Rollback';
    
    const severity = await question('Severity (Critical/High/Medium/Low): ') || 'Medium';
    
    const sourceCommit = await question('Source Commit SHA: ');
    if (!sourceCommit) {
      console.error('❌ Source commit SHA is required');
      process.exit(1);
    }
    
    const targetCommit = await question('Target Commit SHA: ');
    if (!targetCommit) {
      console.error('❌ Target commit SHA is required');
      process.exit(1);
    }
    
    const reason = await question('Rollback Reason: ') || 'Manual rollback requested';
    
    const scope = await question('Rollback Scope (application/database/infrastructure/full): ') || 'application';
    
    const branch = await question('Branch: ') || 'main';
    
    const workflow = await question('Failed Workflow Name (if applicable): ') || 'Manual process';
    
    const duration = await question('Impact Duration (e.g., "15 minutes", "2 hours"): ') || 'Unknown';
    
    const buildPassed = (await question('Build verification passed? (y/n): ') || 'y').toLowerCase() === 'y';
    const systemHealthy = (await question('System healthy after rollback? (y/n): ') || 'y').toLowerCase() === 'y';
    
    console.log('\n📋 Generating incident report...');
    
    // Build rollback data object
    const rollbackData = {
      sessionId,
      timestamp: new Date().toISOString(),
      trigger: {
        event: 'manual',
        workflow: workflow,
        conclusion: 'manual_rollback',
        commit: sourceCommit,
        branch: branch
      },
      failure: {
        type: incidentType.toLowerCase().includes('failure') ? 'rollback_failure' : 'manual_intervention',
        severity: severity.toLowerCase(),
        rollbackRequired: true
      },
      rollback: {
        target: targetCommit,
        reason: reason
      },
      verification: {
        buildPassed: buildPassed,
        testsPassed: buildPassed, // Assume tests passed if build passed
        cliWorking: buildPassed,
        systemHealthy: systemHealthy
      },
      monitoring: {
        duration: duration,
        systemStable: systemHealthy,
        issuesDetected: systemHealthy ? 0 : 1
      },
      scope: scope
    };
    
    // Generate the report
    const report = generateRollbackIncidentReport(rollbackData);
    
    // Save to file
    const filename = `rollback-incident-${sessionId}.md`;
    writeFileSync(filename, report);
    
    console.log(`✅ Incident report generated: ${filename}`);
    console.log('\n📄 Report preview:');
    console.log('='.repeat(50));
    console.log(report.substring(0, 500) + '...');
    console.log('='.repeat(50));
    
    console.log('\n🔗 To create a GitHub issue with this report:');
    console.log(`1. Go to: https://github.com/YOUR_ORG/YOUR_REPO/issues/new?template=rollback-incident.md`);
    console.log(`2. Copy the content from: ${filename}`);
    console.log('3. Fill in any additional details');
    console.log('4. Submit the issue\n');
    
    const createIssue = await question('Create GitHub issue automatically? (requires gh CLI) (y/n): ');
    if (createIssue.toLowerCase() === 'y') {
      console.log('🚀 Creating GitHub issue...');
      
      // Try to create GitHub issue using gh CLI
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      try {
        const title = `🔄 Rollback Incident: ${reason} (${new Date().toISOString().split('T')[0]})`;
        const command = `gh issue create --title "${title}" --body-file "${filename}" --label "rollback,incident,manual"`;
        
        const { stdout } = await execAsync(command);
        console.log('✅ GitHub issue created successfully!');
        console.log(stdout);
      } catch (error) {
        console.log('❌ Failed to create GitHub issue automatically');
        console.log('Please create the issue manually using the generated file');
        console.log(`Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error generating incident report:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as generateIncidentReportInteractive };