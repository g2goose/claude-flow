#!/bin/bash

# Claude Flow Docker Environment Setup Script
# This script helps users set up their Docker environment for Claude Flow

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Docker installation
check_docker() {
    log "Checking Docker installation..."
    
    if ! command_exists docker; then
        error "Docker is not installed or not in PATH"
        echo "Please install Docker first:"
        echo "  Linux: https://docs.docker.com/engine/install/"
        echo "  macOS: https://docs.docker.com/desktop/mac/install/"
        echo "  Windows: https://docs.docker.com/desktop/windows/install/"
        exit 1
    fi
    
    if ! docker compose version >/dev/null 2>&1; then
        error "Docker Compose is not available"
        echo "Please install Docker Compose or use Docker Desktop"
        exit 1
    fi
    
    # Test Docker connectivity
    if ! docker info >/dev/null 2>&1; then
        error "Cannot connect to Docker daemon"
        echo "Please ensure Docker is running and you have proper permissions"
        exit 1
    fi
    
    success "Docker is properly installed and running"
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    local os=$(detect_os)
    log "Detected OS: $os"
    
    # Check available memory
    case $os in
        "linux")
            local mem_kb=$(grep MemTotal /proc/meminfo | awk '{print $2}')
            local mem_gb=$((mem_kb / 1024 / 1024))
            ;;
        "macos")
            local mem_bytes=$(sysctl hw.memsize | awk '{print $2}')
            local mem_gb=$((mem_bytes / 1024 / 1024 / 1024))
            ;;
        *)
            local mem_gb=0
            ;;
    esac
    
    if [[ $mem_gb -lt 4 ]]; then
        warning "System has ${mem_gb}GB RAM. Minimum 4GB recommended for Claude Flow"
    else
        success "System memory: ${mem_gb}GB (sufficient)"
    fi
    
    # Check available disk space
    local available_gb=$(df . | tail -1 | awk '{print int($4/1024/1024)}')
    if [[ $available_gb -lt 2 ]]; then
        warning "Available disk space: ${available_gb}GB. Minimum 2GB required"
    else
        success "Available disk space: ${available_gb}GB (sufficient)"
    fi
}

# Setup environment file
setup_env() {
    log "Setting up environment file..."
    
    if [[ -f .env ]]; then
        warning ".env file already exists. Creating backup..."
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    if [[ ! -f .env.example ]]; then
        error ".env.example not found. Please run this script from the Claude Flow root directory"
        exit 1
    fi
    
    cp .env.example .env
    success "Created .env file from template"
    
    echo
    warning "IMPORTANT: Please edit the .env file and set your GITHUB_TOKEN"
    echo "You can edit it with: nano .env"
    echo "Or: code .env (if using VS Code)"
    echo
}

# Test Docker Compose configuration
test_config() {
    log "Testing Docker Compose configuration..."
    
    if ! docker compose config >/dev/null 2>&1; then
        error "Docker Compose configuration is invalid"
        echo "Please check your docker-compose.yml and .env files"
        exit 1
    fi
    
    success "Docker Compose configuration is valid"
}

# Create useful directories
create_directories() {
    log "Creating necessary directories..."
    
    mkdir -p data logs workspace backups
    
    # Set proper permissions on Linux/macOS
    if [[ "$(detect_os)" != "windows" ]]; then
        chmod 755 data logs workspace backups
    fi
    
    success "Created directory structure"
}

# Display next steps
show_next_steps() {
    echo
    success "Docker environment setup complete!"
    echo
    echo "Next steps:"
    echo "1. Edit .env file and set your GITHUB_TOKEN:"
    echo "   nano .env"
    echo
    echo "2. Start Claude Flow:"
    echo "   docker compose up -d                    # Production"
    echo "   docker compose --profile development up -d   # Development"
    echo
    echo "3. Check status:"
    echo "   docker compose ps"
    echo
    echo "4. View logs:"
    echo "   docker compose logs -f claude-flow"
    echo
    echo "5. Access Claude Flow:"
    echo "   http://localhost:3000"
    echo
    echo "For more help, see: ./Docker-Readme.md"
}

# Main function
main() {
    echo "Claude Flow Docker Environment Setup"
    echo "===================================="
    echo
    
    check_docker
    check_requirements
    setup_env
    test_config
    create_directories
    show_next_steps
}

# Run main function
main "$@"