#!/usr/bin/env node

/**
 * Workflow Integration Verification Runner
 * 
 * This script runs comprehensive verification tests for both status-badges
 * and rollback-manager workflows, ensuring they work correctly and integrate
 * properly with other workflows.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const StatusBadgesVerifier = require('./status-badges-verification.cjs');
const RollbackManagerVerifier = require('./rollback-manager-verification.cjs');

class WorkflowIntegrationVerifier {
  constructor() {
    this.results = {
      statusBadges: null,
      rollbackManager: null,
      integration: []
    };
    this.startTime = Date.now();
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

  async verifyWorkflowReferences() {
    this.log('🔍 Verifying workflow references and dependencies...');
    
    try {
      const workflowsDir = '.github/workflows';
      const workflowFiles = fs.readdirSync(workflowsDir)
        .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));

      this.log(`Found ${workflowFiles.length} workflow files`, 'info');

      // Check if status-badges workflow references exist in other workflows
      const statusBadgesRefs = [];
      const rollbackManagerRefs = [];

      for (const file of workflowFiles) {
        const content = fs.readFileSync(path.join(workflowsDir, file), 'utf8');
        
        if (content.includes('status-badges') || content.includes('Status Badges')) {
          statusBadgesRefs.push(file);
        }
        
        if (content.includes('rollback-manager') || content.includes('Rollback Manager')) {
          rollbackManagerRefs.push(file);
        }
      }

      this.log(`Status badges references found in: ${statusBadgesRefs.join(', ') || 'none'}`, 'info');
      this.log(`Rollback manager references found in: ${rollbackManagerRefs.join(', ') || 'none'}`, 'info');

      // Check workflow triggers
      const statusBadgesContent = fs.readFileSync('.github/workflows/status-badges.yml', 'utf8');
      const rollbackManagerContent = fs.readFileSync('.github/workflows/rollback-manager.yml', 'utf8');

      // Extract referenced workflows from status-badges
      const statusTriggerWorkflows = this.extractWorkflowTriggers(statusBadgesContent);
      const rollbackTriggerWorkflows = this.extractWorkflowTriggers(rollbackManagerContent);

      this.log(`Status badges triggered by: ${statusTriggerWorkflows.join(', ')}`, 'info');
      this.log(`Rollback manager triggered by: ${rollbackTriggerWorkflows.join(', ')}`, 'info');

      // Verify that referenced workflows exist
      const missingWorkflows = [];
      
      for (const workflow of [...statusTriggerWorkflows, ...rollbackTriggerWorkflows]) {
        const workflowExists = workflowFiles.some(file => 
          fs.readFileSync(path.join(workflowsDir, file), 'utf8').includes(`name: ${workflow}`)
        );
        
        if (!workflowExists) {
          missingWorkflows.push(workflow);
        }
      }

      if (missingWorkflows.length > 0) {
        this.log(`⚠️ Warning: Referenced workflows not found: ${missingWorkflows.join(', ')}`, 'warn');
      }

      this.results.integration.push({
        test: 'Workflow references',
        status: missingWorkflows.length === 0 ? 'pass' : 'warning',
        statusBadgesRefs,
        rollbackManagerRefs,
        missingWorkflows
      });

      return true;
    } catch (error) {
      this.log(`❌ Workflow references verification failed: ${error.message}`, 'error');
      this.results.integration.push({
        test: 'Workflow references',
        status: 'fail',
        error: error.message
      });
      return false;
    }
  }

  extractWorkflowTriggers(content) {
    const workflows = [];
    const workflowMatches = content.match(/workflows:\s*\[(.*?)\]/s);
    
    if (workflowMatches) {
      const workflowList = workflowMatches[1];
      const quotedWorkflows = workflowList.match(/"([^"]+)"/g) || [];
      workflows.push(...quotedWorkflows.map(w => w.replace(/"/g, '')));
    }

    return workflows;
  }

  async checkRepositoryConfiguration() {
    this.log('🔍 Checking repository configuration for workflow requirements...');
    
    try {
      const checks = [];

      // Check if README.md exists
      if (fs.existsSync('README.md')) {
        checks.push({ name: 'README.md exists', status: 'pass' });
        
        // Check for badge section
        const readmeContent = fs.readFileSync('README.md', 'utf8');
        if (readmeContent.includes('<!-- BADGES-START -->')) {
          checks.push({ name: 'Badge section markers in README', status: 'pass' });
        } else {
          checks.push({ name: 'Badge section markers in README', status: 'warning' });
        }
      } else {
        checks.push({ name: 'README.md exists', status: 'fail' });
      }

      // Check for required files for rollback
      const requiredFiles = ['package.json', '.gitignore'];
      for (const file of requiredFiles) {
        if (fs.existsSync(file)) {
          checks.push({ name: `${file} exists`, status: 'pass' });
        } else {
          checks.push({ name: `${file} exists`, status: 'warning' });
        }
      }

      // Check git repository state
      try {
        execSync('git rev-parse --git-dir', { stdio: 'pipe' });
        checks.push({ name: 'Git repository initialized', status: 'pass' });
        
        const hasCommits = execSync('git rev-list --count HEAD', { stdio: 'pipe', encoding: 'utf8' });
        if (parseInt(hasCommits.trim()) > 1) {
          checks.push({ name: 'Multiple commits available for rollback', status: 'pass' });
        } else {
          checks.push({ name: 'Multiple commits available for rollback', status: 'warning' });
        }
      } catch (error) {
        checks.push({ name: 'Git repository initialized', status: 'fail' });
      }

      this.results.integration.push({
        test: 'Repository configuration',
        status: checks.every(c => c.status === 'pass') ? 'pass' : 'warning',
        checks
      });

      return true;
    } catch (error) {
      this.log(`❌ Repository configuration check failed: ${error.message}`, 'error');
      this.results.integration.push({
        test: 'Repository configuration',
        status: 'fail',
        error: error.message
      });
      return false;
    }
  }

  async testWorkflowSyntax() {
    this.log('🔍 Testing workflow YAML syntax...');
    
    try {
      const workflowFiles = [
        '.github/workflows/status-badges.yml',
        '.github/workflows/rollback-manager.yml'
      ];

      const syntaxResults = [];

      for (const file of workflowFiles) {
        try {
          // Basic YAML syntax validation
          const content = fs.readFileSync(file, 'utf8');
          
          // Check for common YAML issues
          const issues = [];
          const lines = content.split('\n');
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Check for tabs
            if (line.includes('\t')) {
              issues.push(`Line ${i + 1}: Contains tabs`);
            }
            
            // Check for trailing spaces
            if (line.endsWith(' ') && line.trim().length > 0) {
              issues.push(`Line ${i + 1}: Trailing spaces`);
            }
          }

          syntaxResults.push({
            file,
            status: issues.length === 0 ? 'pass' : 'warning',
            issues
          });

        } catch (error) {
          syntaxResults.push({
            file,
            status: 'fail',
            error: error.message
          });
        }
      }

      this.results.integration.push({
        test: 'Workflow syntax',
        status: syntaxResults.every(r => r.status === 'pass') ? 'pass' : 'warning',
        results: syntaxResults
      });

      return true;
    } catch (error) {
      this.log(`❌ Workflow syntax testing failed: ${error.message}`, 'error');
      this.results.integration.push({
        test: 'Workflow syntax',
        status: 'fail',
        error: error.message
      });
      return false;
    }
  }

  async createBadgeMarkersInReadme() {
    this.log('🔧 Ensuring README has badge section markers...');
    
    try {
      if (!fs.existsSync('README.md')) {
        this.log('⚠️ No README.md found, skipping badge markers setup', 'warn');
        return false;
      }

      const readmeContent = fs.readFileSync('README.md', 'utf8');
      
      if (readmeContent.includes('<!-- BADGES-START -->')) {
        this.log('✅ Badge markers already exist in README.md', 'success');
        return true;
      }

      // Find a good place to insert badges (after title, before description)
      const lines = readmeContent.split('\n');
      let insertIndex = 0;

      // Look for first # heading and insert after it
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('# ') && insertIndex === 0) {
          insertIndex = i + 1;
          break;
        }
      }

      const badgeSection = [
        '',
        '<!-- BADGES-START -->',
        '[![CI/CD](https://img.shields.io/github/actions/workflow/status/g2goose/claude-flow/ci.yml?branch=main&label=ci%2Fcd&style=flat-square)](https://github.com/g2goose/claude-flow/actions/workflows/ci.yml)',
        '[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)',
        '[![Version](https://img.shields.io/npm/v/claude-flow.svg?style=flat-square)](https://www.npmjs.com/package/claude-flow)',
        '<!-- BADGES-END -->',
        ''
      ];

      lines.splice(insertIndex, 0, ...badgeSection);
      
      // Write the updated README (but don't commit it automatically)
      const updatedContent = lines.join('\n');
      fs.writeFileSync('README.md.with-badges', updatedContent);
      
      this.log('✅ Created README.md.with-badges with badge markers', 'success');
      this.log('ℹ️ You can review and manually apply these changes if desired', 'info');
      
      return true;
    } catch (error) {
      this.log(`❌ Failed to create badge markers: ${error.message}`, 'error');
      return false;
    }
  }

  generateComprehensiveReport() {
    this.log('\n📊 Comprehensive Workflow Verification Report', 'info');
    this.log('=' .repeat(70), 'info');
    
    const duration = Date.now() - this.startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = ((duration % 60000) / 1000).toFixed(1);
    
    this.log(`Verification Duration: ${minutes}m ${seconds}s`, 'info');
    this.log(`Timestamp: ${new Date().toISOString()}`, 'info');
    
    // Summary statistics
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalWarnings = 0;

    const sections = [
      { name: 'Status Badges Workflow', results: this.results.statusBadges },
      { name: 'Rollback Manager Workflow', results: this.results.rollbackManager },
      { name: 'Integration Tests', results: { results: this.results.integration } }
    ];

    for (const section of sections) {
      if (section.results && section.results.results) {
        totalTests += section.results.results.length;
        totalPassed += section.results.results.filter(r => r.status === 'pass').length;
        totalFailed += section.results.results.filter(r => r.status === 'fail').length;
        totalWarnings += section.results.results.filter(r => r.status === 'warning').length;
      }
    }

    this.log('\n📈 Overall Summary:', 'info');
    this.log(`Total Tests: ${totalTests}`, 'info');
    this.log(`Passed: ${totalPassed}`, 'success');
    this.log(`Failed: ${totalFailed}`, totalFailed > 0 ? 'error' : 'info');
    this.log(`Warnings: ${totalWarnings}`, totalWarnings > 0 ? 'warn' : 'info');

    // Section details
    for (const section of sections) {
      this.log(`\n🔍 ${section.name}:`, 'info');
      
      if (section.results) {
        if (section.results.overall) {
          this.log(`  Overall Status: ${section.results.overall}`, 
                   section.results.overall === 'PASS' ? 'success' : 'error');
        }
        
        if (section.results.summary) {
          this.log(`  Tests: ${section.results.summary.passed}/${section.results.summary.total} passed`, 'info');
        }
        
        if (section.results.results) {
          section.results.results.forEach(result => {
            const status = result.status === 'pass' ? '✅' : 
                          result.status === 'fail' ? '❌' : '⚠️';
            this.log(`    ${status} ${result.test}`, result.status === 'pass' ? 'success' : 
                     result.status === 'fail' ? 'error' : 'warn');
          });
        }
      } else {
        this.log('  No results available', 'warn');
      }
    }

    // Recommendations
    this.log('\n💡 Recommendations:', 'info');
    const recommendations = [];

    if (totalFailed > 0) {
      recommendations.push('❗ Fix failing tests before deploying workflows to production');
    }

    if (totalWarnings > 0) {
      recommendations.push('⚠️ Review warnings and consider addressing them');
    }

    if (!fs.existsSync('README.md') || !fs.readFileSync('README.md', 'utf8').includes('<!-- BADGES-START -->')) {
      recommendations.push('📊 Add badge section markers to README.md for status badges workflow');
    }

    recommendations.push('🔐 Configure GitHub environments (rollback-approval, rollback-manual-approval) for rollback workflow');
    recommendations.push('🧪 Test workflows in a development environment before production use');
    recommendations.push('📚 Review workflow documentation and ensure team understanding');

    recommendations.forEach(rec => this.log(`  ${rec}`, 'info'));

    // Create comprehensive report
    const report = {
      timestamp: new Date().toISOString(),
      duration: { minutes, seconds: parseFloat(seconds) },
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        totalWarnings,
        overallStatus: totalFailed === 0 ? 'PASS' : 'FAIL'
      },
      sections: {
        statusBadges: this.results.statusBadges,
        rollbackManager: this.results.rollbackManager,
        integration: this.results.integration
      },
      recommendations
    };

    // Write comprehensive report
    fs.writeFileSync('workflow-verification-comprehensive-report.json', JSON.stringify(report, null, 2));
    
    this.log(`\n📄 Comprehensive report saved to: workflow-verification-comprehensive-report.json`, 'info');
    
    return report;
  }

  async cleanup() {
    this.log('🧹 Cleaning up temporary files...', 'info');
    
    const tempFiles = [
      'status-badges-verification-report.json',
      'rollback-manager-verification-report.json',
      'README.md.with-badges'
    ];
    
    for (const file of tempFiles) {
      try {
        if (fs.existsSync(file)) {
          // Don't actually delete the reports, just move them to a reports directory
          const reportsDir = 'verification-reports';
          if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
          }
          
          if (file.endsWith('.json')) {
            fs.renameSync(file, path.join(reportsDir, file));
            this.log(`Moved report to: ${reportsDir}/${file}`, 'info');
          } else {
            fs.unlinkSync(file);
            this.log(`Cleaned up: ${file}`, 'info');
          }
        }
      } catch (error) {
        this.log(`Failed to clean up ${file}: ${error.message}`, 'warn');
      }
    }
  }

  async run() {
    this.log('🚀 Starting Comprehensive Workflow Verification...', 'info');
    this.log('This will verify both status-badges and rollback-manager workflows\n', 'info');
    
    try {
      // Run individual workflow verifications
      this.log('1️⃣ Running Status Badges Workflow Verification...', 'info');
      const statusVerifier = new StatusBadgesVerifier();
      const statusSuccess = await statusVerifier.run();
      
      // Load the results
      if (fs.existsSync('status-badges-verification-report.json')) {
        this.results.statusBadges = JSON.parse(fs.readFileSync('status-badges-verification-report.json', 'utf8'));
      }

      this.log('\n2️⃣ Running Rollback Manager Workflow Verification...', 'info');
      const rollbackVerifier = new RollbackManagerVerifier();
      const rollbackSuccess = await rollbackVerifier.run();
      
      // Load the results
      if (fs.existsSync('rollback-manager-verification-report.json')) {
        this.results.rollbackManager = JSON.parse(fs.readFileSync('rollback-manager-verification-report.json', 'utf8'));
      }

      // Run integration tests
      this.log('\n3️⃣ Running Integration Verification...', 'info');
      await this.verifyWorkflowReferences();
      await this.checkRepositoryConfiguration();
      await this.testWorkflowSyntax();
      await this.createBadgeMarkersInReadme();
      
      // Generate comprehensive report
      const report = this.generateComprehensiveReport();
      
      // Cleanup
      await this.cleanup();
      
      const overallSuccess = statusSuccess && rollbackSuccess && report.summary.overallStatus === 'PASS';
      
      this.log(`\n🎯 Comprehensive Verification ${overallSuccess ? 'COMPLETED SUCCESSFULLY' : 'COMPLETED WITH ISSUES'}`, 
               overallSuccess ? 'success' : 'warn');
      
      if (!overallSuccess) {
        this.log('⚠️ Some tests failed or have warnings. Review the reports for details.', 'warn');
      }
      
      return overallSuccess;
    } catch (error) {
      this.log(`❌ Comprehensive verification failed: ${error.message}`, 'error');
      await this.cleanup();
      return false;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const verifier = new WorkflowIntegrationVerifier();
  verifier.run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error(`Fatal error: ${error.message}`);
      process.exit(1);
    });
}

module.exports = WorkflowIntegrationVerifier;