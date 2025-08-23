# Rollback Incident Reporting System

The Claude Flow rollback system includes comprehensive incident reporting capabilities that automatically generate detailed incident reports following the GitHub issue template format whenever rollbacks are performed.

## Features

### Automated Incident Reports
- **Workflow Integration**: Automatic incident report generation when GitHub Actions rollbacks occur
- **CLI Integration**: Incident reports created for manual rollbacks via Claude Flow CLI  
- **Template Compliance**: All reports follow the structured rollback incident template format
- **Multiple Formats**: Reports generated in both Markdown and JSON formats

### Incident Report Content
Each incident report includes:
- **Incident Summary**: Type, severity, status, detection time
- **Rollback Information**: Session ID, commit details, reason
- **Impact Assessment**: Affected services and user impact
- **Timeline**: Detection, execution, and resolution timeline
- **Root Cause Analysis**: Contributing factors and failure points
- **Resolution Actions**: Steps taken during rollback
- **Prevention Measures**: Immediate and long-term improvements
- **Lessons Learned**: Key takeaways from the incident
- **Follow-up Actions**: Required post-incident actions
- **Stakeholder Communication**: Notification checklist

## Usage

### Automatic Reports (GitHub Actions)
When the rollback workflow executes, incident reports are automatically created and GitHub issues are opened with the comprehensive incident details.

### Manual Report Generation

#### Interactive CLI Tool
```bash
npm run rollback:incident-report
```

This launches an interactive tool that guides you through creating a comprehensive incident report.

#### Programmatic Generation
```bash
# Generate report from JSON data
npm run rollback:generate-report '{"sessionId":"test-123","timestamp":"2024-01-01T00:00:00Z",...}'
```

#### CLI Rollback Integration
When performing rollbacks via the Claude Flow CLI, incident reports are automatically generated:

```javascript
import { RollbackSystem } from './src/cli/simple-commands/init/rollback/index.js';

const rollback = new RollbackSystem(process.cwd());
// Rollback operations automatically generate incident reports
await rollback.performFullRollback();
```

### Testing
```bash
npm run rollback:test-incident
```

## File Locations

### Generated Reports
- **Markdown Reports**: `.claude-flow-incidents/rollback-incident-[session-id].md`
- **JSON Data**: `.claude-flow-incidents/rollback-incident-[session-id].json`

### Scripts
- **Interactive Creator**: `scripts/create-rollback-incident-report.js`
- **Report Generator**: `scripts/generate-rollback-incident-report.js`
- **Test Suite**: `scripts/test-incident-reporting.js`

### Source Code
- **Incident Reporter**: `src/cli/simple-commands/init/rollback/incident-reporter.js`
- **Rollback Integration**: `src/cli/simple-commands/init/rollback/index.js`
- **GitHub Workflow**: `.github/workflows/rollback-manager.yml`

## Configuration

### Workflow Integration
The rollback manager workflow automatically:
1. Detects failure conditions
2. Executes rollbacks when needed
3. Generates comprehensive incident reports
4. Creates GitHub issues with incident details
5. Monitors system stability post-rollback

### Report Retention
- **Default Retention**: 10 most recent incident reports
- **Cleanup**: Automatic cleanup of old reports
- **Manual Cleanup**: `rollbackSystem.cleanupIncidentReports(keepCount)`

## Integration with GitHub

### Issue Template
The system uses the rollback incident template at `.github/ISSUE_TEMPLATE/rollback-incident.md` for consistent issue formatting.

### Automatic Issue Creation
When rollbacks occur via GitHub Actions:
1. Comprehensive incident data is collected
2. Incident report is generated using the template format
3. GitHub issue is automatically created with full incident details
4. Issue is labeled with `rollback`, `incident`, `high-priority`, `automated`

### Manual Issue Creation
For manual rollbacks, the generated reports can be:
1. Copied to GitHub issues manually
2. Created automatically using `gh` CLI (if available)
3. Used as documentation for post-mortem processes

## Example Report Structure

```markdown
## 🔄 Rollback Incident Details

### Incident Summary
- **Incident Type:** Automated Rollback
- **Severity:** High
- **Status:** Resolved
- **Detected At:** 2024-01-01 12:00:00 UTC

### Rollback Information
- **Rollback Session ID:** rollback-20240101-120000-abc123
- **Source Commit:** abc123def456
- **Target Commit:** def456abc123
- **Rollback Reason:** CI pipeline failure detected

[Additional sections follow template format...]
```

## Benefits

1. **Comprehensive Documentation**: Every rollback is fully documented
2. **Consistent Format**: All reports follow the same structured template
3. **Automatic Generation**: No manual effort required for routine rollbacks
4. **Integration**: Seamless workflow and CLI integration
5. **Traceability**: Full audit trail of rollback operations
6. **Process Improvement**: Structured data for analyzing rollback patterns

## Best Practices

1. **Review Reports**: Always review generated incident reports for accuracy
2. **Follow-up Actions**: Complete all items in the follow-up actions checklist
3. **Root Cause Analysis**: Investigate and document the underlying cause
4. **Process Improvement**: Use incident data to improve systems and processes
5. **Team Communication**: Ensure all stakeholders are notified appropriately