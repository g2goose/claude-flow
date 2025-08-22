# 🐧 Claude-Flow Linux Installation Guide

Complete installation and usage instructions for Claude-Flow v2.0.0 Alpha on Linux systems.

## 📋 Quick Reference

| Component | Requirement | Command to Check |
|-----------|------------|------------------|
| **Node.js** | ≥ 20.0.0 | `node --version` |
| **npm** | ≥ 9.0.0 | `npm --version` |
| **Memory** | 2GB+ (8GB recommended) | `free -h` |
| **Disk** | 2GB+ free space | `df -h` |

## 🚀 Quick Installation (3 Steps)

### Step 1: Install Prerequisites

#### Ubuntu/Debian
```bash
# Update package list
sudo apt update

# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install build essentials (for native modules)
sudo apt-get install -y build-essential python3
```

#### CentOS/RHEL/Fedora
```bash
# Install Node.js 20.x
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs npm

# Install build tools
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y python3
```

#### Arch Linux
```bash
# Install Node.js
sudo pacman -S nodejs npm

# Install build tools
sudo pacman -S base-devel python
```

### Step 2: Install Claude-Flow

```bash
# Option 1: NPX (recommended - always latest)
npx claude-flow@alpha --version

# Option 2: Global installation
npm install -g claude-flow@alpha

# Option 3: Project-specific
npm install claude-flow@alpha
```

### Step 3: Initialize and Test

```bash
# Initialize Claude-Flow
npx claude-flow@alpha init --force

# Verify installation
npx claude-flow@alpha --version

# Check system status
npx claude-flow@alpha status

# Test basic functionality
npx claude-flow@alpha swarm "create a hello world script"
```

## 🎯 Basic Usage

### Essential Commands

```bash
# Get help
npx claude-flow@alpha --help

# Initialize project
npx claude-flow@alpha init --force

# Run a simple task
npx claude-flow@alpha swarm "build a REST API"

# Start hive-mind coordination
npx claude-flow@alpha hive-mind wizard

# Check system status
npx claude-flow@alpha status
npx claude-flow@alpha memory stats
```

### Common Workflows

#### 1. Single Task Execution
```bash
# Simple one-off tasks
npx claude-flow@alpha swarm "create a Python script to parse JSON"
npx claude-flow@alpha swarm "build a Dockerfile for Node.js app"
```

#### 2. Project Development
```bash
# Initialize project workspace
npx claude-flow@alpha init --force --project-name "my-app"

# Start persistent development session
npx claude-flow@alpha hive-mind spawn "build e-commerce app" --claude

# Continue working on same project
npx claude-flow@alpha hive-mind status
npx claude-flow@alpha swarm "add user authentication" --continue-session
```

#### 3. Research and Analysis
```bash
# Research tasks
npx claude-flow@alpha hive-mind spawn "research microservices patterns" \
  --agents researcher,analyst --claude

# Query accumulated knowledge
npx claude-flow@alpha memory query "authentication patterns" --recent
```

## 🔧 Linux-Specific Configuration

### Environment Variables
```bash
# Add to ~/.bashrc or ~/.zshrc
export NODE_ENV=production
export CLAUDE_FLOW_LOG_LEVEL=info
export CLAUDE_FLOW_DATA_DIR="$HOME/.claude-flow"

# Reload shell
source ~/.bashrc
```

### File Permissions
```bash
# Ensure proper permissions for data directory
mkdir -p ~/.claude-flow
chmod 755 ~/.claude-flow

# For system-wide installation
sudo chown -R $USER:$USER /usr/local/lib/node_modules/claude-flow
```

### Service Management (Optional)
```bash
# Create systemd service for background operation
sudo tee /etc/systemd/system/claude-flow.service > /dev/null << EOF
[Unit]
Description=Claude-Flow Background Service
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME
ExecStart=/usr/local/bin/claude-flow hive-mind daemon
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl enable claude-flow
sudo systemctl start claude-flow
```

## 🐳 Docker Alternative (Linux)

### Quick Docker Setup
```bash
# Clone repository
git clone https://github.com/g2goose/claude-flow.git
cd claude-flow

# Set up environment
cp .env.example .env
# Edit .env with your settings

# Start with Docker
docker compose up -d

# Check status
docker compose ps
docker compose logs claude-flow
```

### Docker Commands
```bash
# Production mode
docker compose up -d

# Development mode
docker compose --profile development up -d

# With monitoring
docker compose --profile production --profile monitoring up -d

# Update and restart
docker compose pull && docker compose up -d

# Stop services
docker compose down
```

## 🔍 Troubleshooting

### Common Issues and Solutions

#### Installation Issues

**Error: Permission denied during npm install**
```bash
# Fix npm permissions
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Or use npx instead of global install
npx claude-flow@alpha --help
```

**Error: SQLite compilation fails**
```bash
# Install build dependencies
# Ubuntu/Debian:
sudo apt-get install build-essential python3 libsqlite3-dev

# CentOS/RHEL:
sudo dnf groupinstall "Development Tools"
sudo dnf install sqlite-devel python3

# Alternative: Use without native modules
npm install --no-optional claude-flow@alpha
```

**Error: Node.js version too old**
```bash
# Remove old Node.js
sudo apt remove nodejs npm  # Ubuntu/Debian
sudo dnf remove nodejs npm  # CentOS/RHEL

# Install Node.js 20.x (see Step 1 above)
```

#### Runtime Issues

**Error: EACCES permission denied**
```bash
# Fix file permissions
sudo chown -R $USER:$USER ~/.claude-flow
sudo chown -R $USER:$USER ~/.npm

# Or run with proper permissions
sudo -u $USER npx claude-flow@alpha init
```

**Error: Port already in use**
```bash
# Check what's using the port
sudo netstat -tulpn | grep :3000

# Kill process or use different port
export CLAUDE_FLOW_PORT=3001
npx claude-flow@alpha start --port 3001
```

**Memory/Performance Issues**
```bash
# Check system resources
free -h
df -h

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Run with reduced resource usage
npx claude-flow@alpha swarm "task" --agents 2 --memory-limit 1024
```

### System Requirements Check

```bash
# Verify all requirements
echo "=== System Check ==="
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Memory: $(free -h | grep '^Mem:' | awk '{print $2}')"
echo "Disk: $(df -h . | tail -1 | awk '{print $4}' | head -1)"
echo "CPU cores: $(nproc)"
echo "Architecture: $(uname -m)"
```

## ⚡ Performance Optimization

### Memory Management
```bash
# Optimize for low-memory systems
export NODE_OPTIONS="--max-old-space-size=2048"
npx claude-flow@alpha memory optimize --compress

# Monitor memory usage
npx claude-flow@alpha memory stats
```

### CPU Optimization
```bash
# Use all available cores
npx claude-flow@alpha swarm "task" --parallel --max-agents $(nproc)

# Limit resource usage
npx claude-flow@alpha swarm "task" --agents 2 --cpu-limit 50%
```

## 📚 Advanced Usage

### MCP Integration
```bash
# Setup MCP server for Claude Code integration
npx claude-flow@alpha mcp setup --auto-permissions

# List available MCP tools
npx claude-flow@alpha mcp list-tools

# Test MCP connection
npx claude-flow@alpha mcp test-connection
```

### Memory and Data Management
```bash
# Store project context
npx claude-flow@alpha memory store "project-info" "Full-stack React app"

# Query stored information
npx claude-flow@alpha memory query "React" --namespace default

# Export/import memory
npx claude-flow@alpha memory export backup.json
npx claude-flow@alpha memory import backup.json
```

### GitHub Integration
```bash
# Analyze repository
npx claude-flow@alpha github repo-architect analyze

# Manage pull requests
npx claude-flow@alpha github pr-manager review --ai-powered

# Track issues
npx claude-flow@alpha github issue-tracker manage --auto-assign
```

## 🚦 System Status Check

```bash
#!/bin/bash
# Save as: check-claude-flow.sh

echo "🔍 Claude-Flow System Check"
echo "=========================="

# Check Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js: Not installed"
fi

# Check npm
if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm: Not installed"
fi

# Check npx
if command -v npx &> /dev/null; then
    echo "✅ npx: Available"
else
    echo "❌ npx: Not available"
fi

# Check Claude-Flow
if command -v npx &> /dev/null; then
    CLAUDE_VERSION=$(npx claude-flow@alpha --version 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "✅ Claude-Flow: $CLAUDE_VERSION"
    else
        echo "❌ Claude-Flow: Not available"
    fi
else
    echo "❌ Claude-Flow: npx not available"
fi

# Check system resources
echo "📊 System Resources:"
echo "   Memory: $(free -h | grep '^Mem:' | awk '{print $3 "/" $2}')"
echo "   Disk: $(df -h . | tail -1 | awk '{print $3 "/" $2}')"
echo "   CPU: $(nproc) cores"
echo "   Architecture: $(uname -m)"

# Check build tools
if command -v gcc &> /dev/null; then
    echo "✅ Build tools: gcc available"
else
    echo "⚠️  Build tools: gcc not found (may cause issues with native modules)"
fi

# Check Python
if command -v python3 &> /dev/null; then
    echo "✅ Python: $(python3 --version)"
else
    echo "⚠️  Python: Not found (may cause issues with native modules)"
fi

echo "=========================="
echo "🚀 System check complete!"

# Suggest next steps
if ! command -v node &> /dev/null; then
    echo ""
    echo "📋 Next Steps:"
    echo "1. Install Node.js 20.x (see Linux installation guide)"
elif ! npx claude-flow@alpha --version &> /dev/null 2>&1; then
    echo ""
    echo "📋 Next Steps:"
    echo "1. Run: npx claude-flow@alpha init --force"
    echo "2. Try: npx claude-flow@alpha swarm \"hello world\""
else
    echo ""
    echo "🎉 Ready to use Claude-Flow!"
    echo "📋 Try these commands:"
    echo "   npx claude-flow@alpha init --force"
    echo "   npx claude-flow@alpha status"
    echo "   npx claude-flow@alpha swarm \"create a simple script\""
fi
```

## 📖 Next Steps

1. **Read the User Guide**: [docs/USER_GUIDE.md](USER_GUIDE.md)
2. **Explore Examples**: [examples/](../examples/)
3. **API Documentation**: [docs/API.md](API.md)
4. **Join Community**: [Discord](https://discord.com/invite/dfxmpwkG2D)

---

**Need Help?** 
- 🐛 [Report Issues](https://github.com/g2goose/claude-flow/issues)
- 💬 [Community Discord](https://discord.com/invite/dfxmpwkG2D)
- 📚 [Full Documentation](https://github.com/g2goose/claude-flow/tree/main/docs)

---

*Claude-Flow v2.0.0 Alpha - Linux Installation Guide*