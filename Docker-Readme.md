# 🐳 Claude Flow Docker Setup Guide

This guide provides comprehensive instructions for setting up and working with Claude Flow using Docker on both Linux and Windows platforms.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Linux Instructions](#linux-instructions)
- [Windows Instructions](#windows-instructions)
- [Docker Commands Reference](#docker-commands-reference)
- [Troubleshooting](#troubleshooting)
- [Advanced Usage](#advanced-usage)

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
  ]
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
```

## 🪟 Windows Instructions

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
# Set SELinux to permissive
sudo setenforce 0

# Or configure SELinux for Docker
sudo setsebool -P container_manage_cgroup 1
```

**Firewall Issues:**
```bash
# Allow Docker through firewall (Ubuntu)
sudo ufw allow 2376/tcp
sudo ufw allow 7946/tcp
sudo ufw allow 7946/udp
sudo ufw allow 4789/udp
```

#### Windows-Specific

**Hyper-V Conflicts:**
```powershell
# Disable Hyper-V if using VirtualBox
bcdedit /set hypervisorlaunchtype off
# Restart computer
```

**WSL2 Issues:**
```powershell
# Update WSL2 kernel
wsl --update

# Set WSL2 as default
wsl --set-default-version 2

# Convert existing distro to WSL2
wsl --set-version Ubuntu-20.04 2
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

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Claude Flow Architecture](./docs/ARCHITECTURE.md)
- [Docker Strategy](./docs/DOCKER_STRATEGY.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

---

**Need help?** Open an issue on [GitHub](https://github.com/g2goose/claude-flow/issues) or check our [documentation](./docs/).
