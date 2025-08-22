# Executables Directory

This directory contains the main executable scripts and binaries for the Claude Flow platform. These files provide various entry points and execution modes for different use cases and deployment scenarios.

## Table of Contents

1. [Main Executables](#main-executables) (3 primary)
2. [Development Tools](#development-tools) (2 tools)
3. [Specialized Runners](#specialized-runners) (3 runners)
4. [Background Services](#background-services) (2 services)
5. [Quick Reference](#quick-reference)

---

## Main Executables

### claude-flow.js
**Primary Claude Flow executable and command processor**
- Main entry point for all Claude Flow operations
- Command routing and argument processing
- Environment detection and configuration
- Plugin loading and initialization

**Usage:**
```bash
# Direct execution
node bin/claude-flow.js --help

# Via npm scripts
npm run claude-flow -- swarm "build app"

# Global installation
claude-flow swarm "create API"
```

**Features:**
- Complete CLI command suite
- Auto-detection of project type
- Environment-specific configurations
- Plugin and extension loading

### claude-flow-dev
**Development mode executable with enhanced debugging**
- Development-specific features and debugging
- Hot reload and file watching capabilities
- Enhanced logging and diagnostic output
- Development server integration

**Usage:**
```bash
# Start development mode
./bin/claude-flow-dev --watch

# With debug logging
./bin/claude-flow-dev --debug --verbose

# Development server
./bin/claude-flow-dev serve --port 3000
```

**Features:**
- Hot reload for configuration changes
- Enhanced debugging and logging
- Development server capabilities
- File watching and auto-restart

### claude-flow-pkg.js
**Packaged executable for distribution**
- Self-contained executable package
- No external Node.js dependency required
- Optimized for deployment and distribution
- Platform-specific binary generation

**Usage:**
```bash
# Run packaged version
./bin/claude-flow-pkg.js init --force

# Platform-specific execution
./claude-flow-pkg-linux swarm "deploy app"
./claude-flow-pkg-windows.exe hive-mind spawn
```

**Features:**
- Self-contained execution
- Cross-platform compatibility
- Optimized performance
- Simplified deployment

---

## Development Tools

### claude-flow-node-pkg
**Node.js packaging utility for creating distributables**
- Creates platform-specific executables
- Optimizes bundle size and performance
- Manages dependencies and assets
- Automated packaging workflows

**Usage:**
```bash
# Create platform packages
./bin/claude-flow-node-pkg --platform linux

# Create all platforms
./bin/claude-flow-node-pkg --all

# Custom configuration
./bin/claude-flow-node-pkg --config package.json
```

**Supported Platforms:**
- Linux (x64, ARM64)
- Windows (x64, x86)
- macOS (x64, ARM64)
- Docker containers

---

## Specialized Runners

### claude-flow-swarm
**Dedicated swarm coordination executable**
- Optimized for swarm-only operations
- Lightweight footprint for swarm tasks
- Specialized argument handling
- Direct swarm coordination interface

**Usage:**
```bash
# Quick swarm execution
./bin/claude-flow-swarm "build REST API"

# With specific strategy
./bin/claude-flow-swarm "analyze code" --strategy research

# Background execution
./bin/claude-flow-swarm "deploy app" --background
```

**Features:**
- Swarm-specific optimizations
- Reduced startup time
- Simplified command interface
- Background execution support

### claude-flow-swarm-ui
**Swarm coordination with web UI interface**
- Web-based swarm monitoring and control
- Real-time coordination visualization
- Interactive agent management
- Progress tracking and reporting

**Usage:**
```bash
# Start swarm UI server
./bin/claude-flow-swarm-ui --port 8080

# With authentication
./bin/claude-flow-swarm-ui --auth --users users.json

# Development mode
./bin/claude-flow-swarm-ui --dev --hot-reload
```

**Features:**
- Real-time swarm visualization
- Interactive agent control
- Progress monitoring
- Multi-user support

---

## Background Services

### claude-flow-swarm-background
**Background swarm coordination service**
- Long-running swarm coordination
- System service integration
- Automated task scheduling
- Resource management and optimization

**Usage:**
```bash
# Start background service
./bin/claude-flow-swarm-background start

# Service management
./bin/claude-flow-swarm-background stop
./bin/claude-flow-swarm-background restart
./bin/claude-flow-swarm-background status
```

**Features:**
- Daemon process management
- Automatic restart and recovery
- Resource monitoring
- Log rotation and management

### claude-flow-swarm-bg
**Simplified background swarm launcher**
- Quick background task execution
- Simplified command interface
- Automatic process management
- Output redirection and logging

**Usage:**
```bash
# Run task in background
./bin/claude-flow-swarm-bg "continuous integration"

# With logging
./bin/claude-flow-swarm-bg "monitor system" --log /var/log/claude-flow.log

# Check status
./bin/claude-flow-swarm-bg --status
```

**Features:**
- One-command background execution
- Automatic logging setup
- Process status monitoring
- Simple process management

### claude-flow-swarm-monitor
**Swarm performance monitoring and diagnostics**
- Real-time performance monitoring
- Resource usage tracking
- Health check implementations
- Alert generation and notification

**Usage:**
```bash
# Start monitoring
./bin/claude-flow-swarm-monitor --config monitor.json

# With alerts
./bin/claude-flow-swarm-monitor --alerts --webhook https://alerts.example.com

# Dashboard mode
./bin/claude-flow-swarm-monitor --dashboard --port 9090
```

**Features:**
- Real-time metrics collection
- Configurable alerting
- Web dashboard interface
- Integration with monitoring systems

---

## Quick Reference

### Execution Modes
```bash
# Interactive CLI
./bin/claude-flow.js

# Development mode
./bin/claude-flow-dev --watch

# Swarm-only mode
./bin/claude-flow-swarm "task description"

# Background service
./bin/claude-flow-swarm-background start

# UI interface
./bin/claude-flow-swarm-ui --port 8080

# Monitoring
./bin/claude-flow-swarm-monitor --dashboard
```

### Common Patterns
```bash
# Quick swarm task
./bin/claude-flow-swarm "build feature" --claude

# Development workflow
./bin/claude-flow-dev --watch --debug

# Production deployment
./bin/claude-flow-pkg.js deploy --production

# Background processing
./bin/claude-flow-swarm-bg "continuous task" --log output.log
```

### File Permissions
```bash
# Make executables runnable
chmod +x bin/*

# Set specific permissions
chmod 755 bin/claude-flow*
chmod 644 bin/claude-flow.js
```

### Environment Variables
- `CLAUDE_FLOW_DEBUG`: Enable debug mode
- `CLAUDE_FLOW_CONFIG`: Configuration file path
- `CLAUDE_FLOW_LOG_LEVEL`: Logging verbosity
- `CLAUDE_FLOW_WORKERS`: Number of worker processes

### Troubleshooting
- **Permission denied**: Check file permissions with `chmod +x`
- **Module not found**: Ensure dependencies are installed with `npm install`
- **Port in use**: Use different port with `--port` option
- **Memory issues**: Adjust `--max-memory` parameter

---

*Last Updated: ${new Date().toISOString()}*

This executables directory provides flexible entry points for Claude Flow operations, supporting development, production, and specialized use cases.