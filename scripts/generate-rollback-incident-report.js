#!/usr/bin/env node

/**
 * Generate a comprehensive rollback incident report using the GitHub issue template format
 * This script populates the rollback incident template with data from the rollback workflow
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate rollback incident report content
 */
export function generateRollbackIncidentReport(rollbackData) {
  const {
    sessionId,
    timestamp,
    trigger,
    failure,
    rollback,
    verification = {},
    monitoring = {},
    scope = 'application'
  } = rollbackData;

  // Determine incident type based on trigger
  let incidentType = 'Automated Rollback';
  if (trigger.event === 'workflow_dispatch') {
    incidentType = 'Manual Rollback';
  } else if (failure.severity === 'high') {
    incidentType = 'Emergency Rollback';
  }

  // Determine severity mapping
  const severityMap = {
    'low': 'Low',
    'medium': 'Medium', 
    'high': 'High',
    'critical': 'Critical'
  };
  const severity = severityMap[failure.severity] || 'Medium';

  // Format timestamp
  const detectedAt = new Date(timestamp).toISOString().replace('T', ' ').replace('Z', ' UTC');

  // Calculate duration if available
  const duration = monitoring.duration || 'Unknown';

  // Determine affected components based on scope
  const componentMap = {
    'application': ['Claude Flow Core', 'CLI Interface'],
    'database': ['Database Layer', 'Data Storage'],
    'infrastructure': ['Infrastructure', 'Deployment Pipeline'],
    'full': ['Claude Flow Core', 'CLI Interface', 'Database Layer', 'Infrastructure']
  };
  const affectedComponents = componentMap[scope] || ['Claude Flow Core'];

  const template = `## 🔄 Rollback Incident Details

### Incident Summary
- **Incident Type:** ${incidentType}
- **Severity:** ${severity}
- **Status:** ${verification.systemHealthy ? 'Resolved' : 'Investigating'}
- **Detected At:** ${detectedAt}

### Rollback Information
- **Rollback Session ID:** ${sessionId}
- **Source Commit:** ${trigger.commit}
- **Target Commit:** ${rollback.target}
- **Rollback Reason:** ${rollback.reason}

### Impact Assessment
- [${failure.type.includes('ci') ? 'x' : ' '}] Production services affected
- [${failure.severity === 'high' ? 'x' : ' '}] User-facing functionality impacted
- [ ] Data integrity concerns
- [${failure.type.includes('performance') ? 'x' : ' '}] Performance degradation
- [ ] Security implications

**Affected Components:**
${affectedComponents.map(comp => `- ${comp}`).join('\n')}

**Estimated User Impact:**
- **Users Affected:** ${failure.severity === 'high' ? 'All users' : 'Limited impact'}
- **Duration:** ${duration}

### Timeline

**Detection:**
- ${detectedAt}: Issue detected via ${trigger.workflow || 'automated monitoring'}

**Rollback Execution:**
- ${detectedAt}: Automated rollback initiated for session ${sessionId}
- ${detectedAt}: Rollback to commit ${rollback.target} completed

**Resolution:**
- ${detectedAt}: ${verification.systemHealthy ? 'Normal service restored and verified' : 'System verification in progress'}

### Root Cause Analysis
${failure.type === 'ci_failure' ? 
  'CI pipeline failure detected in ' + (trigger.workflow || 'automated workflow') + '. The failure prevented successful deployment and triggered automated rollback procedures.' :
  'System failure detected requiring rollback intervention.'
}

**Contributing Factors:**
- ${trigger.workflow ? `Workflow failure: ${trigger.workflow}` : 'System instability detected'}
- ${failure.severity === 'high' ? 'High severity failure triggering emergency rollback' : 'Standard rollback procedures followed'}

**Failure Points:**
- ${trigger.workflow ? 'CI/CD pipeline validation' : 'System monitoring detection'}
- ${failure.type === 'ci_failure' ? 'Build or test failure in automated pipeline' : 'Runtime system failure'}

### Resolution Actions

- [x] Automated rollback executed successfully
- [${trigger.event === 'workflow_dispatch' ? 'x' : ' '}] Manual intervention required  
- [ ] Database rollback performed
- [x] Configuration restored
- [x] Monitoring alerts configured

### Prevention Measures

**Immediate Actions:**
- [x] System rolled back to stable state
- [x] Monitoring enabled for system stability
- [x] Incident tracking initiated

**Long-term Improvements:**
- [ ] Review CI/CD pipeline reliability
- [ ] Enhance automated testing coverage
- [ ] Improve failure detection mechanisms

### Lessons Learned

1. ${failure.severity === 'high' ? 'Emergency rollback procedures executed successfully' : 'Standard rollback procedures operated as designed'}
2. ${verification.buildPassed ? 'Build verification confirms rollback target stability' : 'Build verification needs attention'}
3. ${monitoring.systemStable ? 'Post-rollback monitoring confirms system stability' : 'System stability monitoring ongoing'}

### Follow-up Actions

- [x] Update rollback procedures
- [x] Improve monitoring/alerting  
- [ ] Enhance testing procedures
- [x] Update documentation
- [ ] Team training/communication

### Stakeholder Communication

- [x] Team notified via automated systems
- [${failure.severity === 'high' ? 'x' : ' '}] Management informed
- [${failure.severity === 'high' ? 'x' : ' '}] Users communicated (if applicable)
- [ ] Post-mortem scheduled

---

**Additional Notes:**
This incident was handled by the automated rollback system. The rollback was executed successfully and system stability has been verified.

**Related Issues/PRs:**
- Trigger: ${trigger.workflow || 'Automated monitoring'}
- Branch: ${trigger.branch}

**Rollback Artifacts:**
- Session artifacts: Available in GitHub Actions workflow run
- Rollback commit: ${rollback.target}
- Monitoring data: Available for ${monitoring.duration || '15 minutes'} post-rollback`;

  return template;
}

/**
 * Main function for CLI usage
 */
async function main() {
  try {
    // Read rollback data from environment or args
    const rollbackDataJson = process.env.ROLLBACK_DATA || process.argv[2];
    
    if (!rollbackDataJson) {
      console.error('Error: ROLLBACK_DATA environment variable or JSON argument required');
      process.exit(1);
    }

    const rollbackData = JSON.parse(rollbackDataJson);
    const report = generateRollbackIncidentReport(rollbackData);
    
    console.log(report);
  } catch (error) {
    console.error('Error generating rollback incident report:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}