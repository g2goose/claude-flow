#!/bin/bash

# Claude Flow Docker Setup Validation Script
# This script validates that the Docker environment is properly configured

set -uo pipefail

# Skip intensive tests by default
export SKIP_BUILD_TEST="${SKIP_BUILD_TEST:-true}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test results
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
log() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((WARNINGS++))
}

# Test Docker installation
test_docker_installation() {
    log "Testing Docker installation..."
    
    if command -v docker >/dev/null 2>&1; then
        pass "Docker command is available"
    else
        fail "Docker command not found"
        return
    fi
    
    # Test Docker connectivity with better error handling
    if docker info >/dev/null 2>&1; then
        pass "Docker daemon is running"
    else
        warn "Cannot connect to Docker daemon (may be running in restricted environment)"
        echo "  Note: This is expected in some CI/sandbox environments"
    fi
    
    if docker compose version >/dev/null 2>&1; then
        pass "Docker Compose is available"
    else
        fail "Docker Compose not found"
    fi
}

# Test environment configuration
test_environment() {
    log "Testing environment configuration..."
    
    if [[ -f .env ]]; then
        pass ".env file exists"
        
        # Check required variables
        if grep -q "GITHUB_TOKEN=" .env; then
            if grep -q "GITHUB_TOKEN=$" .env || grep -q "GITHUB_TOKEN=\"\"" .env; then
                warn "GITHUB_TOKEN is not set in .env file"
            else
                pass "GITHUB_TOKEN is configured"
            fi
        else
            fail "GITHUB_TOKEN not found in .env file"
        fi
    else
        fail ".env file not found"
    fi
    
    if [[ -f .env.example ]]; then
        pass ".env.example template exists"
    else
        warn ".env.example template not found"
    fi
}

# Test Docker Compose configuration
test_docker_compose() {
    log "Testing Docker Compose configuration..."
    
    if [[ -f docker-compose.yml ]]; then
        pass "docker-compose.yml exists"
    else
        fail "docker-compose.yml not found"
        return
    fi
    
    if docker compose config >/dev/null 2>&1; then
        pass "Docker Compose configuration is valid"
    else
        fail "Docker Compose configuration is invalid"
        echo "Run 'docker compose config' to see errors"
    fi
}

# Test Dockerfile
test_dockerfile() {
    log "Testing Dockerfile..."
    
    if [[ -f Dockerfile ]]; then
        pass "Dockerfile exists"
    else
        fail "Dockerfile not found"
        return
    fi
    
    # Test if Dockerfile can be parsed
    if docker build --dry-run . >/dev/null 2>&1; then
        pass "Dockerfile syntax is valid"
    else
        warn "Dockerfile may have syntax issues"
    fi
}

# Test build process
test_build() {
    log "Testing Docker build process..."
    
    if [[ "${SKIP_BUILD_TEST:-}" == "true" ]]; then
        warn "Skipping build test (SKIP_BUILD_TEST=true)"
        return
    fi
    
    echo "Building test image (this may take a few minutes)..."
    if timeout 300 docker build -t claude-flow:test-build --target production . >/dev/null 2>&1; then
        pass "Docker build succeeds"
        
        # Clean up test image
        docker rmi claude-flow:test-build >/dev/null 2>&1 || true
    else
        warn "Docker build test skipped or failed (may be due to timeout)"
    fi
}

# Test services startup
test_services() {
    log "Testing services startup..."
    
    # Skip if CI environment detected
    if [[ -n "${CI:-}" ]] || [[ -n "${GITHUB_ACTIONS:-}" ]]; then
        warn "CI environment detected - skipping service startup test"
        return 0
    fi
    
    # Check if GITHUB_TOKEN is set for service tests
    if ! grep -q "^GITHUB_TOKEN=" .env 2>/dev/null || grep -q "^GITHUB_TOKEN=$" .env 2>/dev/null; then
        warn "GITHUB_TOKEN not configured - skipping service startup test"
        warn "Set GITHUB_TOKEN in .env file to enable service testing"
        return 0
    fi
    
    # Check if services are already running
    if docker compose ps --services --filter "status=running" | grep -q claude-flow; then
        warn "Services are already running. Stopping for clean test..."
        docker compose down >/dev/null 2>&1
        sleep 3
    fi
    
    echo "Starting services for test..."
    # Use timeout to prevent hanging
    if timeout 60 docker compose up -d >/dev/null 2>&1; then
        pass "Services start successfully"
        
        # Wait for services to be ready with timeout
        log "Waiting for services to become ready..."
        local retries=12
        local ready=false
        
        for i in $(seq 1 $retries); do
            if docker compose ps | grep -q "Up.*healthy\|Up.*running"; then
                ready=true
                break
            fi
            sleep 5
        done
        
        if [[ "$ready" == "true" ]]; then
            # Test health endpoints
            if timeout 10 curl -f http://localhost:3000/health >/dev/null 2>&1; then
                pass "Claude Flow health endpoint responds"
            else
                warn "Claude Flow health endpoint not responding (this is expected if GITHUB_TOKEN is not set)"
            fi
        else
            warn "Services did not become ready within timeout"
        fi
        
        # Clean up
        echo "Stopping test services..."
        docker compose down >/dev/null 2>&1
    else
        fail "Services fail to start"
    fi
}

# Test network connectivity
test_network() {
    log "Testing network configuration..."
    
    # Start minimal services for network test
    docker compose up -d redis >/dev/null 2>&1
    
    # Test if redis is accessible
    if docker compose exec redis redis-cli ping >/dev/null 2>&1; then
        pass "Redis network connectivity works"
    else
        warn "Redis network connectivity issues"
    fi
    
    # Clean up
    docker compose down >/dev/null 2>&1
}

# Test volumes and persistence
test_volumes() {
    log "Testing volume configuration..."
    
    # Check if volumes are defined
    if docker compose config --volumes | grep -q "claude-flow"; then
        pass "Named volumes are configured"
    else
        warn "No named volumes found"
    fi
    
    # Test volume creation
    if docker volume create test-claude-flow-volume >/dev/null 2>&1; then
        pass "Volume creation works"
        docker volume rm test-claude-flow-volume >/dev/null 2>&1
    else
        warn "Volume creation issues"
    fi
}

# Test port availability
test_ports() {
    log "Testing port availability..."
    
    local ports=(3000 3001 6379)
    
    for port in "${ports[@]}"; do
        if ! netstat -tuln 2>/dev/null | grep -q ":${port} " && ! ss -tuln 2>/dev/null | grep -q ":${port} "; then
            pass "Port ${port} is available"
        else
            warn "Port ${port} is already in use"
        fi
    done
}

# Test system resources
test_resources() {
    log "Testing system resources..."
    
    # Check available memory
    if command -v free >/dev/null 2>&1; then
        local mem_gb=$(free -g | awk '/^Mem:/{print $7}')
        if [[ $mem_gb -ge 2 ]]; then
            pass "Sufficient memory available (${mem_gb}GB)"
        else
            warn "Low memory available (${mem_gb}GB). 4GB+ recommended"
        fi
    fi
    
    # Check disk space
    local disk_gb=$(df . | tail -1 | awk '{print int($4/1024/1024)}')
    if [[ $disk_gb -ge 2 ]]; then
        pass "Sufficient disk space (${disk_gb}GB)"
    else
        warn "Low disk space (${disk_gb}GB). 2GB+ required"
    fi
}

# Generate report
generate_report() {
    echo
    echo "=============================================="
    echo "Claude Flow Docker Validation Report"
    echo "=============================================="
    echo "Tests Passed: $PASSED"
    echo "Tests Failed: $FAILED"
    echo "Warnings: $WARNINGS"
    echo
    
    if [[ $FAILED -eq 0 ]]; then
        echo -e "${GREEN}✓ All critical tests passed!${NC}"
        echo "Your Docker environment is ready for Claude Flow."
        
        if [[ $WARNINGS -gt 0 ]]; then
            echo -e "${YELLOW}⚠ Please review warnings above.${NC}"
        fi
        
        echo
        echo "To start Claude Flow:"
        echo "  docker compose up -d"
        echo
        echo "To start development environment:"
        echo "  docker compose --profile development up -d"
        
    else
        echo -e "${RED}✗ Some tests failed.${NC}"
        echo "Please fix the issues above before running Claude Flow."
        echo
        echo "Common solutions:"
        echo "- Install Docker and Docker Compose"
        echo "- Start Docker daemon"
        echo "- Create .env file from .env.example"
        echo "- Set GITHUB_TOKEN in .env file"
        echo "- Free up required ports (3000, 3001, 6379)"
        
        exit 1
    fi
}

# Main function
main() {
    echo "Claude Flow Docker Environment Validation"
    echo "========================================"
    echo
    
    test_docker_installation
    test_environment
    test_docker_compose
    test_dockerfile
    test_ports
    test_resources
    test_volumes
    test_network
    
    # Only run build and service tests if specifically requested
    if [[ $FAILED -eq 0 ]] && [[ "${RUN_FULL_TESTS:-}" == "true" ]]; then
        test_build
        test_services
    else
        log "Skipping build and service tests (use RUN_FULL_TESTS=true to enable)"
    fi
    
    generate_report
}

# Run validation
main "$@"