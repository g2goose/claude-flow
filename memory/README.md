# Memory Directory

This directory contains the memory management system for Claude Flow's AI orchestration platform. It provides persistent memory storage, agent-specific memory spaces, and session-based memory management for coordinating AI agents across workflows.

## Table of Contents

1. [Memory Architecture](#memory-architecture) (3 components)
2. [Agent Memory](#agent-memory) (1 directory)
3. [Session Memory](#session-memory) (1 directory)
4. [Memory Store](#memory-store) (1 file)
5. [Memory Management](#memory-management)
6. [Quick Reference](#quick-reference)

---

## Memory Architecture

### Hierarchical Memory System
Claude Flow implements a three-tier memory architecture:

1. **Agent Memory**: Individual agent-specific knowledge and state
2. **Session Memory**: Conversation and workflow context persistence
3. **Global Memory**: Shared knowledge and system-wide information

### Memory Persistence
- **SQLite Storage**: Robust database backend for structured memory
- **JSON Files**: Lightweight storage for configuration and metadata
- **Memory Bank**: Cross-session persistence and knowledge retention
- **Namespace Management**: Organized memory spaces with hierarchical access

---

## Agent Memory

### agents/
**Individual agent memory spaces and persistent state**
- Each agent maintains its own isolated memory space
- Agent-specific knowledge, learning, and calibration data
- Task history and performance optimization information
- Specialized capabilities and skill development tracking

**Directory Structure:**
```
memory/agents/
├── agent_001/
│   ├── state.json           # Current agent state
│   ├── knowledge.md         # Agent knowledge base
│   ├── tasks.json          # Task history and performance
│   ├── calibration.json    # Agent-specific optimizations
│   └── memory.db           # Agent's SQLite memory
├── agent_002/
│   └── ...
└── shared/
    ├── common_knowledge.md  # Shared agent knowledge
    ├── coordination.json    # Inter-agent coordination data
    └── global_config.json  # Global agent configurations
```

**Agent Memory Features:**
- **Isolation**: Each agent has private memory space
- **Learning**: Continuous improvement from task execution
- **Specialization**: Agent-specific skill and capability development
- **Coordination**: Shared memory for multi-agent collaboration

**Usage:**
```bash
# View agent memory
claude-flow memory agent-info agent_001

# Update agent knowledge
claude-flow memory agent-store agent_001 "key" "value"

# Agent memory statistics
claude-flow memory agent-stats agent_001
```

---

## Session Memory

### sessions/
**Session-based memory for conversation and workflow context**
- Persistent storage for development sessions and conversations
- Workflow execution context and decision history
- Cross-session knowledge transfer and learning
- Project-specific memory and customization

**Directory Structure:**
```
memory/sessions/
├── 2024-01-10/
│   ├── session_001/
│   │   ├── metadata.json        # Session configuration
│   │   ├── conversation.md      # Full conversation history
│   │   ├── decisions.md         # Key decisions and rationale
│   │   ├── artifacts/           # Generated files and outputs
│   │   ├── coordination_state/  # Agent coordination snapshots
│   │   └── memory.db           # Session-specific SQLite storage
│   └── session_002/
│       └── ...
├── 2024-01-11/
│   └── ...
└── shared/
    ├── patterns.md              # Common session patterns
    ├── templates/               # Session template files
    └── global_session_data.json # Cross-session shared data
```

**Session Memory Features:**
- **Persistence**: Maintain context across sessions
- **History**: Complete conversation and decision tracking
- **Artifacts**: Generated code and documentation storage
- **Patterns**: Learning from successful session patterns

**Usage:**
```bash
# List sessions
claude-flow memory sessions list

# Session details
claude-flow memory session-info session_001

# Restore session context
claude-flow memory session-restore session_001
```

---

## Memory Store

### memory-store.json
**Central memory configuration and metadata**
- Memory system configuration and settings
- Index of all memory namespaces and their purposes
- Memory access patterns and optimization settings
- Cross-memory relationships and dependencies

**Configuration Structure:**
```json
{
  "version": "2.0.0",
  "namespaces": {
    "agents": {
      "type": "agent-specific",
      "isolation": "private",
      "backup": true
    },
    "sessions": {
      "type": "session-based",
      "retention": "30-days",
      "compression": true
    },
    "global": {
      "type": "shared",
      "access": "read-write",
      "replication": true
    }
  },
  "storage": {
    "backend": "sqlite",
    "cache_size": "64MB",
    "journal_mode": "WAL"
  },
  "optimization": {
    "auto_vacuum": true,
    "compress_old_data": true,
    "index_optimization": "weekly"
  }
}
```

**Memory Store Features:**
- **Configuration Management**: Centralized memory system settings
- **Namespace Registry**: Index of all memory spaces and their purposes
- **Optimization Settings**: Performance tuning and resource management
- **Access Control**: Memory access patterns and security settings

---

## Memory Management

### Core Operations
```bash
# Memory system status
claude-flow memory stats

# List all namespaces
claude-flow memory list

# Search across memory
claude-flow memory search "pattern" --namespace all

# Memory cleanup
claude-flow memory cleanup --older-than 30days
```

### Memory APIs
```javascript
// Store memory item
await memory.store('namespace', 'key', 'value', { ttl: 3600 });

// Retrieve memory item
const value = await memory.get('namespace', 'key');

// Query memory
const results = await memory.query('namespace', { filter: 'criteria' });

// Delete memory item
await memory.delete('namespace', 'key');
```

### Memory Optimization
- **Automatic Cleanup**: Configurable retention policies
- **Compression**: Automatic compression of old memory data
- **Indexing**: Optimized indexes for fast memory search
- **Caching**: In-memory caching for frequently accessed data

### Backup and Recovery
```bash
# Backup all memory
claude-flow memory backup --output memory-backup.tar.gz

# Restore memory from backup
claude-flow memory restore memory-backup.tar.gz

# Export specific namespace
claude-flow memory export agents --format json

# Import memory data
claude-flow memory import agents-backup.json --namespace agents
```

---

## Quick Reference

### Memory Commands
```bash
# View memory statistics
claude-flow memory stats

# Store new memory item
claude-flow memory store "namespace" "key" "value"

# Retrieve memory item
claude-flow memory get "namespace" "key"

# Search memory
claude-flow memory search "query" --recent

# List memory namespaces
claude-flow memory list

# Memory system health check
claude-flow memory health
```

### Memory Namespaces
- **agents**: Agent-specific memory and learning data
- **sessions**: Session and conversation context
- **global**: System-wide shared knowledge
- **workflows**: Workflow patterns and templates
- **coordination**: Multi-agent coordination data
- **performance**: Performance metrics and optimization data

### Environment Variables
- `CLAUDE_FLOW_MEMORY_PATH`: Custom memory directory location
- `CLAUDE_FLOW_MEMORY_CACHE_SIZE`: In-memory cache size
- `CLAUDE_FLOW_MEMORY_RETENTION`: Default retention period
- `CLAUDE_FLOW_MEMORY_COMPRESSION`: Enable memory compression

### Best Practices
- **Regular Cleanup**: Implement retention policies for old memory
- **Namespace Organization**: Use clear, hierarchical namespace structure
- **Security**: Encrypt sensitive memory data
- **Performance**: Monitor memory usage and optimize access patterns
- **Backup**: Regular automated backups of critical memory data

### Memory Patterns
- **Agent Learning**: Store successful patterns for agent improvement
- **Session Context**: Maintain conversation context across sessions
- **Workflow Memory**: Remember successful workflow patterns
- **Performance Optimization**: Learn from execution patterns

### Troubleshooting
- **Memory corruption**: Check SQLite integrity and restore from backup
- **Performance issues**: Analyze memory access patterns and optimize indexes
- **Space issues**: Implement cleanup policies and compression
- **Access problems**: Check namespace permissions and configuration

---

*Last Updated: ${new Date().toISOString()}*

This memory directory provides comprehensive memory management capabilities for Claude Flow's AI orchestration platform, enabling persistent learning and context retention across agents and sessions.