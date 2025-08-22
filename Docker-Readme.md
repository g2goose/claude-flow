# 🐳 Claude Flow Docker Setup Guide

This guide provides comprehensive instructions for setting up and working with Claude Flow using Docker on both Linux and Windows platforms.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Linux Instructions](#linux-instructions)
- [macOS Instructions](#macos-instructions)
- [Windows Instructions](#windows-instructions)
- [Docker Commands Reference](#docker-commands-reference)
- [Troubleshooting](#troubleshooting)
- [Advanced Usage](#advanced-usage)
- [Production Deployment](#production-deployment)
- [Performance Optimization](#performance-optimization)
- [Additional Resources](#additional-resources)

## Prerequisites

### System Requirements

- **Docker**: Version 20.10 or later
- **Docker Compose**: Version 2.0 or later (Docker Compose V2)
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: At least 2GB free disk space
- **CPU**: 2+ cores recommended

### Required Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Required - GitHub token for repository access
GITHUB_TOKEN=your_github_token_here

# Optional - Service ports (defaults shown)
CLAUDE_FLOW_PORT=3000
MCP_PORT=3001
REDIS_PORT=6379

# Optional - Environment settings
NODE_ENV=production
LOG_LEVEL=info
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/g2goose/claude-flow.git
cd claude-flow
```

### 2. Set Up Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your settings
# At minimum, set your GITHUB_TOKEN
```

### 3. Choose Your Environment

#### Production (Recommended for most users)
```bash
docker compose up -d
```

#### Development (For contributors)
```bash
docker compose --profile development up -d
```

#### With Monitoring
```bash
docker compose --profile production --profile monitoring up -d
```

## 🔧 Environment Setup

Claude Flow supports multiple deployment environments:

### Available Profiles

| Profile | Description | Services | Use Case |
|---------|-------------|----------|----------|
| **default** | Production ready | claude-flow, mcp-server, redis | Production deployment |
| **development** | Dev environment | + dev tools, hot reload | Code development |
| **testing** | Test environment | + test runners, coverage | CI/CD testing |
| **monitoring** | Observability | + prometheus, grafana | Performance monitoring |

### Service Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Claude Flow   │◄──►│   MCP Server    │◄──►│     Redis       │
│   (Port 3000)   │    │   (Port 3001)   │    │   (Port 6379)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   Prometheus    │    │    Grafana      │
│   (Port 80)     │    │   (Port 9090)   │    │   (Port 3001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🐧 Linux Instructions

### Prerequisites Installation

#### Ubuntu/Debian
```bash
# Update package index
sudo apt update

# Install Docker
sudo apt install -y docker.io docker-compose-plugin

# Add user to docker group (logout/login required)
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

#### CentOS/RHEL/Fedora
```bash
# Install Docker
sudo dnf install -y docker docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER
```

#### Arch Linux
```bash
# Install Docker
sudo pacman -S docker docker-compose

# Start Docker service
sudo systemctl start docker.service
sudo systemctl enable docker.service

# Add user to docker group
sudo usermod -aG docker $USER
```

### Building and Running on Linux

#### 1. Build Images
```bash
# Build all image targets
./scripts/docker-manager.sh build-all

# Or build specific target
docker compose build claude-flow
```

#### 2. Run Different Environments

**Production Environment:**
```bash
# Start all production services
docker compose up -d

# Check service status
docker compose ps

# View logs
docker compose logs -f claude-flow
```

**Development Environment:**
```bash
# Start development environment with hot reload
docker compose --profile development up -d

# Access development container shell
docker compose exec claude-flow-dev bash

# View development logs
docker compose --profile development logs -f
```

**Testing Environment:**
```bash
# Run tests in isolated environment
docker compose --profile testing up --abort-on-container-exit

# Run specific test suites
docker compose run --rm claude-flow-test npm run test:unit
```

#### 3. Management Commands

```bash
# Stop all services
docker compose down

# Stop and remove volumes (⚠️ destroys data)
docker compose down -v

# Update images and restart
docker compose pull && docker compose up -d

# Scale services
docker compose up -d --scale claude-flow=3
```

### Linux-Specific Optimizations

#### Performance Tuning
```bash
# Increase Docker daemon log level for debugging
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "log-level": "info",
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ],
  "experimental": true,
  "features": {
    "buildkit": true
  }
}
EOF

# Restart Docker
sudo systemctl restart docker
```

#### Resource Management
```bash
# Monitor Docker resource usage
docker stats

# Clean up unused resources
docker system prune -f

# Clean up unused volumes
docker volume prune -f

# Set resource limits for containers
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

#### Development Optimizations
```bash
# Enable BuildKit for faster builds
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Optimize for development
docker compose --profile development up -d --build
```

## 🍎 macOS Instructions

### Prerequisites Installation

#### macOS with Docker Desktop (Recommended)

1. **Install Docker Desktop:**
   - Download from [Docker Desktop for Mac](https://docs.docker.com/desktop/mac/install/)
   - Choose the appropriate version:
     - **Intel Macs**: Docker Desktop for Mac with Intel chip
     - **Apple Silicon (M1/M2/M3)**: Docker Desktop for Mac with Apple chip
   - Install by dragging to Applications folder
   - Start Docker Desktop from Applications

2. **Configure Docker Desktop:**
   - Open Docker Desktop
   - Go to Settings → General
   - Enable "Use gRPC FUSE for file sharing" (better performance)
   - Go to Settings → Resources
   - Allocate sufficient resources:
     - **Memory**: 4GB minimum, 8GB recommended
     - **CPU**: 2+ cores
     - **Disk**: 60GB+ available space

3. **Install Homebrew (optional but recommended):**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

#### Alternative: Colima + Docker CLI (Lightweight)

For developers who prefer a lighter alternative to Docker Desktop:

```bash
# Install via Homebrew
brew install colima docker docker-compose

# Start Colima with appropriate architecture
# For Intel Macs:
colima start --arch x86_64 --memory 4

# For Apple Silicon Macs:
colima start --arch aarch64 --memory 4 --vm-type=vz --vz-rosetta

# Verify installation
docker --version
docker compose version
```

### Building and Running on macOS

#### 1. Clone and Setup

```bash
# Clone repository
git clone https://github.com/g2goose/claude-flow.git
cd claude-flow

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env  # or use your preferred editor
```

#### 2. Build and Run

**Using Docker Desktop:**
```bash
# Build for your architecture automatically
docker compose build

# Start production environment
docker compose up -d

# Check services
docker compose ps
```

**For Apple Silicon with cross-platform builds:**
```bash
# Enable multi-platform builds
docker buildx create --use --name multi-arch-builder
docker buildx inspect --bootstrap

# Build for multiple architectures
docker buildx build --platform linux/arm64,linux/amd64 -t claude-flow:multi-arch .

# Build ARM64 optimized version
docker buildx build --platform linux/arm64 -t claude-flow:arm64 .
```

#### 3. Development Environment

```bash
# Start development environment with hot reload
docker compose --profile development up -d

# Access development container
docker compose exec claude-flow-dev bash

# View logs with filtering
docker compose logs -f claude-flow-dev | grep -E "(ERROR|WARN|INFO)"
```

### macOS-Specific Optimizations

#### Performance Tuning for Docker Desktop

1. **File Sharing Optimization:**
   ```bash
   # Use bind mounts with :cached flag for better performance
   # Already configured in docker-compose.yml
   volumes:
     - .:/app:cached
     - /app/node_modules
   ```

2. **Resource Allocation:**
   - Docker Desktop → Settings → Resources
   - **Memory**: 6-8GB for development, 4GB minimum for production
   - **CPU**: Use all available cores
   - **Swap**: 1GB

3. **Enable Docker Buildkit:**
   ```bash
   # Add to ~/.zshrc or ~/.bash_profile
   export DOCKER_BUILDKIT=1
   export COMPOSE_DOCKER_CLI_BUILD=1
   ```

#### Apple Silicon Specific Considerations

```bash
# Build for Apple Silicon architecture
docker buildx build --platform linux/arm64 -t claude-flow:arm64-native .

# Run with platform specification
docker compose up -d --platform linux/arm64

# If you encounter architecture issues, force x86_64 emulation
# Specify platform in docker-compose.override.yml for Apple Silicon
# docker compose up -d

# Example docker-compose.override.yml to force x86_64 emulation:
# (Place this file alongside your docker-compose.yml)
# 
# services:
#   app:
#     platform: linux/amd64
#
# Then run:
# docker compose up -d
```

#### Development Workflow

```bash
# Use the convenience script for macOS
chmod +x scripts/docker-manager.sh

# Start development environment
./scripts/docker-manager.sh dev

# Run tests
./scripts/docker-manager.sh test

# Monitor performance
./scripts/docker-manager.sh health

# Clean up resources
./scripts/docker-manager.sh cleanup
```

### Homebrew Integration

For developers using Homebrew, create helpful aliases:

```bash
# Add to ~/.zshrc or ~/.bash_profile
alias claude-up="cd /path/to/claude-flow && docker compose up -d"
alias claude-down="cd /path/to/claude-flow && docker compose down"
alias claude-logs="cd /path/to/claude-flow && docker compose logs -f"
alias claude-dev="cd /path/to/claude-flow && docker compose --profile development up -d"
```

### macOS Troubleshooting

#### Common Issues

**1. Port Conflicts with AirPlay:**
```bash
# macOS Monterey+ uses port 5000 for AirPlay
# Change the port in .env file
echo "CLAUDE_FLOW_PORT=3000" >> .env
```

**2. File Permission Issues:**
```bash
# Fix file permissions
sudo chown -R $(whoami):staff /path/to/claude-flow
chmod -R 755 /path/to/claude-flow
```

**3. Apple Silicon Compatibility:**
```bash
# If containers fail to start, try platform override
docker compose up -d --platform linux/amd64

# Or build native ARM64 images
docker buildx build --platform linux/arm64 -t claude-flow:native .
```

**4. Docker Desktop Resource Issues:**
```bash
# Reset Docker Desktop if performance degrades
# Docker Desktop → Troubleshoot → Reset to factory defaults

# Or restart Docker daemon
sudo killall Docker && open /Applications/Docker.app
```

### Prerequisites Installation

#### Windows 10/11 with WSL2 (Recommended)

1. **Install WSL2:**
   ```powershell
   # Run in PowerShell as Administrator
   wsl --install
   # Restart computer when prompted
   ```

2. **Install Docker Desktop:**
   - Download from [Docker Desktop for Windows](https://docs.docker.com/desktop/windows/install/)
   - Install with WSL2 backend enabled
   - Restart computer when installation completes

3. **Configure Docker Desktop:**
   - Open Docker Desktop
   - Go to Settings → General
   - Ensure "Use WSL 2 based engine" is checked
   - Go to Settings → Resources → WSL Integration
   - Enable integration with your WSL2 distributions

#### Windows with Hyper-V (Alternative)

1. **Enable Hyper-V:**
   ```powershell
   # Run in PowerShell as Administrator
   Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
   ```

2. **Install Docker Desktop with Hyper-V backend**

### Building and Running on Windows

#### Using WSL2 (Recommended)

1. **Open WSL2 Terminal:**
   ```bash
   # Open Ubuntu or your preferred WSL2 distribution
   wsl
   
   # Navigate to your project
   cd /mnt/c/your-project-path/claude-flow
   ```

2. **Follow Linux commands:**
   ```bash
   # All Linux commands work in WSL2
   docker compose up -d
   ```

#### Using Windows PowerShell/CMD

1. **Clone Repository:**
   ```powershell
   git clone https://github.com/g2goose/claude-flow.git
   cd claude-flow
   ```

2. **Set Environment Variables:**
   ```powershell
   # Create .env file
   copy .env.example .env
   
   # Edit .env file with notepad or your preferred editor
   notepad .env
   ```

3. **Build and Run:**
   ```powershell
   # Build images
   docker compose build
   
   # Start services
   docker compose up -d
   
   # Check status
   docker compose ps
   
   # View logs
   docker compose logs -f claude-flow
   ```

#### Advanced Windows Configuration

**1. Performance Optimization:**
```powershell
# Enable Windows features for better Docker performance
Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -All
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -All

# Set WSL2 as default
wsl --set-default-version 2

# Configure Docker Desktop resource limits
# Docker Desktop → Settings → Resources:
# Memory: 6-8GB (adjust based on available RAM)
# CPU: Use all available cores
# Disk: 100GB+ recommended
```

**2. Environment-Specific Builds:**
```powershell
# Development environment
docker compose --profile development up -d

# Production environment  
docker compose --profile production up -d

# With monitoring
docker compose --profile production --profile monitoring up -d
```

**3. Windows Container Support:**
```powershell
# Switch to Windows containers (if needed)
# Right-click Docker tray icon → "Switch to Windows containers"

# For Linux containers on Windows (recommended)
# Ensure "Use WSL 2 based engine" is enabled in Docker Desktop settings
```

### Quick Windows Batch Files

For Windows users, we provide convenient batch files for common operations:

**start-claude-flow.bat:**
- Starts Claude Flow in production mode
- Shows service status
- Displays access URL

**stop-claude-flow.bat:**
- Stops all Claude Flow services
- Confirms shutdown

**logs-claude-flow.bat:**
- Shows real-time logs from Claude Flow service
- Press Ctrl+C to exit

#### Usage
```cmd
# Start Claude Flow
start-claude-flow.bat

# View logs in another terminal
logs-claude-flow.bat

# Stop when done
stop-claude-flow.bat
```

**Create custom batch files:**

You can create additional custom batch files as needed:

**dev-claude-flow.bat:**
```batch
@echo off
echo Starting Claude Flow Development Environment...
docker compose --profile development up -d
docker compose ps
pause
```

### Windows-Specific Considerations

#### Path Handling
```powershell
# Use forward slashes in volume mounts
# Windows paths need conversion for Docker
-v C:/Users/YourName/data:/app/data
```

#### Permission Issues
```powershell
# If you encounter permission errors:
# 1. Ensure Docker Desktop is running as Administrator
# 2. Check folder permissions
icacls C:\your-project-path /grant Everyone:F /T
```

#### PowerShell Commands
```powershell
# Use PowerShell for better Docker integration
docker compose --profile development up -d

# View container logs
docker compose logs -f

# Execute commands in containers
docker compose exec claude-flow powershell
```

## 📖 Docker Commands Reference

### Essential Commands

#### Container Management
```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Restart specific service
docker compose restart claude-flow

# View running containers
docker compose ps

# View all containers
docker ps -a
```

#### Image Management
```bash
# Build images
docker compose build

# Pull latest images
docker compose pull

# List images
docker images

# Remove unused images
docker image prune -f
```

#### Logs and Debugging
```bash
# View logs (all services)
docker compose logs

# Follow logs for specific service
docker compose logs -f claude-flow

# Execute shell in running container
docker compose exec claude-flow bash

# Run one-off commands
docker compose run --rm claude-flow npm --version
```

#### Data Management
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect claude-flow_claude-flow-data

# Backup volume
docker run --rm -v claude-flow_claude-flow-data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .

# Restore volume
docker run --rm -v claude-flow_claude-flow-data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /data
```

### Environment-Specific Commands

#### Development
```bash
# Start development environment
docker compose --profile development up -d

# Access development shell
docker compose exec claude-flow-dev bash

# Run development tests
docker compose exec claude-flow-dev npm test

# View development logs
docker compose --profile development logs -f
```

#### Testing
```bash
# Run full test suite
docker compose --profile testing up --abort-on-container-exit

# Run specific tests
docker compose run --rm claude-flow-test npm run test:unit

# Generate coverage report
docker compose run --rm claude-flow-test npm run test:coverage
```

#### Production
```bash
# Production deployment
docker compose --profile production up -d

# Health check
docker compose exec claude-flow curl http://localhost:3000/health

# Monitor resources
docker stats
```

### Using the Docker Manager Script

The repository includes a helper script for common operations:

```bash
# Make script executable (Linux/WSL)
chmod +x scripts/docker-manager.sh

# Available commands:
./scripts/docker-manager.sh build-all        # Build all targets
./scripts/docker-manager.sh dev             # Start development
./scripts/docker-manager.sh test            # Run tests
./scripts/docker-manager.sh prod            # Start production
./scripts/docker-manager.sh health          # Health check
./scripts/docker-manager.sh logs [service]  # View logs
./scripts/docker-manager.sh cleanup         # Clean resources
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "Docker not found" Error

**Linux:**
```bash
# Check if Docker is installed
which docker

# Install if missing (Ubuntu/Debian)
sudo apt update && sudo apt install docker.io

# Start Docker service
sudo systemctl start docker
```

**Windows:**
```powershell
# Ensure Docker Desktop is running
# Check in system tray for Docker whale icon
# If not running, start Docker Desktop from Start menu
```

#### 2. Permission Denied Errors

**Linux:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again, or use:
newgrp docker

# Fix permissions on Docker socket
sudo chmod 666 /var/run/docker.sock
```

**Windows:**
```powershell
# Run PowerShell/CMD as Administrator
# Or ensure Docker Desktop is running with admin privileges
```

#### 3. Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000  # Linux/macOS
netstat -ano | findstr :3000  # Windows

# Kill process or change port in .env file
echo "CLAUDE_FLOW_PORT=3001" >> .env
```

#### 4. Build Failures

```bash
# Clear Docker build cache
docker builder prune -f

# Rebuild without cache
docker compose build --no-cache

# Check available disk space
docker system df
```

#### 5. Container Won't Start

```bash
# Check container logs
docker compose logs claude-flow

# Inspect container configuration
docker compose config

# Check health status
docker compose ps
```

#### 6. Memory Issues

**Linux:**
```bash
# Increase Docker memory (if using Docker Desktop)
# Settings → Resources → Advanced → Memory

# Check system memory
free -h

# Clean up unused containers/images
docker system prune -a
```

**Windows:**
```powershell
# Docker Desktop → Settings → Resources → Advanced
# Increase Memory allocation
# Restart Docker Desktop
```

#### 7. Slow Performance

```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1

# Enable Docker layer caching
docker compose build --progress=plain

# Use volume mounts for node_modules (development)
# Already configured in docker-compose.yml
```

#### 8. Network Issues

```bash
# Reset Docker networks
docker network prune -f

# Check network configuration
docker network ls
docker network inspect claude-flow_claude-flow-network

# Restart Docker daemon (Linux)
sudo systemctl restart docker
```

### Platform-Specific Issues

#### Linux-Specific

**SELinux Issues (CentOS/RHEL):**
```bash
# Check SELinux status
getenforce

# Set SELinux to permissive (temporary)
sudo setenforce 0

# Configure SELinux for Docker permanently
sudo setsebool -P container_manage_cgroup 1

# Create custom SELinux policy if needed
sudo ausearch -c 'dockerd' --raw | audit2allow -M my-dockerd
sudo semodule -i my-dockerd.pp
```

**Firewall Issues:**
```bash
# Allow Docker through firewall (Ubuntu/UFW)
sudo ufw allow 2376/tcp
sudo ufw allow 7946/tcp
sudo ufw allow 7946/udp
sudo ufw allow 4789/udp

# For specific ports used by Claude Flow
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw allow 6379/tcp

# CentOS/RHEL/Fedora (firewalld)
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --permanent --add-port=6379/tcp
sudo firewall-cmd --reload
```

**Storage Driver Issues:**
```bash
# Check current storage driver
docker info | grep "Storage Driver"

# Change to overlay2 if needed
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "storage-driver": "overlay2"
}
EOF

sudo systemctl restart docker
```

**Systemd Integration Issues:**
```bash
# Fix Docker service if it won't start
sudo systemctl daemon-reload
sudo systemctl reset-failed docker
sudo systemctl start docker

# Check service status
sudo systemctl status docker
sudo journalctl -u docker.service
```

#### macOS-Specific

**File Permission Issues:**
```bash
# Fix ownership issues
sudo chown -R $(whoami):staff ~/path/to/claude-flow

# Reset Docker Desktop if needed
# Docker Desktop → Troubleshoot → Reset to factory defaults
```

**Port Conflicts (macOS Monterey+):**
```bash
# macOS uses port 5000 for AirPlay Receiver
# Disable AirPlay Receiver or change Claude Flow port
# System Preferences → Sharing → AirPlay Receiver (uncheck)

# Or change port in .env
echo "CLAUDE_FLOW_PORT=3000" >> .env
echo "MCP_PORT=3001" >> .env
```

**Apple Silicon Compatibility:**
```bash
# Force x86_64 emulation if needed
docker compose up -d --platform linux/amd64

# Build native ARM64 images
docker buildx build --platform linux/arm64 -t claude-flow:arm64 .

# Check architecture compatibility
docker run --rm claude-flow:latest uname -m
```

**Docker Desktop Resource Issues:**
```bash
# Increase resources in Docker Desktop
# Settings → Resources → Advanced:
# Memory: 8GB+ (for development)
# CPU: All available cores
# Disk: 100GB+ free space

# Clear Docker cache if disk space is low
docker system prune -a --volumes
```

#### Windows-Specific

**Hyper-V Conflicts:**
```powershell
# Check Hyper-V status
Get-WindowsOptionalFeature -FeatureName Microsoft-Hyper-V-All -Online

# Disable Hyper-V if using VirtualBox
bcdedit /set hypervisorlaunchtype off
# Restart computer

# Re-enable Hyper-V for Docker
bcdedit /set hypervisorlaunchtype auto
# Restart computer
```

**WSL2 Issues:**
```powershell
# Update WSL2 kernel
wsl --update

# Set WSL2 as default
wsl --set-default-version 2

# Convert existing distribution to WSL2
wsl --list -v
wsl --set-version Ubuntu-20.04 2

# Restart WSL2 if having issues
wsl --shutdown
# Restart Docker Desktop
```

**PowerShell Execution Policy:**
```powershell
# Check current execution policy
Get-ExecutionPolicy

# Set execution policy to allow scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Alternative: bypass for current session
powershell -ExecutionPolicy Bypass -File script.ps1
```

**Windows Path Issues:**
```powershell
# Use forward slashes in Docker volume mounts
# Correct:
docker run -v C:/Users/name/project:/app claude-flow

# Convert Windows paths to WSL2 paths
# C:\Users\name\project becomes /mnt/c/Users/name/project
```

**Docker Desktop Service Issues:**
```powershell
# Restart Docker Desktop service
Stop-Service -Name "Docker Desktop Service"
Start-Service -Name "Docker Desktop Service"

# Reset Docker Desktop to factory defaults
# Docker Desktop → Troubleshoot → Reset to factory defaults

# Check Windows Event Logs for Docker errors
Get-EventLog -LogName Application -Source Docker*
```

**Antivirus Interference:**
```powershell
# Add Docker directories to antivirus exclusions:
# - C:\Program Files\Docker
# - C:\ProgramData\Docker
# - C:\Users\{username}\.docker
# - WSL2 directories: \\wsl$\

# Windows Defender exclusions
Add-MpPreference -ExclusionPath "C:\Program Files\Docker"
Add-MpPreference -ExclusionPath "C:\ProgramData\Docker"
Add-MpPreference -ExclusionPath "$env:USERPROFILE\.docker"
```



### Advanced Troubleshooting

#### Container Debug Techniques

```bash
# Debug failing container builds
docker build --progress=plain --no-cache -t claude-flow:debug .

# Inspect failed build layers
docker run --rm -it $(docker build --quiet .) sh

# Debug running container
docker compose exec claude-flow bash
# or for Alpine-based containers:
docker compose exec claude-flow sh

# Check container logs with timestamps
docker compose logs -f -t claude-flow

# Inspect container filesystem
docker compose exec claude-flow find /app -type f -name "*.log"
docker compose exec claude-flow ls -la /app/
```

#### Network Troubleshooting

```bash
# Check Docker networks
docker network ls
docker network inspect claude-flow_claude-flow-network

# Test connectivity between containers
docker compose exec claude-flow ping redis
docker compose exec claude-flow ping mcp-server

# Check port bindings
docker compose port claude-flow 3000
netstat -tulpn | grep :3000

# Test external connectivity
docker compose exec claude-flow curl -I http://github.com
docker compose exec claude-flow nslookup github.com
```

#### Performance Debugging

```bash
# Monitor container resource usage in real-time
docker stats --no-stream
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

# Check Docker daemon resource usage
docker system df
docker system events

# Profile container startup time
time docker compose up -d claude-flow

# Check container processes
docker compose exec claude-flow ps aux
docker compose exec claude-flow top
```

#### Storage Troubleshooting

```bash
# Check volume mounts
docker volume ls
docker volume inspect claude-flow_claude-flow-data

# Debug volume permissions
docker compose exec claude-flow ls -la /home/claude/.claude-flow
docker compose exec claude-flow whoami
docker compose exec claude-flow id

# Fix volume permission issues (Linux/macOS)
docker compose exec --user root claude-flow chown -R claude:claude /home/claude/.claude-flow

# Backup and restore volumes
docker run --rm -v claude-flow_claude-flow-data:/data -v $(pwd):/backup alpine \
  tar czf /backup/claude-flow-backup-$(date +%Y%m%d).tar.gz -C /data .

# Restore from backup
docker run --rm -v claude-flow_claude-flow-data:/data -v $(pwd):/backup alpine \
  tar xzf /backup/claude-flow-backup-20240101.tar.gz -C /data
```

#### Environment Variable Debugging

```bash
# Check environment variables in container
docker compose exec claude-flow env | grep CLAUDE
docker compose exec claude-flow printenv

# Validate .env file
cat .env | grep -v '^#' | grep -v '^$'

# Check Docker Compose variable substitution
docker compose config
```

#### Health Check Debugging

```bash
# Check health status
docker compose ps
docker inspect --format='{{.State.Health.Status}}' claude-flow

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' claude-flow

# Test health check manually
docker compose exec claude-flow curl -f http://localhost:3000/health
```

### Emergency Recovery Procedures

#### Complete System Reset

```bash
# Stop all containers
docker compose down

# Remove all containers, networks, and volumes
docker system prune -a --volumes

# Remove all images
docker image prune -a

# Rebuild from scratch
docker compose build --no-cache
docker compose up -d
```

#### Backup and Recovery

```bash
# Create full backup script
cat > backup-claude-flow.sh << 'EOF'
#!/bin/bash
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/${BACKUP_DATE}"

mkdir -p "${BACKUP_DIR}"

# Backup volumes
docker run --rm -v claude-flow_claude-flow-data:/data -v $(pwd)/${BACKUP_DIR}:/backup alpine \
  tar czf /backup/claude-flow-data.tar.gz -C /data .

docker run --rm -v claude-flow_redis-data:/data -v $(pwd)/${BACKUP_DIR}:/backup alpine \
  tar czf /backup/redis-data.tar.gz -C /data .

# Backup configuration
cp .env "${BACKUP_DIR}/"
cp docker-compose.yml "${BACKUP_DIR}/"

echo "Backup completed: ${BACKUP_DIR}"
EOF

chmod +x backup-claude-flow.sh
./backup-claude-flow.sh
```

#### Restore Procedure

```bash
# Restore from backup
BACKUP_DIR="./backups/20240101_120000"

# Stop services
docker compose down

# Remove existing volumes
docker volume rm claude-flow_claude-flow-data claude-flow_redis-data

# Recreate volumes
docker volume create claude-flow_claude-flow-data
docker volume create claude-flow_redis-data

# Restore data
docker run --rm -v claude-flow_claude-flow-data:/data -v $(pwd)/${BACKUP_DIR}:/backup alpine \
  tar xzf /backup/claude-flow-data.tar.gz -C /data

docker run --rm -v claude-flow_redis-data:/data -v $(pwd)/${BACKUP_DIR}:/backup alpine \
  tar xzf /backup/redis-data.tar.gz -C /data

# Restore configuration
cp "${BACKUP_DIR}/.env" .
cp "${BACKUP_DIR}/docker-compose.yml" .

# Start services
docker compose up -d
```

### Getting Help

If you continue to experience issues:

1. **Check the logs:**
   ```bash
   docker compose logs --details
   ```

2. **Validate your setup:**
   ```bash
   ./scripts/docker-manager.sh health
   ```

3. **Check system resources:**
   ```bash
   docker system df
   docker stats
   ```

4. **Create a GitHub issue with:**
   - Your operating system and version
   - Docker and Docker Compose versions
   - Complete error messages
   - Steps to reproduce the issue

## 🚀 Advanced Usage

### Custom Configuration

#### Override Docker Compose Settings

Create a `docker-compose.override.yml` file:

```yaml
version: '3.8'

services:
  claude-flow:
    environment:
      - DEBUG=claude-flow:*
      - CUSTOM_SETTING=value
    ports:
      - "3005:3000"  # Use different port
    volumes:
      - ./custom-config:/app/config
```

#### Production Optimizations

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  claude-flow:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    restart: unless-stopped
```

Run with: `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`

### Multi-Architecture Builds

```bash
# Build for multiple platforms
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 -t claude-flow:multi-arch --push .

# Build for Apple Silicon (M1/M2)
docker buildx build --platform linux/arm64 -t claude-flow:arm64 .
```

### Development Workflow

#### Hot Reload Development

```bash
# Start development with file watching
docker compose --profile development up -d

# Make code changes - container will automatically reload
# View real-time logs
docker compose logs -f claude-flow-dev
```

#### Remote Debugging

```bash
# Start with debug port exposed
docker compose run --rm -p 9229:9229 claude-flow-dev npm run dev:debug

# Connect debugger to localhost:9229
```

### Production Deployment

#### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml claude-flow

# Scale services
docker service scale claude-flow_claude-flow=3
```

#### Kubernetes

```bash
# Generate Kubernetes manifests
kompose convert -f docker-compose.yml

# Deploy to Kubernetes
kubectl apply -f ./
```

### Monitoring and Maintenance

#### Health Checks

```bash
# Check service health
curl http://localhost:3000/health

# View health status
docker compose ps
```

#### Backup and Restore

```bash
# Backup data volumes
./scripts/docker-manager.sh backup

# Restore from backup
./scripts/docker-manager.sh restore backup.tar.gz
```

#### Updates and Maintenance

```bash
# Update to latest images
docker compose pull
docker compose up -d

# Clean up old images
docker image prune -f

# Monitor resource usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

---

## 🚀 Production Deployment

### Production Checklist

Before deploying to production, ensure you have:

- [ ] **Environment Variables**: All required variables set in `.env`
- [ ] **Security**: GitHub token with minimal required permissions
- [ ] **SSL/TLS**: HTTPS certificates configured
- [ ] **Monitoring**: Prometheus and Grafana configured
- [ ] **Backup**: Volume backup strategy in place
- [ ] **Resources**: Adequate CPU, memory, and storage
- [ ] **Network**: Firewall rules configured

### Production Configuration

#### 1. Environment Setup

```bash
# Production environment file
cat > .env.production << EOF
NODE_ENV=production
GITHUB_TOKEN=ghp_your_production_token
CLAUDE_FLOW_PORT=3000
MCP_PORT=3001
REDIS_PORT=6379
LOG_LEVEL=warn
REDIS_MAXMEMORY_POLICY=allkeys-lru
REDIS_PASSWORD=your_secure_redis_password
GRAFANA_ADMIN_PASSWORD=your_secure_grafana_password
EOF
```

#### 2. SSL/TLS Configuration

Create SSL certificates directory:
```bash
mkdir -p docker/nginx/ssl

# Using Let's Encrypt (recommended)
# Install certbot first
sudo apt install certbot  # Ubuntu/Debian
brew install certbot      # macOS

# Generate certificates
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/nginx/ssl/
```

#### 3. Production Deployment

```bash
# Pull latest images
docker compose pull

# Deploy with production profile
docker compose --profile production --profile monitoring up -d

# Verify deployment
./scripts/docker-manager.sh health

# Check all services are running
docker compose ps
```

### Container Orchestration

#### Docker Swarm Deployment

```bash
# Initialize Docker Swarm
docker swarm init

# Create production stack file
cat > docker-stack.yml << EOF
version: '3.8'

services:
  claude-flow:
    image: claude-flow:latest
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    networks:
      - claude-flow-network
    ports:
      - "3000:3000"
EOF

# Deploy stack
docker stack deploy -c docker-stack.yml claude-flow

# Scale services
docker service scale claude-flow_claude-flow=5
```

#### Kubernetes Deployment

```bash
# Install kompose for conversion
curl -L https://github.com/kubernetes/kompose/releases/latest/download/kompose-linux-amd64 -o kompose
chmod +x kompose && sudo mv kompose /usr/local/bin/

# Convert docker-compose to Kubernetes manifests
kompose convert -f docker-compose.yml

# Deploy to Kubernetes
kubectl apply -f ./

# Create namespace
kubectl create namespace claude-flow

# Deploy with namespace
kubectl apply -f ./ -n claude-flow

# Check deployment
kubectl get pods -n claude-flow
```

### Load Balancing and High Availability

#### Nginx Configuration

```nginx
# docker/nginx/nginx.conf
upstream claude-flow-backend {
    least_conn;
    server claude-flow-1:3000 max_fails=3 fail_timeout=30s;
    server claude-flow-2:3000 max_fails=3 fail_timeout=30s;
    server claude-flow-3:3000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass http://claude-flow-backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Security Hardening

#### Container Security

```bash
# Run security scan
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image claude-flow:latest

# Check for secrets
docker run --rm -v $(pwd):/repo zricethezav/gitleaks:latest \
  detect --source /repo --verbose
```

#### Runtime Security

```yaml
# Security constraints in docker-compose.yml
security_opt:
  - no-new-privileges:true
read_only: true
tmpfs:
  - /tmp
  - /var/cache
cap_drop:
  - ALL
cap_add:
  - CHOWN
  - SETGID
  - SETUID
```

## ⚡ Performance Optimization

### System-Level Optimizations

#### Linux Performance Tuning

```bash
# Kernel parameters for Docker performance
echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf
echo 'net.core.somaxconn=65535' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv4.tcp_max_syn_backlog=8192' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Docker daemon optimization
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ],
  "experimental": true,
  "features": {
    "buildkit": true
  },
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}
EOF

sudo systemctl restart docker
```

#### macOS Performance Tuning

```bash
# Docker Desktop settings optimization
# Increase resources in Docker Desktop settings:
# - Memory: 8GB+
# - CPU: All available cores
# - Disk: 100GB+

# Enable file system optimizations
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Use volume mounts for better performance
# Already configured in docker-compose.yml with :cached flags
```

#### Windows Performance Tuning

```powershell
# Enable Hyper-V performance features
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All -All

# WSL2 optimization
wsl --set-default-version 2
wsl --update

# Docker Desktop settings
# Resources → Advanced:
# - Memory: 6-8GB
# - CPU: All available cores
# - Swap: 2GB
```

### Application-Level Optimizations

#### Build Performance

```bash
# Multi-stage build with caching
docker buildx build \
  --cache-from type=registry,ref=claude-flow:cache \
  --cache-to type=registry,ref=claude-flow:cache,mode=max \
  --target production \
  -t claude-flow:optimized .

# Parallel builds
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t claude-flow:multi-arch .
```

#### Runtime Performance

```yaml
# Resource limits in docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

#### Database Performance

```bash
# Redis optimization
redis-cli CONFIG SET maxmemory-policy allkeys-lru
redis-cli CONFIG SET maxmemory 512mb
redis-cli CONFIG SET save "900 1 300 10 60 10000"

# SQLite optimization (if using SQLite)
echo "PRAGMA journal_mode=WAL;" | sqlite3 /app/data/claude-flow.db
echo "PRAGMA synchronous=NORMAL;" | sqlite3 /app/data/claude-flow.db
```

### Monitoring and Metrics

#### Performance Monitoring

```bash
# Start monitoring stack
docker compose --profile monitoring up -d

# Access Grafana dashboard
open http://localhost:3001

# Default credentials: admin/admin
# Import Claude Flow dashboard from docker/monitoring/grafana/dashboards/
```

#### Custom Metrics

```javascript
// Example custom metrics in your application
const promClient = require('prom-client');

const httpDuration = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});
```

#### Alerting Rules

```yaml
# docker/monitoring/prometheus/alerts.yml
groups:
  - name: claude-flow
    rules:
      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes{name="claude-flow"} / container_spec_memory_limit_bytes{name="claude-flow"} > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High memory usage detected
          
      - alert: HighCPUUsage
        expr: rate(container_cpu_usage_seconds_total{name="claude-flow"}[5m]) > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High CPU usage detected
```

### Scaling Strategies

#### Horizontal Scaling

```bash
# Scale Claude Flow service
docker compose up -d --scale claude-flow=3

# With Docker Swarm
docker service scale claude-flow_claude-flow=5

# With Kubernetes
kubectl scale deployment claude-flow --replicas=5
```

#### Vertical Scaling

```yaml
# Increase container resources
services:
  claude-flow:
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

#### Auto-scaling (Kubernetes)

```yaml
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: claude-flow-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: claude-flow
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## 📚 Additional Resources

### Quick Setup Scripts

We provide several scripts to help you get started quickly:

#### Automated Setup (Recommended)
```bash
# Linux/macOS - Automated environment setup
./scripts/setup-docker-env.sh

# Windows - PowerShell setup script
.\scripts\setup-docker-env.ps1
```

#### Validation and Testing
```bash
# Validate your Docker setup
./scripts/validate-docker-setup.sh

# Docker management utility
./scripts/docker-manager.sh --help
```

#### Windows Batch Files
```cmd
REM Production environment
start-claude-flow.bat

REM Development environment  
dev-claude-flow.bat

REM View logs
logs-claude-flow.bat

REM Stop services
stop-claude-flow.bat
```

### Documentation Links

- **[Docker Documentation](https://docs.docker.com/)** - Official Docker documentation
- **[Docker Compose Reference](https://docs.docker.com/compose/)** - Docker Compose command reference
- **[Claude Flow Architecture](./docs/ARCHITECTURE.md)** - System architecture overview
- **[Docker Strategy](./docs/DOCKER_STRATEGY.md)** - Detailed Docker implementation strategy
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Development Workflow](./docs/DEVELOPMENT_WORKFLOW.md)** - Development best practices

### Community Support

- **[GitHub Issues](https://github.com/g2goose/claude-flow/issues)** - Report bugs and request features
- **[GitHub Discussions](https://github.com/g2goose/claude-flow/discussions)** - Community Q&A
- **[Wiki](https://github.com/g2goose/claude-flow/wiki)** - Additional documentation and guides

### Platform-Specific Resources

#### Linux
- **[Docker Engine Installation](https://docs.docker.com/engine/install/)** - Install Docker on Linux
- **[Post-installation Steps](https://docs.docker.com/engine/install/linux-postinstall/)** - Configure Docker for non-root users
- **[Ubuntu Docker Guide](https://docs.docker.com/engine/install/ubuntu/)** - Ubuntu-specific instructions

#### macOS
- **[Docker Desktop for Mac](https://docs.docker.com/desktop/mac/install/)** - Official Docker Desktop
- **[Colima](https://github.com/abiosoft/colima)** - Lightweight Docker alternative
- **[Homebrew](https://brew.sh/)** - Package manager for macOS

#### Windows
- **[Docker Desktop for Windows](https://docs.docker.com/desktop/windows/install/)** - Official Docker Desktop
- **[WSL2 Installation](https://docs.microsoft.com/en-us/windows/wsl/install)** - Windows Subsystem for Linux
- **[Windows Terminal](https://github.com/microsoft/terminal)** - Modern terminal for Windows

### Common Use Cases

#### Development Workflow
```bash
# Start development environment
docker compose --profile development up -d

# Make code changes (hot reload enabled)
# Files are automatically synced

# View logs
docker compose logs -f claude-flow-dev

# Run tests
docker compose exec claude-flow-dev npm test

# Debug with browser
# Connect to localhost:9229 in Chrome DevTools
```

#### Production Deployment
```bash
# Deploy to production
docker compose --profile production up -d

# Enable monitoring
docker compose --profile production --profile monitoring up -d

# Scale services
docker compose up -d --scale claude-flow=3

# Update deployment
docker compose pull && docker compose up -d
```

#### CI/CD Integration
```bash
# Build and test in CI pipeline
docker compose --profile testing up --abort-on-container-exit

# Security scanning
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image claude-flow:latest

# Deploy to registry
docker tag claude-flow:latest ghcr.io/g2goose/claude-flow:latest
docker push ghcr.io/g2goose/claude-flow:latest
```

### Security Best Practices

1. **Use specific image tags** instead of `latest` in production
2. **Scan images regularly** for vulnerabilities
3. **Use minimal base images** (Alpine Linux)
4. **Run containers as non-root** users
5. **Limit container resources** with memory and CPU constraints
6. **Use Docker secrets** for sensitive data
7. **Enable security scanning** in your CI/CD pipeline
8. **Keep Docker updated** to the latest stable version

### Performance Tips

1. **Use multi-stage builds** to reduce image size
2. **Enable BuildKit** for faster builds
3. **Use .dockerignore** to exclude unnecessary files
4. **Cache dependencies** in separate layers
5. **Use bind mounts** for development
6. **Enable resource limits** for production
7. **Monitor container metrics** with Prometheus
8. **Use health checks** for better orchestration

### Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| `docker: command not found` | Install Docker Desktop or Docker Engine |
| `Cannot connect to Docker daemon` | Start Docker service/Docker Desktop |
| `Permission denied` | Add user to docker group (Linux) |
| `Port already in use` | Change ports in .env file |
| `Build fails` | Check Dockerfile syntax, clear build cache |
| `Container won't start` | Check logs with `docker compose logs` |
| `No space left on device` | Clean up with `docker system prune` |
| `WSL2 issues` | Update WSL2 kernel, restart Docker Desktop |

---

## 🎯 Quick Start Summary

1. **Install Docker** for your platform
2. **Clone the repository**: `git clone https://github.com/g2goose/claude-flow.git`
3. **Run setup script**: `./scripts/setup-docker-env.sh` (Linux/macOS) or `.\scripts\setup-docker-env.ps1` (Windows)
4. **Configure environment**: Edit `.env` file with your `GITHUB_TOKEN`
5. **Start services**: `docker compose up -d`
6. **Access Claude Flow**: Open http://localhost:3000
7. **Validate setup**: `./scripts/validate-docker-setup.sh`

**Need help?** Check the [troubleshooting section](#troubleshooting) or open an issue on [GitHub](https://github.com/g2goose/claude-flow/issues).

---

**Happy coding with Claude Flow! 🚀**
