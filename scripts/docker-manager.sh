#!/bin/bash

# Claude Flow Docker Management Script
# Comprehensive Docker operations for Claude Flow

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="claude-flow"
REGISTRY="ghcr.io"
IMAGE_NAME="${REGISTRY}/g2goose/claude-flow"
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Helper functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Build images
build_images() {
    local target=${1:-production}
    local platform=${2:-linux/amd64}
    
    log "Building Docker images for target: ${target}, platform: ${platform}"
    
    docker buildx build \
        --target "${target}" \
        --platform "${platform}" \
        --tag "${IMAGE_NAME}:latest-${target}" \
        --tag "${IMAGE_NAME}:$(date +%Y%m%d)-${target}" \
        --cache-from type=local,src=/tmp/.buildx-cache \
        --cache-to type=local,dest=/tmp/.buildx-cache \
        --load \
        .
    
    success "Built image: ${IMAGE_NAME}:latest-${target}"
}

# Build all targets
build_all() {
    log "Building all Docker image targets..."
    
    for target in production development testing; do
        build_images "${target}" "linux/amd64"
    done
    
    success "All images built successfully"
}

# Run development environment
dev() {
    log "Starting development environment..."
    
    docker-compose --profile development up -d --build
    
    log "Development environment started. Services:"
    docker-compose ps
    
    log "Logs can be viewed with: docker-compose logs -f"
    log "Access the application at: http://localhost:3000"
}

# Run testing environment
test() {
    log "Starting testing environment..."
    
    # Build test image
    build_images "testing"
    
    # Run tests
    docker-compose --profile testing up --build --abort-on-container-exit
    
    # Collect results
    docker-compose cp claude-flow-test:/app/test-results ./test-results 2>/dev/null || true
    docker-compose cp claude-flow-test:/app/coverage ./coverage 2>/dev/null || true
    
    success "Tests completed. Results available in ./test-results and ./coverage"
}

# Run production environment
prod() {
    log "Starting production environment..."
    
    # Build production image
    build_images "production"
    
    # Start production services
    docker-compose --profile production up -d --build
    
    log "Production environment started. Services:"
    docker-compose --profile production ps
    
    log "Health check: curl http://localhost:3000/health"
}

# Security scan
security_scan() {
    local image=${1:-"${IMAGE_NAME}:latest-production"}
    
    log "Running security scan on ${image}..."
    
    # Trivy scan
    if command -v trivy &> /dev/null; then
        trivy image --severity HIGH,CRITICAL "${image}"
    else
        warning "Trivy not installed. Skipping vulnerability scan."
    fi
    
    # Check for secrets
    if command -v gitleaks &> /dev/null; then
        gitleaks detect --source . --verbose
    else
        warning "Gitleaks not installed. Skipping secret scan."
    fi
}

# Clean up
cleanup() {
    log "Cleaning up Docker resources..."
    
    # Stop all containers
    docker-compose down -v --remove-orphans 2>/dev/null || true
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    # Remove unused networks
    docker network prune -f
    
    success "Cleanup completed"
}

# Push to registry
push() {
    local tag=${1:-latest}
    
    log "Pushing images to registry..."
    
    # Login to registry (assumes credentials are set)
    # Validate registry password
    if [[ -z "${REGISTRY_PASSWORD:-}" ]]; then
        error "REGISTRY_PASSWORD is not set. Aborting push."
        return 1
    fi
    
    # Login to registry (assumes credentials are set)
    echo "${REGISTRY_PASSWORD}" | docker login "${REGISTRY}" --username "${REGISTRY_USERNAME:-$(whoami)}" --password-stdin
    
    # Push all targets
    for target in production development testing; do
        docker push "${IMAGE_NAME}:${tag}-${target}"
    done
    
    success "Images pushed to ${REGISTRY}"
}

# Health check
health() {
    log "Performing health check..."
    
    local services=("claude-flow:3000" "mcp-server:3001" "redis:6379")
    
    for service in "${services[@]}"; do
        IFS=':' read -r name port <<< "${service}"
        
        if curl -f "http://localhost:${port}/health" >/dev/null 2>&1; then
            success "${name} is healthy"
        else
    # Service definitions: name:port:type
    local services=("claude-flow:3000:http" "mcp-server:3001:http" "redis:6379:redis")
    
    for service in "${services[@]}"; do
        IFS=':' read -r name port type <<< "${service}"
        
        if [[ "$type" == "http" ]]; then
            if curl -f "http://localhost:${port}/health" >/dev/null 2>&1; then
                success "${name} is healthy"
            else
                error "${name} is not responding"
            fi
        elif [[ "$type" == "redis" ]]; then
            if command -v redis-cli >/dev/null 2>&1; then
                if redis-cli -p "${port}" ping | grep -q PONG; then
                    success "${name} is healthy"
                else
                    error "${name} is not responding"
                fi
            else
                error "redis-cli not found; cannot check Redis health"
            fi
        else
            error "Unknown service type for ${name}"
        fi
    done
}

# Monitoring
monitoring() {
    log "Starting monitoring stack..."
    
    docker-compose --profile monitoring up -d --build
    
    log "Monitoring services started:"
    log "- Prometheus: http://localhost:9090"
    log "- Grafana: http://localhost:3001 (admin/admin)"
    
    docker-compose --profile monitoring ps
}

# Logs
logs() {
    local service=${1:-}
    
    if [[ -n "${service}" ]]; then
        docker-compose logs -f "${service}"
    else
        docker-compose logs -f
    fi
}

# Status
status() {
    log "Docker Compose services status:"
    docker-compose ps
    
    log "\nDocker images:"
    docker images | grep "${PROJECT_NAME}" || echo "No Claude Flow images found"
    
    log "\nDocker volumes:"
    docker volume ls | grep "${PROJECT_NAME}" || echo "No Claude Flow volumes found"
}

# Help
show_help() {
    cat << EOF
Claude Flow Docker Management Script

Usage: $0 [COMMAND] [OPTIONS]

Commands:
    build [target] [platform]  Build Docker images (default: production, linux/amd64)
    build-all                  Build all image targets
    dev                        Start development environment
    test                       Run tests in Docker
    prod                       Start production environment
    monitoring                 Start monitoring stack (Prometheus + Grafana)
    security-scan [image]      Run security scans
    push [tag]                 Push images to registry
    health                     Check service health
    logs [service]             Show logs
    status                     Show status of all resources
    cleanup                    Clean up Docker resources
    help                       Show this help message

Examples:
    $0 build production linux/arm64
    $0 dev
    $0 test
    $0 prod
    $0 monitoring
    $0 security-scan
    $0 cleanup

Environment Variables:
    REGISTRY_USERNAME          Registry username (default: current user)
    REGISTRY_PASSWORD          Registry password
    LOG_LEVEL                  Log level (debug, info, warn, error)
    
EOF
}

# Main script
main() {
    check_prerequisites
    
    case "${1:-help}" in
        build)
            build_images "${2:-production}" "${3:-linux/amd64}"
            ;;
        build-all)
            build_all
            ;;
        dev)
            dev
            ;;
        test)
            test
            ;;
        prod)
            prod
            ;;
        monitoring)
            monitoring
            ;;
        security-scan)
            security_scan "${2:-}"
            ;;
        push)
            push "${2:-latest}"
            ;;
        health)
            health
            ;;
        logs)
            logs "${2:-}"
            ;;
        status)
            status
            ;;
        cleanup)
            cleanup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"