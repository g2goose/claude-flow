# 🌊 Claude-Flow v2.0.0 Alpha: AI Orchestration Platform

<!-- BADGES-START -->
[![Verification Pipeline](https://img.shields.io/github/actions/workflow/status/g2goose/claude-flow/verification-pipeline.yml?branch=main&label=verification&style=flat-square)](https://github.com/g2goose/claude-flow/actions/workflows/verification-pipeline.yml)
[![Truth Scoring](https://img.shields.io/github/actions/workflow/status/g2goose/claude-flow/truth-scoring.yml?branch=main&label=truth%20score&style=flat-square)](https://github.com/g2goose/claude-flow/actions/workflows/truth-scoring.yml)
[![Integration Tests](https://img.shields.io/github/actions/workflow/status/g2goose/claude-flow/integration-tests.yml?branch=main&label=integration&style=flat-square)](https://github.com/g2goose/claude-flow/actions/workflows/integration-tests.yml)
[![Rollback Manager](https://img.shields.io/github/actions/workflow/status/g2goose/claude-flow/rollback-manager.yml?branch=main&label=rollback&style=flat-square)](https://github.com/g2goose/claude-flow/actions/workflows/rollback-manager.yml)
[![CI/CD](https://img.shields.io/github/actions/workflow/status/g2goose/claude-flow/ci.yml?branch=main&label=ci%2Fcd&style=flat-square)](https://github.com/g2goose/claude-flow/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/npm/v/claude-flow.svg?style=flat-square)](https://www.npmjs.com/package/claude-flow)
<!-- BADGES-END -->

<div align="center">

[![🌟 Star on GitHub](https://img.shields.io/github/stars/ruvnet/claude-flow?style=for-the-badge&logo=github&color=gold)](https://github.com/ruvnet/claude-flow)
[![📦 Alpha Release](https://img.shields.io/npm/v/claude-flow/alpha?style=for-the-badge&logo=npm&color=orange&label=v2.0.0-alpha.90)](https://www.npmjs.com/package/claude-flow/v/alpha)
[![⚡ Claude Code](https://img.shields.io/badge/Claude%20Code-Optimized-green?style=for-the-badge&logo=anthropic)](https://github.com/ruvnet/claude-flow)
[![🏛️ Agentics Foundation](https://img.shields.io/badge/Agentics-Foundation-crimson?style=for-the-badge&logo=openai)](https://discord.com/invite/dfxmpwkG2D)
[![🐝 Hive-Mind](https://img.shields.io/badge/Hive--Mind-AI%20Coordination-purple?style=for-the-badge&logo=swarm)](https://github.com/ruvnet/claude-flow)
[![🧠 Neural](https://img.shields.io/badge/Neural-87%20MCP%20Tools-blue?style=for-the-badge&logo=pytorch)](https://github.com/ruvnet/claude-flow)
[![🛡️ MIT License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge&logo=opensourceinitiative)](https://opensource.org/licenses/MIT)

</div>

---

## 🌟 **Overview**

**Claude-Flow v2 Alpha** is an AI orchestration platform for automated software development. It provides swarm intelligence, neural pattern recognition, and 87 MCP tools for development workflows.

### 🎯 **Key Features**

- **🐝 Hive-Mind Intelligence**: Queen-led AI coordination with specialized worker agents
- **🧠 Neural Networks**: 27+ cognitive models with WASM SIMD acceleration
- **🔧 87 MCP Tools**: Complete toolkit for swarm orchestration, memory, and automation
- **🔄 Dynamic Agent Architecture (DAA)**: Self-organizing agents with fault tolerance
- **💾 SQLite Memory System**: Persistent `.swarm/memory.db` with 12 specialized tables
- **🪝 Hooks System**: Automated workflows with pre/post operation hooks
- **📊 GitHub Integration**: 6 specialized modes for repository management

> 🔥 **AI Coordination**: Build faster and more efficiently with AI-powered development orchestration

## ⚡ **Try v2.0.0 Alpha in 4 Commands**

### 📋 **Prerequisites**

- **Node.js 18+** (LTS recommended)
- **npm 9+** or equivalent package manager
- **Windows users**: See [Windows Installation Guide](docs/windows-installation.md) for special instructions

⚠️ **IMPORTANT**: Claude Code must be installed first:

```bash
# 1. Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# 2. (Optional) Skip permissions check for faster setup
# Only use if you understand the security implications
claude --dangerously-skip-permissions
```

💡 **Windows Note**: If you encounter SQLite errors, Claude Flow will automatically use in-memory storage. For persistent storage options, see our [Windows guide](docs/windows-installation.md).

### 🎯 **Instant Alpha Testing**

```bash
# 1. Initialize Claude Flow with MCP setup (auto-configures permissions!)
npx claude-flow@alpha init --force

# 2. Explore all capabilities  
npx claude-flow@alpha --help

# 3a. Quick AI coordination (recommended for most tasks)
npx claude-flow@alpha swarm "build me a REST API" --claude

# 3b. OR launch the full hive-mind system (for complex projects)
npx claude-flow@alpha hive-mind wizard
npx claude-flow@alpha hive-mind spawn "build enterprise system" --claude
```

### 🤔 **Swarm vs Hive-Mind: Which to Use?**

| Feature | `swarm` Command | `hive-mind` Command |
|---------|----------------|-------------------|
| **Best For** | Quick tasks, single objectives | Complex projects, persistent sessions |
| **Setup** | Instant - no configuration needed | Interactive wizard setup |
| **Session** | Temporary coordination | Persistent with resume capability |
| **Memory** | Task-scoped | Project-wide with SQLite storage |
| **Agents** | Auto-spawned for task | Manual control with specializations |
| **Use When** | "Build X", "Fix Y", "Analyze Z" | Multi-feature projects, team coordination |

**Quick Rule:** Start with `swarm` for most tasks. Use `hive-mind` when you need persistent sessions or complex multi-agent coordination.

## 🎯 **Typical Workflows - Your "Happy Path" Guide**

### **New to Claude-Flow? Start Here!**

Confused about `.hive-mind` and `.swarm` directories? Not sure when to create new hives? Here are the most common workflow patterns:

#### **🚀 Pattern 1: Single Feature Development**
```bash
# Initialize once per feature/task
npx claude-flow@alpha init --force
npx claude-flow@alpha hive-mind spawn "Implement user authentication" --claude

# Continue working on SAME feature (reuse existing hive)
npx claude-flow@alpha hive-mind status
npx claude-flow@alpha memory query "authentication" --recent
npx claude-flow@alpha swarm "Add password reset functionality" --continue-session
```

#### **🏗️ Pattern 2: Multi-Feature Project**
```bash
# Project-level initialization (once per project)
npx claude-flow@alpha init --force --project-name "my-app"

# Feature 1: Authentication (new hive)
npx claude-flow@alpha hive-mind spawn "auth-system" --namespace auth --claude

# Feature 2: User management (separate hive)  
npx claude-flow@alpha hive-mind spawn "user-management" --namespace users --claude

# Resume Feature 1 later (use session ID from spawn output)
npx claude-flow@alpha hive-mind resume session-xxxxx-xxxxx
```

#### **🔍 Pattern 3: Research & Analysis**
```bash
# Start research session
npx claude-flow@alpha hive-mind spawn "Research microservices patterns" --agents researcher,analyst --claude

# Continue research in SAME session
npx claude-flow@alpha memory stats  # See what's been learned
npx claude-flow@alpha swarm "Deep dive into API gateway patterns" --continue-session
```

### **🤔 When Should I Create a New Hive?**

| Situation | Action | Command |
|-----------|--------|---------|
| **Same objective/feature** | Continue existing hive | `npx claude-flow@alpha hive-mind resume <session-id>` |
| **New feature in same project** | Create new hive with namespace | `npx claude-flow@alpha hive-mind spawn "new-feature" --namespace feature-name` |
| **Completely different project** | New directory + init | `mkdir new-project && cd new-project && npx claude-flow@alpha init` |
| **Experimenting/testing** | Temporary hive | `npx claude-flow@alpha hive-mind spawn "experiment" --temp` |

### **📁 Understanding "Empty" Directories**

**Don't panic if directories seem empty!** Claude-Flow uses SQLite databases that may not show files in directory listings:

```bash
# Check what's actually stored (even if directories look empty)
npx claude-flow@alpha memory stats        # See memory data
npx claude-flow@alpha memory list         # List all namespaces  
npx claude-flow@alpha hive-mind status    # See active hives

# Your project structure after initialization:
# .hive-mind/     <- Contains config.json + SQLite session data
# .swarm/         <- Contains memory.db (SQLite database)
# memory/         <- Agent-specific memories (created when agents spawn)
# coordination/   <- Active workflow files (created during tasks)
```

### **🔄 Continuing Previous Work**

```bash
# See what you were working on
npx claude-flow@alpha hive-mind status
npx claude-flow@alpha memory query --recent --limit 5

# List all sessions to find the one you want
npx claude-flow@alpha hive-mind sessions

# Resume specific session by ID
npx claude-flow@alpha hive-mind resume session-xxxxx-xxxxx
```

---

## 🪝 **Hooks System**

### **Automated Workflow Enhancement**
Claude-Flow v2.0.0 includes a hooks system for automated coordination:

```bash
# Hooks automatically trigger on operations
npx claude-flow@alpha init --force  # Auto-configures MCP servers & hooks
```

**Available Hooks:**
- **Pre-Operation**: `pre-task`, `pre-search`, `pre-edit`, `pre-command`
- **Post-Operation**: `post-edit`, `post-task`, `post-command`, `notification`
- **Session**: `session-start`, `session-end`, `session-restore`

**Examples:**
```bash
# Manual hook execution
npx claude-flow hooks pre-task --description "Build REST API" --auto-spawn-agents

# Fix hook variable issues (common with Claude Code 1.0.51+)
npx claude-flow@alpha fix-hook-variables
```

---
## 🐝 **Hive-Mind Intelligence**

### **Queen-Led AI Coordination**
Claude-Flow v2.0.0 introduces hive-mind architecture where a **Queen AI** coordinates specialized worker agents.

```bash
# Deploy swarm coordination
npx claude-flow@alpha swarm "Build a full-stack application" --strategy development

# Launch hive-mind with specializations
npx claude-flow@alpha hive-mind spawn "Create microservices architecture" --agents 8 --claude
```

### **🤖 Agent Types**
- **👑 Queen Agent**: Master coordinator and decision maker
- **🏗️ Architect Agents**: System design and technical architecture
- **💻 Coder Agents**: Implementation and development
- **🧪 Tester Agents**: Quality assurance and validation
- **📊 Analyst Agents**: Data analysis and insights
- **🔍 Researcher Agents**: Information gathering and analysis
- **🛡️ Security Agents**: Security auditing and compliance
- **🚀 DevOps Agents**: Deployment and infrastructure

**📚 Complete Agent Reference**: See [Agent Documentation](docs/AGENTS.md) for all 65+ specialized agents.

---

## ⚡ **87 MCP Tools**

Claude-Flow provides 87 MCP (Model Context Protocol) tools across these categories:

- **🐝 Swarm Orchestration** (15 tools): `swarm_init`, `agent_spawn`, `task_orchestrate`, etc.
- **🧠 Neural & Cognitive** (12 tools): `neural_train`, `neural_predict`, `pattern_recognize`, etc.
- **💾 Memory Management** (10 tools): `memory_usage`, `memory_search`, `memory_persist`, etc.
- **📊 Performance & Monitoring** (10 tools): `performance_report`, `bottleneck_analyze`, etc.
- **🔄 Workflow Automation** (10 tools): `workflow_create`, `batch_process`, etc.
- **📦 GitHub Integration** (6 tools): `github_repo_analyze`, `github_pr_manage`, etc.
- **🤖 Dynamic Agents** (6 tools): `daa_agent_create`, `daa_capability_match`, etc.
- **🛡️ System & Security** (8 tools): `security_scan`, `backup_create`, etc.

**Quick Examples:**
```bash
# Memory management with SQLite persistence
npx claude-flow@alpha memory store "project-context" "App requirements"
npx claude-flow@alpha memory stats

# Workflow automation
npx claude-flow@alpha workflow create --name "CI/CD Pipeline" --parallel

# Neural pattern recognition
npx claude-flow@alpha neural train --pattern coordination
```

> 🪟 **Windows Users**: SQLite will automatically fallback to in-memory storage if native modules fail. All features work normally, but data won't persist between sessions. See [Windows guide](docs/windows-installation.md) for persistent storage options.

**📚 Complete Tool Reference**: See [MCP Tools Documentation](docs/MCP_TOOLS.md) for detailed information on all 87 tools.

---

## 🛡️ **Claude Code Integration**

### **Auto-MCP Server Setup**
v2.0.0 Alpha automatically configures MCP servers for Claude Code integration:

```bash
# Automatic MCP integration (happens during init)
✅ claude-flow MCP server configured
✅ ruv-swarm MCP server configured  
✅ 87 tools available in Claude Code
✅ --dangerously-skip-permissions set as default
```

### **SPARC Workflows**
```bash
# SPARC development with neural enhancement
npx claude-flow@alpha sparc mode --type "neural-tdd" --auto-learn
npx claude-flow@alpha sparc workflow --phases "all" --ai-guided --memory-enhanced
```

---

## 🧠 **Cognitive Computing Features**

### **🎯 Neural Pattern Recognition**
- **27+ Cognitive Models**: Adaptive learning from successful operations
- **Pattern Analysis**: Real-time behavior analysis and optimization
- **Decision Tracking**: Complete audit trail of AI decisions
- **Performance Learning**: Continuous improvement from past executions

### **🔄 Self-Healing Systems**
```bash
# Automatic error recovery and optimization
npx claude-flow@alpha health check --components all --auto-heal
npx claude-flow@alpha fault tolerance --strategy retry-with-learning
npx claude-flow@alpha bottleneck analyze --auto-optimize
```

### **💾 Advanced Memory Architecture**
- **SQLite Persistence**: Robust `.swarm/memory.db` storage with 12 specialized tables
- **Cross-Session Persistence**: Remember context across Claude Code sessions
- **Namespace Management**: Organized memory with hierarchical access
- **Enhanced Schema**: Agent interactions, training data, performance metrics, and more
- **Memory Compression**: Efficient storage of large coordination contexts
- **Distributed Sync**: Share memory across multiple AI instances

---

## 📊 **Performance Metrics**

### **🏆 Industry-Leading Results**
- **✅ 84.8% SWE-Bench Solve Rate**: Problem-solving through hive-mind coordination
- **✅ 32.3% Token Reduction**: Efficient task breakdown reduces costs significantly
- **✅ 2.8-4.4x Speed Improvement**: Parallel coordination maximizes throughput
- **✅ 87 MCP Tools**: Most comprehensive AI tool suite available
- **✅ Zero-Config Setup**: Automatic MCP integration with Claude Code

### **🚀 Available Capabilities**
```bash
# Check memory system performance
npx claude-flow@alpha memory stats
npx claude-flow@alpha memory list

# Test GitHub coordination modes
npx claude-flow@alpha github gh-coordinator --help
npx claude-flow@alpha github pr-manager --help

# Workflow orchestration
npx claude-flow@alpha workflow create --name "Development Pipeline" --parallel
```

---

## 🎮 **Usage Examples**

```bash
# Full-stack development
npx claude-flow@alpha hive-mind spawn "Build e-commerce platform with React, Node.js, PostgreSQL" --agents 10

# Research and analysis
npx claude-flow@alpha swarm "Research AI safety patterns" --strategy research

# Security auditing
npx claude-flow@alpha github gh-coordinator analyze --analysis-type security --target ./src
```

**📚 More Examples**: See the [examples/](examples/) directory for complete tutorials and use cases.

---

## 🏗️ **Architecture**

Claude-Flow uses a layered architecture with hive-mind coordination:

```
👑 Queen Agent (Master Coordinator)
├── 🏗️ Architect │ 💻 Coder │ 🧪 Tester │ 🔍 Research │ 🛡️ Security
├── 🧠 Neural Pattern Recognition Layer
├── 💾 Distributed Memory System  
├── ⚡ 87 MCP Tools Integration Layer
└── 🛡️ Claude Code Integration
```

**Coordination Strategies:**
- **Hierarchical**: Queen-led with specialized worker agents
- **Mesh**: Peer-to-peer coordination for complex tasks
- **Adaptive**: Dynamic strategy selection based on task complexity

**📚 Detailed Architecture**: See [Architecture Documentation](docs/ARCHITECTURE.md) for complete system design.

---

## 🛠️ **Installation**

```bash
# Global installation
npm install -g claude-flow@alpha

# Or use NPX (no installation needed)
npx claude-flow@alpha init --force

# Verify installation
claude-flow --version
```

**📚 Platform-Specific Guides:**
- [🐧 Linux Installation](docs/LINUX_INSTALL.md)
- [🪟 Windows Installation](docs/windows-installation.md)
- [🐳 Docker Setup](Docker-Readme.md)

---

## 📋 **Command Reference**

```bash
npx claude-flow@alpha --help          # Main help
npx claude-flow@alpha help <command>  # Detailed command help
```

**Key Commands:**
- **Hive-Mind**: `hive-mind wizard`, `hive-mind spawn`, `hive-mind status`
- **Memory**: `memory store`, `memory query`, `memory stats`
- **GitHub**: `github <mode>` (6 specialized modes)
- **Workflows**: `workflow create`, `batch process`

**📚 Complete CLI Reference**: See [API Documentation](docs/API_DOCUMENTATION.md) for all commands.

---

## 📚 **Documentation**

**Core Guides:**
- [User Guide](docs/USER_GUIDE.md) - Complete user documentation
- [API Reference](docs/API_DOCUMENTATION.md) - All commands and tools
- [Architecture](docs/ARCHITECTURE.md) - System design
- [Examples](examples/) - Tutorials and use cases

**Installation:**
- [Linux Installation](docs/LINUX_INSTALL.md)
- [Windows Installation](docs/windows-installation.md)
- [Docker Setup](Docker-Readme.md)

**Integration:**
- [MCP Server Setup](docs/mcp-setup.md)
- [Claude Code Integration](docs/claude-code-integration.md)
- [GitHub Workflows](docs/github-workflows.md)

---

## 📄 **License**

MIT License - see [LICENSE](./LICENSE) for details.

**Alpha Disclaimer**: This is an alpha release intended for testing and feedback. Use in production environments is not recommended.

---

<div align="center">

### **Get Started**

```bash
npx claude-flow@alpha init --force
```

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/g2goose/claude-flow)
[![NPM Alpha](https://img.shields.io/badge/NPM-Alpha%20Release-orange?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/claude-flow/v/alpha)
[![Discord](https://img.shields.io/badge/Discord-Community-purple?style=for-the-badge&logo=discord)](https://discord.com/invite/dfxmpwkG2D)

**Built by [rUv](https://github.com/ruvnet) | v2.0.0 Alpha**

</div>
