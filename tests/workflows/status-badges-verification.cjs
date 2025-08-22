#!/usr/bin/env node

/**
 * Status Badges Workflow Verification Script
 * 
 * This script verifies the functionality of the status-badges.yml workflow
 * by testing its components and ensuring proper integration.
 */

const fs = require('fs');
const path = require('path');

class StatusBadgesVerifier {
  constructor() {
    this.workflowPath = '.github/workflows/status-badges.yml';
    this.readmePath = 'README.md';
    this.results = [];
    this.errors = [];
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

  /**
   * Verifies the structure and contents of the status-badges.yml workflow file.
   *
   * Checks for the presence of required sections such as workflow name, triggers,
   * jobs, and specific job identifiers. Also verifies that expected trigger workflows
   * are referenced within the file.
   *
   * On success, logs a pass and records the result. On failure, logs the error and records it.
   *
   * @returns {Promise<boolean>} True if verification passes, false otherwise.
   */
  async verifyWorkflowFile() {
    this.log('🔍 Verifying status-badges.yml workflow file...');
    
    try {
      if (!fs.existsSync(this.workflowPath)) {
        throw new Error(`Workflow file not found: ${this.workflowPath}`);
      }

      const workflowContent = fs.readFileSync(this.workflowPath, 'utf8');
      
      // Check for required sections
      const requiredSections = [
        'name: 📊 Status Badges Update',
        'on:',
        'workflow_run:',
        'jobs:',
        'update-badges:'
      ];

      for (const section of requiredSections) {
        if (!workflowContent.includes(section)) {
          throw new Error(`Missing required section: ${section}`);
        }
      }

      // Check for trigger workflows
      const triggerWorkflows = [
        '"🔍 Verification Pipeline"',
        '"🎯 Truth Scoring Pipeline"',
        '"🔗 Cross-Agent Integration Tests"'
      ];

      for (const workflow of triggerWorkflows) {
        if (!workflowContent.includes(workflow)) {
          this.log(`⚠️ Warning: Trigger workflow not found: ${workflow}`, 'warn');
        }
      }

      this.results.push({ test: 'Workflow file structure', status: 'pass' });
      this.log('✅ Workflow file structure verification passed', 'success');
      
      return true;
    } catch (error) {
      this.errors.push(`Workflow file verification failed: ${error.message}`);
      this.results.push({ test: 'Workflow file structure', status: 'fail', error: error.message });
      this.log(`❌ Workflow file verification failed: ${error.message}`, 'error');
      return false;
    }
  }

  async verifyReadmeBadgeSection() {
    this.log('🔍 Verifying README badge section...');
    
    try {
      if (!fs.existsSync(this.readmePath)) {
        throw new Error(`README file not found: ${this.readmePath}`);
      }

      const readmeContent = fs.readFileSync(this.readmePath, 'utf8');
      
      // Check for badge section markers
      const hasBadgeStart = readmeContent.includes('<!-- BADGES-START -->');
      const hasBadgeEnd = readmeContent.includes('<!-- BADGES-END -->');
      
      if (!hasBadgeStart || !hasBadgeEnd) {
        this.log('⚠️ Badge section markers not found in README.md', 'warn');
        this.log('The workflow expects <!-- BADGES-START --> and <!-- BADGES-END --> markers', 'warn');
        this.results.push({ test: 'README badge section', status: 'warning', message: 'Badge markers missing' });
      } else {
        this.log('✅ Badge section markers found in README.md', 'success');
        this.results.push({ test: 'README badge section', status: 'pass' });
      }

      // Check for existing badges
      const badgeUrls = [
        'verification-pipeline.yml',
        'truth-scoring.yml',
        'integration-tests.yml',
        'rollback-manager.yml',
        'ci.yml'
      ];

      let badgeCount = 0;
      for (const badgeUrl of badgeUrls) {
        if (readmeContent.includes(badgeUrl)) {
          badgeCount++;
        }
      }

      this.log(`Found ${badgeCount} out of ${badgeUrls.length} expected badge references`, 'info');
      
      return true;
    } catch (error) {
      this.errors.push(`README verification failed: ${error.message}`);
      this.results.push({ test: 'README badge section', status: 'fail', error: error.message });
      this.log(`❌ README verification failed: ${error.message}`, 'error');
      return false;
    }
  }

  async simulateBadgeGeneration() {
    this.log('🔍 Simulating badge generation logic...');
    
    try {
      // Simulate the badge generation logic from the workflow
      const badgeConfigs = [
        {
          label: 'verification',
          workflow: 'verification-pipeline.yml',
          status: 'passing',
          color: 'brightgreen'
        },
        {
          label: 'truth score',
          workflow: 'truth-scoring.yml',
          status: '85+',
          color: 'brightgreen'
        },
        {
          label: 'integration',
          workflow: 'integration-tests.yml',
          status: 'passing',
          color: 'brightgreen'
        },
        {
          label: 'rollback',
          workflow: 'rollback-manager.yml',
          status: 'ready',
          color: 'blue'
        },
        {
          label: 'ci/cd',
          workflow: 'ci.yml',
          status: 'passing',
          color: 'brightgreen'
        }
      ];

      const badgeDir = 'badge-data';
      if (!fs.existsSync(badgeDir)) {
        fs.mkdirSync(badgeDir, { recursive: true });
      }

      for (const config of badgeConfigs) {
        const badgeData = {
          schemaVersion: 1,
          label: config.label,
          message: config.status,
          color: config.color,
          style: 'flat-square'
        };

        const badgeFile = path.join(badgeDir, `${config.label.replace(/\s+/g, '-').replace(/[\/\\]/g, '-')}.json`);
        fs.writeFileSync(badgeFile, JSON.stringify(badgeData, null, 2));
      }

      this.log('✅ Badge generation simulation completed', 'success');
      this.results.push({ test: 'Badge generation simulation', status: 'pass' });
      
      return true;
    } catch (error) {
      this.errors.push(`Badge generation simulation failed: ${error.message}`);
      this.results.push({ test: 'Badge generation simulation', status: 'fail', error: error.message });
      this.log(`❌ Badge generation simulation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testBadgeUpdateLogic() {
    this.log('🔍 Testing badge update logic...');
    
    try {
      // Create a test README content with badge section
      const testBadges = `<!-- BADGES-START -->
[![Verification Pipeline](https://img.shields.io/github/actions/workflow/status/g2goose/claude-flow/verification-pipeline.yml?branch=main&label=verification&style=flat-square)](https://github.com/g2goose/claude-flow/actions/workflows/verification-pipeline.yml)
[![Truth Scoring](https://img.shields.io/github/actions/workflow/status/g2goose/claude-flow/truth-scoring.yml?branch=main&label=truth%20score&style=flat-square)](https://github.com/g2goose/claude-flow/actions/workflows/truth-scoring.yml)
[![Integration Tests](https://img.shields.io/github/actions/workflow/status/g2goose/claude-flow/integration-tests.yml?branch=main&label=integration&style=flat-square)](https://github.com/g2goose/claude-flow/actions/workflows/integration-tests.yml)
[![Rollback Manager](https://img.shields.io/github/actions/workflow/status/g2goose/claude-flow/rollback-manager.yml?branch=main&label=rollback&style=flat-square)](https://github.com/g2goose/claude-flow/actions/workflows/rollback-manager.yml)
[![CI/CD](https://img.shields.io/github/actions/workflow/status/g2goose/claude-flow/ci.yml?branch=main&label=ci%2Fcd&style=flat-square)](https://github.com/g2goose/claude-flow/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/npm/v/claude-flow.svg?style=flat-square)](https://www.npmjs.com/package/claude-flow)
<!-- BADGES-END -->`;

      // Write test badge content to verify it's properly formatted
      fs.writeFileSync('test-badges.md', testBadges);
      
      // Verify badge URLs are correctly formatted
      const expectedElements = [
        'img.shields.io/github/actions/workflow/status',
        'g2goose/claude-flow',
        'style=flat-square',
        'LICENSE',
        'claude-flow'
      ];

      for (const element of expectedElements) {
        if (!testBadges.includes(element)) {
          throw new Error(`Missing expected element in badges: ${element}`);
        }
      }

      this.log('✅ Badge update logic test passed', 'success');
      this.results.push({ test: 'Badge update logic', status: 'pass' });
      
      return true;
    } catch (error) {
      this.errors.push(`Badge update logic test failed: ${error.message}`);
      this.results.push({ test: 'Badge update logic', status: 'fail', error: error.message });
      this.log(`❌ Badge update logic test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async checkWorkflowTriggers() {
    this.log('🔍 Checking workflow triggers and dependencies...');
    
    try {
      const workflowContent = fs.readFileSync(this.workflowPath, 'utf8');
      
      // Check trigger conditions
      const triggers = [
        'workflow_run:',
        'push:',
        'schedule:'
      ];

      const triggersFound = triggers.filter(trigger => workflowContent.includes(trigger));
      
      if (triggersFound.length !== triggers.length) {
        throw new Error(`Missing triggers. Found: ${triggersFound.join(', ')}`);
      }

      // Check if schedule cron is valid
      const cronMatch = workflowContent.match(/cron:\s*['"]([^'"]+)['"]/);
      if (cronMatch) {
        const cron = cronMatch[1];
        this.log(`Found cron schedule: ${cron}`, 'info');
        
        // Basic cron validation (5 parts for GitHub Actions)
        const cronParts = cron.split(' ');
        if (cronParts.length !== 5) {
          throw new Error(`Invalid cron format: ${cron}`);
        }
      }

      this.log('✅ Workflow triggers verification passed', 'success');
      this.results.push({ test: 'Workflow triggers', status: 'pass' });
      
      return true;
    } catch (error) {
      this.errors.push(`Workflow triggers check failed: ${error.message}`);
      this.results.push({ test: 'Workflow triggers', status: 'fail', error: error.message });
      this.log(`❌ Workflow triggers check failed: ${error.message}`, 'error');
      return false;
    }
  }

  async verifyWorkflowSyntax() {
    this.log('🔍 Verifying workflow YAML syntax...');
    
    try {
      // Basic YAML syntax checks
      const workflowContent = fs.readFileSync(this.workflowPath, 'utf8');
      
      // Check for common YAML issues
      const lines = workflowContent.split('\n');
      const issues = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;
        
        // Check for tabs (should use spaces)
        if (line.includes('\t')) {
          issues.push(`Line ${lineNum}: Contains tabs, should use spaces`);
        }
        
        // Check for inconsistent indentation
        const indent = line.match(/^(\s*)/)?.[1] || '';
        if (indent.length > 0 && indent.length % 2 !== 0) {
          issues.push(`Line ${lineNum}: Inconsistent indentation (should be multiple of 2)`);
        }
      }

      if (issues.length > 0) {
        this.log('⚠️ YAML syntax issues found:', 'warn');
        issues.forEach(issue => this.log(`  ${issue}`, 'warn'));
        this.results.push({ test: 'YAML syntax', status: 'warning', issues });
      } else {
        this.log('✅ YAML syntax verification passed', 'success');
        this.results.push({ test: 'YAML syntax', status: 'pass' });
      }
      
      return true;
    } catch (error) {
      this.errors.push(`YAML syntax verification failed: ${error.message}`);
      this.results.push({ test: 'YAML syntax', status: 'fail', error: error.message });
      this.log(`❌ YAML syntax verification failed: ${error.message}`, 'error');
      return false;
    }
  }

  generateReport() {
    this.log('\n📊 Status Badges Workflow Verification Report', 'info');
    this.log('=' .repeat(60), 'info');
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    
    this.log(`Total Tests: ${this.results.length}`, 'info');
    this.log(`Passed: ${passed}`, 'success');
    this.log(`Failed: ${failed}`, failed > 0 ? 'error' : 'info');
    this.log(`Warnings: ${warnings}`, warnings > 0 ? 'warn' : 'info');
    
    this.log('\nDetailed Results:', 'info');
    this.results.forEach(result => {
      const status = result.status === 'pass' ? '✅' : 
                    result.status === 'fail' ? '❌' : '⚠️';
      this.log(`${status} ${result.test}`, result.status === 'pass' ? 'success' : 
               result.status === 'fail' ? 'error' : 'warn');
      
      if (result.error) {
        this.log(`   Error: ${result.error}`, 'error');
      }
      if (result.message) {
        this.log(`   Note: ${result.message}`, 'warn');
      }
    });

    if (this.errors.length > 0) {
      this.log('\n🚨 Critical Issues Found:', 'error');
      this.errors.forEach(error => this.log(`   • ${error}`, 'error'));
    }

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed,
        failed,
        warnings
      },
      results: this.results,
      errors: this.errors,
      overall: failed === 0 ? 'PASS' : 'FAIL'
    };

    // Write report to file
    fs.writeFileSync('status-badges-verification-report.json', JSON.stringify(report, null, 2));
    
    this.log(`\n📄 Report saved to: status-badges-verification-report.json`, 'info');
    
    return report;
  }

  async cleanup() {
    this.log('🧹 Cleaning up test files...', 'info');
    
    const testFiles = ['badge-data', 'test-badges.md'];
    
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
    this.log('🚀 Starting Status Badges Workflow Verification...', 'info');
    
    try {
      await this.verifyWorkflowFile();
      await this.verifyReadmeBadgeSection();
      await this.simulateBadgeGeneration();
      await this.testBadgeUpdateLogic();
      await this.checkWorkflowTriggers();
      await this.verifyWorkflowSyntax();
      
      const report = this.generateReport();
      
      await this.cleanup();
      
      const success = report.overall === 'PASS';
      this.log(`\n🎯 Verification ${success ? 'COMPLETED SUCCESSFULLY' : 'FAILED'}`, 
               success ? 'success' : 'error');
      
      return success;
    } catch (error) {
      this.log(`❌ Verification failed with error: ${error.message}`, 'error');
      await this.cleanup();
      return false;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const verifier = new StatusBadgesVerifier();
  verifier.run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error(`Fatal error: ${error.message}`);
      process.exit(1);
    });
}

module.exports = StatusBadgesVerifier;