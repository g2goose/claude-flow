# 🔄 Rollback Incident Management System

The claude-flow repository includes a comprehensive rollback incident management system that automatically tracks, reports, and documents rollback events for both automated and manual scenarios.

## 🎯 Overview

The rollback incident system consists of:

1. **GitHub Issue Template** - Structured template for rollback incident reports
2. **Automated GitHub Workflow** - Creates incidents automatically when CI/CD rollbacks occur
3. **Local CLI System** - Generates incident reports for manual rollbacks
4. **Incident Reporter** - Manages report creation, listing, and tracking

## 📋 Components

### 1. GitHub Issue Template

**Location**: `.github/ISSUE_TEMPLATE/rollback-incident.md`

Provides a comprehensive template for manual rollback incident reporting with sections for:
- Incident summary and severity
- Rollback information and timeline  
- Impact assessment and affected components
- Root cause analysis and contributing factors
- Resolution actions and prevention measures
- Lessons learned and follow-up actions

### 2. Automated Rollback Manager

**Location**: `.github/workflows/rollback-manager.yml`

Automatically detects CI/CD failures and executes rollbacks, creating detailed incident reports using the template structure. Features:
- Automatic failure detection and severity assessment
- Pre-rollback validation and backup creation
- Rollback execution with metadata tracking
- Post-rollback verification and monitoring
- Comprehensive incident report generation

### 3. Local Rollback System

**Location**: `src/cli/simple-commands/init/rollback/`

CLI-based rollback system with integrated incident reporting:
- `index.js` - Main rollback orchestrator with incident integration
- `incident-reporter.js` - Incident report generation and management
- `backup-manager.js` - Backup creation and restoration
- `state-tracker.js` - Rollback point and checkpoint tracking
- `recovery-manager.js` - Automated recovery procedures

## 🚀 Usage

### Automated Incident Creation

When CI/CD workflows fail, the rollback manager automatically:

1. **Detects failure** and assesses severity
2. **Validates rollback target** and creates backups
3. **Executes rollback** to stable state
4. **Creates GitHub issue** with comprehensive incident report
5. **Monitors system** stability post-rollback

Example generated issue title:
```
🔄 Rollback Incident: Automated Recovery from 2025-08-22
```

### Manual Incident Reporting

For manual rollbacks, use the CLI system:

```javascript
import { RollbackSystem } from './src/cli/simple-commands/init/rollback/index.js';

const rollbackSystem = new RollbackSystem('/path/to/project');

// Create incident report
await rollbackSystem.createRollbackIncidentReport({
  type: 'Manual Rollback',
  severity: 'Medium',
  status: 'In Progress',
  sessionId: 'rollback-session-123',
  sourceCommit: 'abc123',
  targetCommit: 'def456',
  reason: 'Configuration issue detected',
  userImpact: 'Minimal - Development environment',
  duration: 'Unknown',
  components: ['Configuration', 'Database'],
  automated: false,
  notes: 'Manual rollback due to configuration corruption'
});

// List incident reports
await rollbackSystem.listIncidentReports();
```

### GitHub Issue Creation

For manual GitHub issue creation:

1. Go to repository **Issues** tab
2. Click **New Issue**
3. Select **🔄 Rollback Incident Report** template
4. Fill in all sections with incident details
5. Add appropriate labels: `rollback`, `incident`, `high-priority`

## 📊 Incident Report Structure

Both automated and manual incident reports follow the same comprehensive structure:

```markdown
## 🔄 Rollback Incident Details

### Incident Summary
- **Incident Type**: Manual/Automated Rollback
- **Severity**: Critical/High/Medium/Low
- **Status**: Active/Investigating/Resolved
- **Detected At**: YYYY-MM-DD HH:MM UTC

### Rollback Information
- **Rollback Session ID**: Unique identifier
- **Source Commit**: Problematic commit SHA
- **Target Commit**: Rollback target SHA
- **Rollback Reason**: Brief description

### Impact Assessment
- Production services affected
- User-facing functionality impacted
- Data integrity concerns
- Performance degradation
- Security implications

### Timeline
- Detection timeframe
- Rollback execution window
- Resolution completion

### Root Cause Analysis
- Contributing factors
- Failure points
- System weaknesses

### Resolution Actions
- Automated/manual interventions
- Configuration changes
- Database operations

### Prevention Measures
- Immediate actions taken
- Long-term improvements planned

### Follow-up Actions
- Procedure updates needed
- Monitoring enhancements
- Documentation updates
```

## 🔧 Configuration

### Workflow Triggers

The rollback manager triggers on:
- **Workflow failures**: Verification Pipeline, Truth Scoring, Integration Tests
- **Push events**: Main branch monitoring
- **Manual dispatch**: Emergency rollback requests

### Severity Levels

- **High**: Verification Pipeline, Integration Tests failures
- **Medium**: Truth Scoring, other workflow failures  
- **Low**: Minor issues, manual rollbacks

### Automated Actions

- **High Severity**: Automatic rollback execution
- **Emergency Mode**: Skip confirmations, force push
- **Medium/Low**: Manual approval required

## 📈 Monitoring and Tracking

### Rollback Session Tracking

Each rollback gets a unique session ID format:
```
rollback-YYYYMMDD-HHMMSS-{commit-sha}
```

### Artifact Retention

- Failure detection reports: 90 days
- Pre-rollback validation: 90 days  
- Rollback execution logs: 90 days
- Post-rollback monitoring: 90 days
- Incident reports: Permanent (GitHub issues)

### Report Storage

Local incident reports are stored in:
```
{project}/.claude-flow-incidents/
├── incident-{timestamp}.md    # Report content
├── incident-{timestamp}.json  # Metadata
└── ...
```

## 🛠️ Integration

### CI/CD Integration

The system integrates with:
- GitHub Actions workflows
- Verification pipelines
- Truth scoring systems
- Integration test suites

### Development Workflow

1. **Development** → Code changes
2. **CI/CD** → Automated testing
3. **Failure Detection** → Rollback manager activation
4. **Rollback Execution** → Automatic recovery
5. **Incident Reporting** → GitHub issue creation
6. **Investigation** → Manual analysis and fixes

## 🎯 Best Practices

### For Automated Rollbacks

- Monitor rollback notifications immediately
- Investigate root causes promptly
- Update prevention measures
- Review rollback effectiveness

### For Manual Rollbacks

- Always create incident reports
- Document timeline accurately
- Include comprehensive impact assessment
- Plan follow-up actions

### For Incident Response

- Assign severity levels appropriately
- Update status as investigation progresses  
- Document lessons learned
- Implement prevention measures

## 🔍 Troubleshooting

### Common Issues

1. **Rollback target not found**
   - Verify commit SHA exists
   - Check if target is ancestor of HEAD
   - Use valid git references

2. **Permission denied during rollback**
   - Check repository permissions
   - Verify GitHub token access
   - Ensure force push permissions if needed

3. **Incident report creation fails**
   - Check file system permissions
   - Verify incident directory creation
   - Review error logs

### Debug Commands

```bash
# Validate rollback system
node -e "
import('./src/cli/simple-commands/init/rollback/index.js')
  .then(m => new m.RollbackSystem('.').validateRollbackSystem())
  .then(console.log)
"

# List incident reports
node -e "
import('./src/cli/simple-commands/init/rollback/index.js')
  .then(m => new m.RollbackSystem('.').listIncidentReports())
  .then(console.log)
"
```

## 📚 References

- [Rollback Incident Issue Template](.github/ISSUE_TEMPLATE/rollback-incident.md)
- [Rollback Manager Workflow](.github/workflows/rollback-manager.yml)
- [CI/CD Documentation](docs/ci-cd/README.md)
- [Rollback Plan Archive](archive/reports/ROLLBACK_PLAN.md)

---

*For additional support or questions about the rollback incident system, please create an issue using the rollback incident template.*