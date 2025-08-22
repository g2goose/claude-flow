# Tests Directory

This directory contains the comprehensive test suite for Claude Flow's AI orchestration platform. It includes unit tests, integration tests, performance benchmarks, and specialized testing utilities to ensure system reliability and performance.

## Table of Contents

1. [Test Architecture](#test-architecture) (4 test types)
2. [Test Categories](#test-categories) (8 categories)
3. [Test Execution](#test-execution)
4. [Test Utilities](#test-utilities)
5. [Performance Testing](#performance-testing)
6. [Quick Reference](#quick-reference)

---

## Test Architecture

### Testing Framework
- **Jest**: Primary testing framework for JavaScript/TypeScript
- **Supertest**: API endpoint testing and HTTP assertions
- **Puppeteer**: End-to-end testing and browser automation
- **Benchmark.js**: Performance testing and benchmarking

### Test Types
1. **Unit Tests**: Individual component and function testing
2. **Integration Tests**: Service interaction and workflow testing
3. **End-to-End Tests**: Complete user journey and system testing
4. **Performance Tests**: Load testing, stress testing, and benchmarking

### Test Organization
```
tests/
├── unit/              # Unit tests for individual components
├── integration/       # Integration tests for service interactions
├── e2e/              # End-to-end tests for complete workflows
├── performance/      # Performance and load testing
├── fixtures/         # Test data and mock configurations
├── mocks/            # Mock implementations and test doubles
├── utils/            # Testing utilities and helper functions
└── config/           # Test configuration and setup files
```

---

## Test Categories

### Unit Tests (`unit/`)
**Component-level testing for individual modules**
- Function and class testing
- Isolated component behavior validation
- Mock dependencies and external services
- Code coverage and edge case testing

**Test Structure:**
```
unit/
├── core/             # Core orchestration engine tests
├── agents/           # Agent behavior and lifecycle tests
├── memory/           # Memory system component tests
├── coordination/     # Coordination logic tests
├── cli/              # CLI command and argument tests
├── api/              # API endpoint and middleware tests
├── neural/           # Neural pattern recognition tests
└── utils/            # Utility function tests
```

**Example Test:**
```javascript
describe('Agent Coordination', () => {
  test('should spawn agent with correct configuration', async () => {
    const config = { type: 'coder', specialization: 'frontend' };
    const agent = await coordinator.spawnAgent(config);
    
    expect(agent.type).toBe('coder');
    expect(agent.specialization).toBe('frontend');
    expect(agent.status).toBe('active');
  });
});
```

### Integration Tests (`integration/`)
**Service interaction and workflow testing**
- Multi-component interaction testing
- Database integration and data flow
- External service integration validation
- Workflow orchestration testing

**Test Categories:**
```
integration/
├── workflows/        # Complete workflow execution tests
├── api-endpoints/    # API integration and routing tests
├── database/         # Database operations and migrations
├── memory-system/    # Memory persistence and retrieval
├── agent-coordination/ # Multi-agent coordination tests
├── github-integration/ # GitHub service integration
└── mcp-tools/        # MCP tool integration tests
```

### End-to-End Tests (`e2e/`)
**Complete user journey and system testing**
- Full application workflow testing
- User interface interaction testing
- Cross-browser compatibility testing
- Production environment simulation

**Test Scenarios:**
```
e2e/
├── user-workflows/   # Complete user journey tests
├── cli-commands/     # CLI command execution tests
├── web-interface/    # Web UI interaction tests
├── api-usage/        # API usage pattern tests
└── deployment/       # Deployment and configuration tests
```

### Performance Tests (`performance/`)
**Load testing, stress testing, and benchmarking**
- System performance under load
- Resource utilization and optimization
- Scalability and bottleneck identification
- Memory leak and performance regression testing

**Performance Categories:**
```
performance/
├── load/             # Load testing and capacity planning
├── stress/           # Stress testing and failure points
├── benchmark/        # Performance benchmarking
├── memory/           # Memory usage and leak testing
└── coordination/     # Agent coordination performance
```

### Test Fixtures (`fixtures/`)
**Test data and mock configurations**
- Sample data for testing scenarios
- Configuration templates and examples
- Mock agent definitions and behaviors
- Test database schemas and seed data

### Test Mocks (`mocks/`)
**Mock implementations and test doubles**
- External service mocks and stubs
- Database connection mocks
- Agent behavior simulations
- API response mocks

### Test Utils (`utils/`)
**Testing utilities and helper functions**
- Test setup and teardown utilities
- Common assertion helpers
- Test data generation functions
- Mock factory implementations

### Test Config (`config/`)
**Test configuration and setup files**
- Jest configuration and settings
- Test environment configurations
- Database test configurations
- CI/CD pipeline test settings

---

## Test Execution

### Running Tests
```bash
# Run all tests
npm test

# Run specific test category
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:performance

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- tests/unit/core/orchestrator.test.js
```

### Test Scripts
```bash
# Parallel test execution
npm run test:parallel

# Continuous integration tests
npm run test:ci

# Performance benchmarks
npm run benchmark

# Test with debugging
npm run test:debug
```

### Test Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

---

## Test Utilities

### Common Test Utilities
```javascript
// Test agent factory
const createTestAgent = (config = {}) => ({
  id: 'test-agent-' + Date.now(),
  type: 'test',
  status: 'active',
  ...config
});

// Mock memory system
const mockMemory = {
  store: jest.fn(),
  get: jest.fn(),
  query: jest.fn(),
  delete: jest.fn()
};

// Test database setup
const setupTestDB = async () => {
  const db = new Database(':memory:');
  await db.migrate();
  return db;
};
```

### Test Data Generators
```javascript
// Generate test coordination data
const generateCoordinationData = (agentCount = 3) => ({
  sessionId: uuid(),
  agents: Array(agentCount).fill().map((_, i) => 
    createTestAgent({ id: `agent-${i}` })
  ),
  tasks: generateTestTasks(),
  coordination: generateCoordinationPatterns()
});
```

---

## Performance Testing

### Benchmark Suites
```javascript
// Agent coordination performance
suite('Agent Coordination', () => {
  benchmark('spawn 10 agents', async () => {
    await coordinator.spawnAgents(10);
  });
  
  benchmark('coordinate 100 tasks', async () => {
    await coordinator.executeTasks(generateTasks(100));
  });
});
```

### Load Testing
```bash
# HTTP load testing
npx artillery run tests/performance/load/api-load-test.yml

# Memory system load testing
npm run test:performance -- --grep "memory load"

# Coordination system stress testing
npm run test:stress -- --agents 50 --tasks 1000
```

### Performance Monitoring
```javascript
// Performance measurement utilities
const measurePerformance = async (operation, iterations = 100) => {
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    await operation();
  }
  
  const end = performance.now();
  return {
    totalTime: end - start,
    averageTime: (end - start) / iterations,
    iterations
  };
};
```

---

## Quick Reference

### Test Commands
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific category
npm run test:unit
npm run test:integration
npm run test:e2e

# Run performance tests
npm run test:performance

# Debug mode
npm run test:debug

# Watch mode
npm run test:watch
```

### Test Patterns
```javascript
// Basic test structure
describe('Component Name', () => {
  beforeEach(() => {
    // Setup
  });
  
  test('should do something', () => {
    // Test implementation
  });
  
  afterEach(() => {
    // Cleanup
  });
});

// Async test pattern
test('async operation', async () => {
  const result = await someAsyncOperation();
  expect(result).toBeDefined();
});

// Mock pattern
test('with mocks', () => {
  const mockFn = jest.fn().mockReturnValue('mocked');
  expect(mockFn()).toBe('mocked');
});
```

### Coverage Requirements
- **Statements**: 80% minimum
- **Branches**: 80% minimum
- **Functions**: 80% minimum
- **Lines**: 80% minimum

### Test Environment Variables
- `NODE_ENV=test`: Test environment configuration
- `TEST_DB_PATH`: Test database location
- `TEST_TIMEOUT`: Test execution timeout
- `COVERAGE_THRESHOLD`: Coverage requirement thresholds

### Continuous Integration
```yaml
# GitHub Actions test workflow
- name: Run Tests
  run: |
    npm ci
    npm run test:ci
    npm run test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v1
```

### Best Practices
- **Isolation**: Each test should be independent
- **Descriptive Names**: Use clear, descriptive test names
- **Fast Execution**: Keep tests fast and focused
- **Reliable**: Tests should be deterministic and not flaky
- **Comprehensive**: Cover edge cases and error conditions
- **Maintainable**: Keep tests simple and easy to understand

---

*Last Updated: ${new Date().toISOString()}*

This tests directory provides comprehensive testing capabilities to ensure Claude Flow's reliability, performance, and correctness across all system components.