import { writeFile } from 'fs/promises';
import { join } from 'path';
// incident-reporter.js - Generate incident reports for rollback operations

export class IncidentReporter {
  constructor(workingDir) {
    this.workingDir = workingDir;
    this.reportsDir = join(workingDir, '.claude-flow-incidents');
  }

  /**
   * Generate and save rollback incident report
   */
  async generateRollbackIncidentReport(rollbackData) {
    const result = {
      success: true,
      reportFile: null,
      sessionId: null,
      errors: [],
    };

    try {
      // Generate session ID
      const sessionId = rollbackData.sessionId || `rollback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      result.sessionId = sessionId;

      // Create reports directory
      await this.ensureReportsDir();

      // Generate incident report content
      const reportContent = this.formatIncidentReport(rollbackData, sessionId);

      // Save report to file
      const reportFile = join(this.reportsDir, `rollback-incident-${sessionId}.md`);
      await writeFile(reportFile, reportContent);
      result.reportFile = reportFile;

      // Also save JSON data for automation
      const jsonFile = join(this.reportsDir, `rollback-incident-${sessionId}.json`);
      await writeFile(jsonFile, JSON.stringify({
        ...rollbackData,
        sessionId,
        timestamp: new Date().toISOString(),
        reportFile
      }, null, 2));

      console.log(`📋 Incident report generated: ${reportFile}`);
      console.log(`💾 Incident data saved: ${jsonFile}`);

    } catch (error) {
      result.success = false;
      result.errors.push(`Failed to generate incident report: ${error.message}`);
    }

    return result;
  }

  /**
   * Format incident report using the GitHub template structure
   */
  formatIncidentReport(data, sessionId) {
    const {
      type = 'Manual Rollback',
      severity = 'Medium',
      reason = 'Rollback requested',
      sourceCommit = 'Unknown',
      targetCommit = 'Unknown',
      backupId,
      scope = 'application',
      phase,
      success = true,
      errors = [],
      warnings = [],
      actions = []
    } = data;

    const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', ' UTC');
    const status = success ? 'Resolved' : 'Investigating';

    // Determine affected components based on scope and phase
    let affectedComponents = ['Claude Flow Core'];
    if (scope === 'full' || phase === 'all') {
      affectedComponents = ['Claude Flow Core', 'CLI Interface', 'Configuration System', 'Rollback System'];
    } else if (phase) {
      affectedComponents.push(`Initialization Phase: ${phase}`);
    }

    // Determine user impact
    const userImpact = severity === 'High' || severity === 'Critical' ? 'All users' : 'Limited impact';
    const duration = success ? 'Immediate recovery' : 'Recovery in progress';

    return `## 🔄 Rollback Incident Details

### Incident Summary
- **Incident Type:** ${type}
- **Severity:** ${severity}
- **Status:** ${status}
- **Detected At:** ${timestamp}

### Rollback Information
- **Rollback Session ID:** ${sessionId}
- **Source Commit:** ${sourceCommit}
- **Target Commit:** ${targetCommit}
- **Rollback Reason:** ${reason}
${backupId ? `- **Backup ID:** ${backupId}` : ''}
${phase ? `- **Phase:** ${phase}` : ''}

### Impact Assessment
- [${severity === 'Critical' || severity === 'High' ? 'x' : ' '}] Production services affected
- [${severity === 'Critical' || severity === 'High' ? 'x' : ' '}] User-facing functionality impacted
- [ ] Data integrity concerns
- [ ] Performance degradation
- [ ] Security implications

**Affected Components:**
${affectedComponents.map(comp => `- ${comp}`).join('\n')}

**Estimated User Impact:**
- **Users Affected:** ${userImpact}
- **Duration:** ${duration}

### Timeline

**Detection:**
- ${timestamp}: Rollback initiated via CLI interface

**Rollback Execution:**
- ${timestamp}: Rollback process started (Session: ${sessionId})
${targetCommit !== 'Unknown' ? `- ${timestamp}: Rolling back to commit ${targetCommit}` : ''}
${backupId ? `- ${timestamp}: Using backup ${backupId}` : ''}
- ${timestamp}: ${success ? 'Rollback completed successfully' : 'Rollback encountered issues'}

**Resolution:**
- ${timestamp}: ${success ? 'System restored to stable state' : 'Resolution in progress'}

### Root Cause Analysis
${reason.includes('initialization') ? 
  'Claude Flow initialization process encountered issues requiring rollback to previous stable state.' :
  'Manual rollback was requested due to: ' + reason
}

**Contributing Factors:**
- ${type === 'Manual Rollback' ? 'Manual intervention required' : 'Automated rollback triggered'}
${errors.length > 0 ? '- Errors encountered: ' + errors.slice(0, 3).join(', ') : ''}
${warnings.length > 0 ? '- Warnings detected: ' + warnings.slice(0, 3).join(', ') : ''}

**Failure Points:**
${phase ? `- Initialization phase: ${phase}` : '- System operation requiring rollback'}
${errors.length > 0 ? '- Error conditions detected during operation' : '- No specific failure points identified'}

### Resolution Actions

- [x] ${type.includes('Automated') ? 'Automated' : 'Manual'} rollback executed ${success ? 'successfully' : 'with issues'}
- [${type === 'Manual Rollback' ? 'x' : ' '}] Manual intervention required
- [${backupId ? 'x' : ' '}] Backup restoration performed
- [x] Configuration restored
- [x] State tracking updated

### Prevention Measures

**Immediate Actions:**
- [x] System rolled back to known stable state
${backupId ? '- [x] Backup verification completed' : ''}
- [x] Incident tracking initiated

**Long-term Improvements:**
- [ ] Review initialization process reliability
- [ ] Enhance rollback system robustness  
- [ ] Improve error handling and recovery

### Lessons Learned

1. ${success ? 'Rollback system operated successfully' : 'Rollback system needs improvement'}
2. ${backupId ? 'Backup system provided reliable recovery point' : 'State tracking enabled rollback process'}
3. ${errors.length === 0 ? 'No critical errors encountered' : 'Error handling needs attention: ' + errors.slice(0, 2).join(', ')}

### Follow-up Actions

- [x] Rollback procedures documented
- [x] System state verified
- [ ] Root cause investigation
- [ ] Process improvements identified
- [ ] Team notification completed

### Stakeholder Communication

- [x] Local system user notified
- [ ] Team notified (if applicable)
- [ ] Management informed (if high severity)
- [ ] Users communicated (if applicable)
- [ ] Post-mortem scheduled (if needed)

---

**Additional Notes:**
This rollback was executed via the Claude Flow CLI rollback system. ${success ? 'The operation completed successfully.' : 'Issues were encountered during the operation.'}

${actions.length > 0 ? `

**Actions Performed:**
${actions.map(action => `- ${action}`).join('\n')}` : ''}

${errors.length > 0 ? `

**Errors Encountered:**
${errors.map(error => `- ${error}`).join('\n')}` : ''}

${warnings.length > 0 ? `

**Warnings:**
${warnings.map(warning => `- ${warning}`).join('\n')}` : ''}

**Related Issues/PRs:**
- CLI rollback operation
- Session: ${sessionId}

**Rollback Artifacts:**
- Session data: Available in ${this.reportsDir}
- State tracking: Updated in Claude Flow state files
- Backup data: ${backupId || 'State-based rollback'}`;
  }

  /**
   * Ensure reports directory exists
   */
  async ensureReportsDir() {
    const { mkdir } = await import('fs/promises');
    
    try {
      await mkdir(this.reportsDir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * List existing incident reports
   */
  async listIncidentReports() {
    const result = {
      success: true,
      reports: [],
      errors: [],
    };

    try {
      const { readdir } = await import('fs/promises');
      
      await this.ensureReportsDir();
      const files = await readdir(this.reportsDir);
      
      result.reports = files
        .filter(file => file.startsWith('rollback-incident-') && file.endsWith('.md'))
        .map(file => ({
          filename: file,
          sessionId: file.replace('rollback-incident-', '').replace('.md', ''),
          path: join(this.reportsDir, file)
        }));

    } catch (error) {
      result.success = false;
      result.errors.push(`Failed to list incident reports: ${error.message}`);
    }

    return result;
  }

  /**
   * Clean up old incident reports
   */
  async cleanupOldReports(keepCount = 10) {
    const result = {
      success: true,
      cleaned: [],
      errors: [],
    };

    try {
      const reports = await this.listIncidentReports();
      if (!reports.success) {
        result.errors.push(...reports.errors);
        result.success = false;
        return result;
      }

      // Sort by creation time (newest first) and remove old ones
      const sortedReports = reports.reports
        .sort((a, b) => b.sessionId.localeCompare(a.sessionId))
        .slice(keepCount);

      const { unlink } = await import('fs/promises');
      
      for (const report of sortedReports) {
        try {
          await unlink(report.path);
          // Also remove corresponding JSON file
          const jsonPath = report.path.replace('.md', '.json');
          await unlink(jsonPath).catch(() => {}); // Ignore if doesn't exist
          result.cleaned.push(report.filename);
        } catch (error) {
          result.errors.push(`Failed to delete ${report.filename}: ${error.message}`);
        }
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Failed to cleanup incident reports: ${error.message}`);
    }

    return result;
  }
}