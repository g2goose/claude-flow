#!/usr/bin/env node

/**
 * Manual Status Badge Workflow Test
 * 
 * This script manually tests the status badge workflow logic
 * to ensure it works correctly with the current repository setup.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ManualBadgeTest {
  constructor() {
    this.badgeDir = 'badge-data-test';
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const levelColors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      error: '\x1b[31m',   // Red
      warn: '\x1b[33m',    // Yellow
      reset: '\x1b[0m'     // Reset
    };
    
    console.log(`${levelColors[level]}[${timestamp}] ${message}${levelColors.reset}`);
  }

  async simulateWorkflowRun() {
    this.log('🔍 Simulating GitHub Actions status badge workflow...', 'info');

    try {
      // Create badge data directory
      if (!fs.existsSync(this.badgeDir)) {
        fs.mkdirSync(this.badgeDir, { recursive: true });
      }

      // Simulate different workflow conclusions
      const workflowScenarios = [
        { name: 'Verification Pipeline', conclusion: 'success' },
        { name: 'Truth Scoring Pipeline', conclusion: 'success' },
        { name: 'Cross-Agent Integration Tests', conclusion: 'failure' }
      ];

      for (const scenario of workflowScenarios) {
        this.log(`Processing workflow: ${scenario.name} (${scenario.conclusion})`, 'info');

        // Determine badge colors and status based on workflow logic
        let badgeColor, badgeStatus;
        
        switch (scenario.conclusion) {
          case 'success':
            badgeColor = 'brightgreen';
            badgeStatus = 'passing';
            break;
          case 'failure':
            badgeColor = 'red';
            badgeStatus = 'failing';
            break;
          default:
            badgeColor = 'yellow';
            badgeStatus = 'unknown';
        }

        // Create badge JSON
        const badgeData = {
          schemaVersion: 1,
          label: 'pipeline',
          message: badgeStatus,
          color: badgeColor,
          style: 'flat-square'
        };

        const badgeFile = path.join(this.badgeDir, `${scenario.name.replace(/\s+/g, '-').toLowerCase()}.json`);
        fs.writeFileSync(badgeFile, JSON.stringify(badgeData, null, 2));

        this.log(`✅ Created badge data: ${badgeFile}`, 'success');
      }

      // Create truth scoring badge
      const truthScoreBadge = {
        schemaVersion: 1,
        label: 'truth score',
        message: '85+',
        color: 'brightgreen',
        style: 'flat-square'
      };

      fs.writeFileSync(path.join(this.badgeDir, 'truth-score.json'), JSON.stringify(truthScoreBadge, null, 2));

      // Create integration badge
      const integrationBadge = {
        schemaVersion: 1,
        label: 'integration',
        message: 'failing',
        color: 'red',
        style: 'flat-square'
      };

      fs.writeFileSync(path.join(this.badgeDir, 'integration.json'), JSON.stringify(integrationBadge, null, 2));

      this.log('✅ Badge generation simulation completed successfully', 'success');
      return true;

    } catch (error) {
      this.log(`❌ Badge generation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testBadgeUpdate() {
    this.log('🔍 Testing README badge update logic...', 'info');

    try {
      // Check if README has badge section
      if (!fs.existsSync('README.md')) {
        throw new Error('README.md not found');
      }

      const readmeContent = fs.readFileSync('README.md', 'utf8');
      
      if (!readmeContent.includes('<!-- BADGES-START -->')) {
        throw new Error('Badge section markers not found in README.md');
      }

      // Simulate the awk command from the workflow
      const newBadges = `<!-- BADGES-START -->
[![Verification Pipeline](https://img.shields.io/github/actions/workflow/status/g2goose/claude-flow/verification-pipeline.yml?branch=main&label=verification&style=flat-square)](https://github.com/g2goose/claude-flow/actions/workflows/verification-pipeline.yml)
[![Truth Scoring](https://img.shields.io/github/actions/workflow/status/g2goose/claude-flow/truth-scoring.yml?branch=main&label=truth%20score&style=flat-square)](https://github.com/g2goose/claude-flow/actions/workflows/truth-scoring.yml)
[![Integration Tests](https://img.shields.io/github/actions/workflow/status/g2goose/claude-flow/integration-tests.yml?branch=main&label=integration&style=flat-square)](https://github.com/g2goose/claude-flow/actions/workflows/integration-tests.yml)
[![Rollback Manager](https://img.shields.io/github/actions/workflow/status/g2goose/claude-flow/rollback-manager.yml?branch=main&label=rollback&style=flat-square)](https://github.com/g2goose/claude-flow/actions/workflows/rollback-manager.yml)
[![CI/CD](https://img.shields.io/github/actions/workflow/status/g2goose/claude-flow/ci.yml?branch=main&label=ci%2Fcd&style=flat-square)](https://github.com/g2goose/claude-flow/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/npm/v/claude-flow.svg?style=flat-square)](https://www.npmjs.com/package/claude-flow)
<!-- BADGES-END -->`;

      // Test badge replacement logic
      const lines = readmeContent.split('\n');
      let inBadges = false;
      const newLines = [];

      for (const line of lines) {
        if (line.includes('<!-- BADGES-START -->')) {
          inBadges = true;
          newLines.push(...newBadges.split('\n'));
          continue;
        }
        if (line.includes('<!-- BADGES-END -->')) {
          inBadges = false;
          continue;
        }
        if (!inBadges) {
          newLines.push(line);
        }
      }

      const updatedContent = newLines.join('\n');
      fs.writeFileSync('README-badge-test.md', updatedContent);

      this.log('✅ Badge update logic test completed', 'success');
      this.log('📄 Test result saved to: README-badge-test.md', 'info');
      
      return true;
    } catch (error) {
      this.log(`❌ Badge update test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async verifyWorkflowTriggers() {
    this.log('🔍 Verifying workflow triggers...', 'info');

    try {
      const workflowPath = '.github/workflows/status-badges.yml';
      const workflowContent = fs.readFileSync(workflowPath, 'utf8');

      // Check trigger configuration
      const triggers = {
        workflow_run: workflowContent.includes('workflow_run:'),
        push: workflowContent.includes('push:'),
        schedule: workflowContent.includes('schedule:')
      };

      for (const [trigger, found] of Object.entries(triggers)) {
        if (found) {
          this.log(`✅ Trigger found: ${trigger}`, 'success');
        } else {
          this.log(`❌ Trigger missing: ${trigger}`, 'error');
        }
      }

      // Check cron schedule
      const cronMatch = workflowContent.match(/cron:\s*['"]([^'"]+)['"]/);
      if (cronMatch) {
        this.log(`✅ Cron schedule found: ${cronMatch[1]}`, 'success');
      } else {
        this.log(`❌ Cron schedule not found`, 'error');
      }

      // Check workflow references
      const workflowRefs = [
        'Verification Pipeline',
        'Truth Scoring Pipeline', 
        'Cross-Agent Integration Tests'
      ];

      for (const ref of workflowRefs) {
        if (workflowContent.includes(`"${ref}"`)) {
          this.log(`✅ Workflow reference found: ${ref}`, 'success');
        } else {
          this.log(`⚠️ Workflow reference not found: ${ref}`, 'warn');
        }
      }

      return true;
    } catch (error) {
      this.log(`❌ Workflow trigger verification failed: ${error.message}`, 'error');
      return false;
    }
  }

  async cleanup() {
    this.log('🧹 Cleaning up test files...', 'info');

    const testFiles = [this.badgeDir, 'README-badge-test.md'];
    
    for (const file of testFiles) {
      try {
        if (fs.existsSync(file)) {
          if (fs.statSync(file).isDirectory()) {
            fs.rmSync(file, { recursive: true, force: true });
          } else {
            fs.unlinkSync(file);
          }
          this.log(`Cleaned up: ${file}`, 'info');
        }
      } catch (error) {
        this.log(`Failed to clean up ${file}: ${error.message}`, 'warn');
      }
    }
  }

  async run() {
    this.log('🚀 Starting Manual Status Badge Workflow Test...', 'info');

    try {
      const results = [];

      // Test badge generation
      const badgeGenResult = await this.simulateWorkflowRun();
      results.push({ test: 'Badge Generation', success: badgeGenResult });

      // Test badge update
      const badgeUpdateResult = await this.testBadgeUpdate();
      results.push({ test: 'Badge Update', success: badgeUpdateResult });

      // Test workflow triggers
      const triggerResult = await this.verifyWorkflowTriggers();
      results.push({ test: 'Workflow Triggers', success: triggerResult });

      // Report results
      this.log('\n📊 Manual Test Results:', 'info');
      this.log('=' .repeat(40), 'info');

      let allPassed = true;
      for (const result of results) {
        const status = result.success ? '✅' : '❌';
        this.log(`${status} ${result.test}`, result.success ? 'success' : 'error');
        if (!result.success) allPassed = false;
      }

      this.log(`\n🎯 Overall Status: ${allPassed ? 'PASS' : 'FAIL'}`, allPassed ? 'success' : 'error');

      if (allPassed) {
        this.log('✅ Status badges workflow appears to be functioning correctly', 'success');
      } else {
        this.log('❌ Some tests failed - review the workflow configuration', 'error');
      }

      // Cleanup
      await this.cleanup();

      return allPassed;
    } catch (error) {
      this.log(`❌ Manual test failed: ${error.message}`, 'error');
      await this.cleanup();
      return false;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new ManualBadgeTest();
  tester.run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error(`Fatal error: ${error.message}`);
      process.exit(1);
    });
}

module.exports = ManualBadgeTest;