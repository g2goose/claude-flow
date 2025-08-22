# Claude Integration Directory

This directory contains Claude Code integration files, configurations, and customizations for enhanced development workflows. It provides seamless integration between Claude Flow and Claude Code, enabling advanced AI-assisted development capabilities.

## Table of Contents

1. [Integration Components](#integration-components) (4 components)
2. [Configuration Files](#configuration-files)
3. [Command Extensions](#command-extensions)
4. [Workflow Integration](#workflow-integration)
5. [Quick Reference](#quick-reference)

---

## Integration Components

### Claude Code Integration
**Seamless integration with Anthropic's Claude Code IDE**
- Custom slash commands for Claude Flow operations
- Project-specific configuration and settings
- Enhanced memory and context management
- Automated workflow coordination and execution

### Core Integration Files
- **Settings**: Claude Code workspace configuration
- **Commands**: Custom slash commands for Claude Flow
- **Logs**: Conversation and session logging
- **Cache**: Temporary files and optimization cache

### Integration Features
- **Context Awareness**: Claude Code understands Claude Flow project structure
- **Command Extensions**: Custom commands for swarm coordination and hive-mind operations
- **Memory Integration**: Shared memory between Claude Code sessions and Claude Flow
- **Automated Workflows**: Direct execution of Claude Flow commands from Claude Code

---

## Configuration Files

### Workspace Settings
**Claude Code workspace-specific configuration**
```json
{
  "claude.flow.integration": true,
  "claude.flow.project.type": "ai-orchestration",
  "claude.flow.hive.mind.enabled": true,
  "claude.flow.memory.persistence": true,
  "claude.flow.auto.coordination": true,
  "claude.flow.command.prefix": "/cf",
  "claude.flow.logging.level": "info"
}
```

### Memory Configuration
**Shared memory system between Claude Code and Claude Flow**
```json
{
  "memory": {
    "shared_namespace": "claude-code-integration",
    "sync_interval": "5m",
    "persistence": true,
    "compression": true
  },
  "context": {
    "auto_save": true,
    "max_history": 100,
    "include_artifacts": true
  }
}
```

### Project Configuration
**Claude Flow project-specific settings for Claude Code**
```json
{
  "project": {
    "name": "claude-flow",
    "type": "ai-orchestration",
    "version": "2.0.0-alpha",
    "main_commands": [
      "swarm",
      "hive-mind",
      "memory",
      "workflows"
    ]
  },
  "agents": {
    "auto_spawn": true,
    "default_strategy": "development",
    "specializations": [
      "coder",
      "reviewer",
      "tester",
      "architect"
    ]
  }
}
```

---

## Command Extensions

### Custom Slash Commands
**Claude Flow commands available in Claude Code**

#### `/cf swarm <description>`
Execute swarm coordination directly from Claude Code
```
/cf swarm "build REST API with authentication"
/cf swarm "implement user management system" --strategy development
/cf swarm "optimize database queries" --agents 3
```

#### `/cf hive-mind <action>`
Hive-mind coordination and management
```
/cf hive-mind spawn "create microservices architecture" --agents 8
/cf hive-mind status
/cf hive-mind resume session-12345
```

#### `/cf memory <operation>`
Memory system operations and queries
```
/cf memory store "project-context" "Current working on user auth"
/cf memory query "authentication patterns" --recent
/cf memory stats
```

#### `/cf workflow <command>`
Workflow creation and execution
```
/cf workflow create --name "CI/CD Pipeline" --parallel
/cf workflow execute deploy-to-staging
/cf workflow status
```

### Command Aliases
**Shortened commands for frequent operations**
- `/cfs` → `/cf swarm`
- `/cfh` → `/cf hive-mind`
- `/cfm` → `/cf memory`
- `/cfw` → `/cf workflow`

### Advanced Commands
```
# Project initialization
/cf init --force --sparc

# Performance analysis
/cf analyze performance --components all

# Security scanning
/cf security scan --target ./src

# Documentation generation
/cf docs generate --format markdown
```

---

## Workflow Integration

### Automated Coordination
**Seamless workflow integration between Claude Code and Claude Flow**
- Automatic project context sharing
- Real-time coordination status updates
- Integrated error handling and recovery
- Cross-session persistence and memory

### Development Workflow
1. **Project Setup**: Claude Code automatically detects Claude Flow projects
2. **Context Sharing**: Project context shared with Claude Flow memory system
3. **Command Execution**: Execute Claude Flow commands directly from Claude Code
4. **Result Integration**: Results and artifacts integrated back into Claude Code session

### Session Management
```
# Start integrated session
/cf session start --integrate-claude-code

# Share current context
/cf context share --with-memory

# Resume previous session
/cf session resume --restore-context
```

### Collaboration Features
- **Shared Memory**: Context and learnings shared across sessions
- **Agent Coordination**: Multi-agent coordination visible in Claude Code
- **Progress Tracking**: Real-time progress updates and status
- **Artifact Management**: Generated code and documentation integrated

---

## Quick Reference

### Setup Commands
```bash
# Initialize Claude integration
claude-flow init --claude-code

# Configure workspace
claude-flow configure --workspace

# Test integration
claude-flow test-integration --claude-code
```

### Common Slash Commands
```
# Quick swarm execution
/cf swarm "task description"

# Hive-mind operations
/cf hive-mind spawn "complex task" --agents 5

# Memory operations
/cf memory query "search term" --namespace all

# Workflow management
/cf workflow create --template standard
```

### Integration Status
```
# Check integration status
/cf status

# View active agents
/cf agents list

# Memory statistics
/cf memory stats

# Session information
/cf session info
```

### Configuration Paths
- **Settings**: `.claude/settings.json`
- **Commands**: `.claude/commands/`
- **Logs**: `.claude/logs/`
- **Cache**: `.claude/cache/`
- **Memory**: `.claude/memory/`

### Environment Variables
- `CLAUDE_FLOW_INTEGRATION`: Enable/disable integration
- `CLAUDE_CODE_PROJECT_PATH`: Project root path
- `CLAUDE_FLOW_LOG_LEVEL`: Logging verbosity
- `CLAUDE_FLOW_MEMORY_SYNC`: Memory synchronization interval

### Best Practices
- **Context Management**: Regularly save context for session continuity
- **Memory Usage**: Use descriptive keys for memory storage
- **Command Execution**: Prefer slash commands for frequent operations
- **Session Persistence**: Enable session persistence for long-running projects
- **Error Handling**: Monitor logs for integration issues

### Troubleshooting
- **Command not found**: Check command installation and configuration
- **Memory sync issues**: Verify memory system configuration
- **Permission errors**: Check file permissions and access rights
- **Integration failures**: Review logs and validate setup

### Advanced Features
- **Custom Commands**: Create project-specific slash commands
- **Workflow Automation**: Automate common development workflows
- **Performance Monitoring**: Track integration performance and optimization
- **Security Integration**: Secure command execution and data handling

---

*Last Updated: ${new Date().toISOString()}*

This Claude integration directory provides seamless connectivity between Claude Code and Claude Flow, enabling advanced AI-assisted development workflows and enhanced productivity.