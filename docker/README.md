# Docker Directory

This directory contains Docker configurations, containerization assets, and deployment scripts for the Claude Flow platform. It provides comprehensive Docker support for development, testing, and production deployments.

## Table of Contents

1. [Container Images](#container-images) (2 dockerfiles)
2. [Orchestration](#orchestration) (1 compose file)
3. [Monitoring](#monitoring) (1 system)
4. [Testing](#testing) (2 components)
5. [Web Server](#web-server) (1 configuration)
6. [Quick Reference](#quick-reference)

---

## Container Images

### Dockerfile.hive-mind
**Specialized container for hive-mind coordination**
- Optimized for multi-agent coordination workloads
- Includes all 87 MCP tools pre-configured
- Neural pattern recognition capabilities
- SQLite memory system with persistence volumes
- Auto-scaling and resource management

**Usage:**
```bash
# Build hive-mind container
docker build -f docker/Dockerfile.hive-mind -t claude-flow:hive-mind .

# Run with volume persistence
docker run -v $(pwd)/.hive-mind:/app/.hive-mind claude-flow:hive-mind
```

**Features:**
- Queen-led coordination architecture
- Distributed memory system
- Fault tolerance and auto-recovery
- Performance monitoring and optimization

### Dockerfile.test
**Testing and validation container**
- Complete testing environment setup
- All development dependencies included
- Automated test execution capabilities
- Code coverage and quality analysis tools

**Usage:**
```bash
# Build test container
docker build -f docker/Dockerfile.test -t claude-flow:test .

# Run test suite
docker run --rm claude-flow:test npm test
```

**Features:**
- Jest testing framework
- ESLint code quality checks
- Coverage reporting
- Integration test support

---

## Orchestration

### docker-compose.hive-mind.yml
**Multi-container hive-mind deployment**
- Complete hive-mind system orchestration
- Redis for distributed coordination
- PostgreSQL for persistent storage
- Nginx for load balancing and routing
- Monitoring and logging integration

**Services:**
- **queen**: Main coordination service
- **workers**: Scalable worker agent instances
- **memory**: Distributed memory service
- **monitor**: Performance monitoring
- **proxy**: Load balancer and API gateway

**Usage:**
```bash
# Deploy complete hive-mind system
docker-compose -f docker/docker-compose.hive-mind.yml up -d

# Scale worker agents
docker-compose -f docker/docker-compose.hive-mind.yml up -d --scale workers=5

# View logs
docker-compose -f docker/docker-compose.hive-mind.yml logs -f
```

**Features:**
- Auto-scaling based on workload
- Health checks and auto-restart
- Volume persistence for data
- Network isolation and security

---

## Monitoring

### monitoring/
**Container monitoring and observability**
- Prometheus metrics collection
- Grafana dashboards and visualization
- Alert manager for notifications
- Log aggregation and analysis

**Components:**
- **prometheus.yml**: Metrics collection configuration
- **grafana/**: Dashboard definitions and data sources
- **alertmanager/**: Alert rules and notification settings
- **exporters/**: Custom metric exporters

**Usage:**
```bash
# Deploy monitoring stack
cd docker/monitoring
docker-compose up -d

# Access Grafana dashboard
open http://localhost:3000
```

**Dashboards:**
- Agent performance metrics
- Memory usage and optimization
- Task execution statistics
- System health and alerts

---

## Testing

### docker-test/
**Containerized testing infrastructure**
- Isolated test environments
- Database fixtures and test data
- Mock services and dependencies
- Automated CI/CD pipeline integration

**Test Types:**
- **Unit Tests**: Individual component testing
- **Integration Tests**: Service interaction testing
- **End-to-End Tests**: Complete workflow validation
- **Performance Tests**: Load and stress testing

### run-tests.sh
**Test execution orchestration script**
- Automated test environment setup
- Test suite execution and reporting
- Cleanup and resource management
- CI/CD integration hooks

**Usage:**
```bash
# Run all test suites
cd docker
./run-tests.sh

# Run specific test category
./run-tests.sh --type integration

# Run with coverage
./run-tests.sh --coverage
```

**Features:**
- Parallel test execution
- Test result aggregation
- Coverage reporting
- Failure notifications

---

## Web Server

### nginx/
**Production web server configuration**
- High-performance static asset serving
- API proxy and load balancing
- SSL/TLS termination
- Caching and compression optimization

**Configuration Files:**
- **nginx.conf**: Main server configuration
- **sites/**: Virtual host configurations
- **ssl/**: SSL certificate management
- **cache/**: Caching rules and policies

**Features:**
- Rate limiting and DDoS protection
- Health check endpoints
- Log rotation and monitoring
- Security headers and CORS

---

## Quick Reference

### Docker Commands
```bash
# Build all images
docker build -f docker/Dockerfile.hive-mind -t claude-flow:hive-mind .
docker build -f docker/Dockerfile.test -t claude-flow:test .

# Run development environment
docker-compose -f docker/docker-compose.hive-mind.yml up -d

# Execute tests
docker run --rm claude-flow:test npm test

# View container logs
docker logs claude-flow-queen

# Scale workers
docker-compose -f docker/docker-compose.hive-mind.yml up -d --scale workers=3
```

### Environment Variables
```bash
# Production deployment
CLAUDE_FLOW_ENV=production
HIVE_MIND_WORKERS=5
MEMORY_PERSISTENCE=true
MONITORING_ENABLED=true

# Development setup
CLAUDE_FLOW_ENV=development
DEBUG_MODE=true
AUTO_RESTART=true
```

### Volume Mounts
- **Config**: `/app/config` - Configuration files
- **Data**: `/app/data` - Database and persistence
- **Logs**: `/app/logs` - Application logs
- **Memory**: `/app/.hive-mind` - Hive-mind state

### Health Checks
- **Queen Agent**: `http://localhost:8080/health`
- **Worker Agents**: `http://localhost:8081/health`
- **Memory Service**: `http://localhost:8082/health`
- **Monitor**: `http://localhost:9090/metrics`

### Troubleshooting
- **Container won't start**: Check environment variables and volume permissions
- **Memory persistence issues**: Verify volume mounts and SQLite compatibility
- **Network connectivity**: Ensure Docker network configuration
- **Performance problems**: Monitor resource usage and scaling settings

---

*Last Updated: ${new Date().toISOString()}*

This Docker directory provides comprehensive containerization support for Claude Flow, enabling scalable deployments from development to production environments.