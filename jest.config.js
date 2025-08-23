export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.ts',
    '<rootDir>/tests/**/*.spec.js',
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.test.js',
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/src/**/*.spec.js'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/bin/',
    '<rootDir>/tests/.*\\.broken$',
    '<rootDir>/src/verification/tests/mocks/false-reporting-scenarios.test.ts',
    '<rootDir>/src/verification/tests/performance/verification-overhead.test.ts',
    '<rootDir>/tests/unit/coordination/coordination-system.test.ts',
    '<rootDir>/tests/unit/core/orchestrator.test.ts',
    '<rootDir>/tests/unit/memory/memory-backends.test.ts'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'es2022',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        target: 'es2022'
      }
    }],
    '^.+\\.js$': ['babel-jest', {
      presets: [['@babel/preset-env', { modules: false }]]
    }]
  },
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^../../../test\\.utils$': '<rootDir>/tests/test.utils.ts',
    '^../../test\\.utils$': '<rootDir>/tests/test.utils.ts',
    '^../test\\.utils$': '<rootDir>/tests/test.utils.ts',
    '^../../integration/(.*)\\.(js|ts)$': '<rootDir>/src/integration/$1.ts',
    '^../../core/(.*)\\.(js|ts)$': '<rootDir>/src/core/$1.ts',
    '^../../config/(.*)\\.(js|ts)$': '<rootDir>/src/config/$1.ts',
    '^../../memory/(.*)\\.(js|ts)$': '<rootDir>/src/memory/$1.ts',
    '^../../agents/(.*)\\.(js|ts)$': '<rootDir>/src/agents/$1.ts',
    '^../../coordination/(.*)\\.(js|ts)$': '<rootDir>/src/coordination/$1.ts',
    '^../../task/(.*)\\.(js|ts)$': '<rootDir>/src/task/$1.ts',
    '^../../monitoring/(.*)\\.(js|ts)$': '<rootDir>/src/monitoring/$1.ts',
    '^../../mcp/(.*)\\.(js|ts)$': '<rootDir>/src/mcp/$1.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/bin/',
    '<rootDir>/node_modules/'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(chalk|ora|inquirer|nanoid|fs-extra|ansi-styles|ruv-swarm|@modelcontextprotocol)/)'
  ],
  resolver: undefined,
  collectCoverageFrom: [
    'src/**/*.ts',
    'src/**/*.js',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.test.js',
    '!src/**/*.spec.ts',
    '!src/**/*.spec.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 30000,
  verbose: true,
  // Enhanced error handling
  errorOnDeprecated: false,
  // Better module resolution
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  // Remove deprecated globals configuration
  // ts-jest configuration moved to transform options above
};