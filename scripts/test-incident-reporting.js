#!/usr/bin/env node

/**
 * Test script for rollback incident reporting functionality
 */

import { generateRollbackIncidentReport } from './generate-rollback-incident-report.js';
import { IncidentReporter } from '../src/cli/simple-commands/init/rollback/incident-reporter.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function testIncidentReporting() {
  console.log('🧪 Testing Rollback Incident Reporting');
  console.log('=====================================\n');

  try {
    // Test 1: Generate incident report from data
    console.log('1️⃣ Testing incident report generation...');
    
    const sampleRollbackData = {
      sessionId: 'test-rollback-123',
      timestamp: new Date().toISOString(),
      trigger: {
        event: 'workflow_run',
        workflow: 'Verification Pipeline',
        conclusion: 'failure',
        commit: 'abc123def456',
        branch: 'main'
      },
      failure: {
        type: 'ci_failure',
        severity: 'high',
        rollbackRequired: true
      },
      rollback: {
        target: 'def456abc123',
        reason: 'Automated rollback due to CI failure'
      },
      verification: {
        buildPassed: true,
        testsPassed: true,
        cliWorking: true,
        systemHealthy: true
      },
      monitoring: {
        duration: '15 minutes',
        systemStable: true,
        issuesDetected: 0
      },
      scope: 'application'
    };

    const report = generateRollbackIncidentReport(sampleRollbackData);
    console.log('✅ Incident report generated successfully');
    
    // Test 2: Test IncidentReporter class
    console.log('\n2️⃣ Testing IncidentReporter class...');
    
    const tempDir = join(process.cwd(), 'test-incidents');
    mkdirSync(tempDir, { recursive: true });
    
    const incidentReporter = new IncidentReporter(tempDir);
    
    const testData = {
      type: 'Manual Rollback',
      severity: 'Medium',
      reason: 'Test rollback for validation',
      sourceCommit: 'abc123',
      targetCommit: 'def456',
      scope: 'application',
      success: true,
      errors: [],
      warnings: ['Test warning'],
      actions: ['Test action performed']
    };

    const result = await incidentReporter.generateRollbackIncidentReport(testData);
    
    if (result.success) {
      console.log(`✅ Incident report saved: ${result.reportFile}`);
      console.log(`📋 Session ID: ${result.sessionId}`);
    } else {
      console.log('❌ Failed to generate incident report');
      console.log('Errors:', result.errors);
    }

    // Test 3: List incident reports
    console.log('\n3️⃣ Testing incident report listing...');
    
    const listResult = await incidentReporter.listIncidentReports();
    if (listResult.success) {
      console.log(`✅ Found ${listResult.reports.length} incident reports`);
      listResult.reports.forEach(report => {
        console.log(`  - ${report.filename} (Session: ${report.sessionId})`);
      });
    } else {
      console.log('❌ Failed to list incident reports');
    }

    // Test 4: Preview generated content
    console.log('\n4️⃣ Incident report preview:');
    console.log('=' + '='.repeat(60));
    console.log(report.substring(0, 800) + '...');
    console.log('=' + '='.repeat(60));

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📋 Generated files:');
    console.log(`  - ${result.reportFile}`);
    console.log(`  - ${result.reportFile.replace('.md', '.json')}`);
    
    console.log('\n🧹 Cleanup:');
    console.log(`To clean up test files, run: rm -rf ${tempDir}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testIncidentReporting();
}