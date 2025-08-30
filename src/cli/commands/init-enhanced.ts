#!/usr/bin/env node
/**
 * Enhanced Init Command for Claude-Flow
 * 
 * Provides comprehensive project initialization with:
 * - Interactive setup wizard
 * - Advanced error handling and validation
 * - MCP server configuration
 * - Project template customization
 * - Verification and health checks
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { nanoid } from 'nanoid';
import { success, error, warning, info } from '../cli-core.js';
import type { CommandContext } from '../cli-core.js';

interface InitOptions {
  force?: boolean;
  minimal?: boolean;
  interactive?: boolean;
  template?: string;
  skipValidation?: boolean;
  skipMcp?: boolean;
  dryRun?: boolean;
  gitInit?: boolean;
  installDeps?: boolean;
}

interface ProjectConfig {
  name: string;
  description: string;
  template: 'minimal' | 'standard' | 'enterprise';
  features: {
    mcp: boolean;
    memory: boolean;
    swarm: boolean;
    sparc: boolean;
    monitoring: boolean;
    testing: boolean;
  };
  directories: string[];
  configFiles: string[];
}

export class EnhancedInitCommand {
  private spinner: ora.Ora;
  private projectRoot: string;

  constructor() {
    this.spinner = ora();
    this.projectRoot = process.cwd();
  }

  async execute(ctx: CommandContext): Promise<void> {
    const options = this.parseOptions(ctx);
    
    try {
      this.spinner.start('Initializing enhanced Claude-Flow project...');
      
      // Step 1: Pre-flight checks
      await this.performPreflightChecks(options);
      
      // Step 2: Interactive configuration or use defaults
      const config = options.interactive 
        ? await this.runInteractiveWizard(options)
        : await this.createDefaultConfig(options);
        
      // Step 3: Validate project setup
      if (!options.skipValidation) {
        await this.validateProjectSetup(config, options);
      }
      
      // Step 4: Create project structure
      if (!options.dryRun) {
        await this.createProjectStructure(config, options);
        await this.generateConfigurationFiles(config, options);
        await this.setupMcpConfiguration(config, options);
        await this.initializeMemorySystem(config, options);
        
        // Optional steps
        if (options.gitInit) {
          await this.initializeGitRepository(config);
        }
        
        if (options.installDeps) {
          await this.installDependencies(config);
        }
        
        // Step 5: Post-setup verification
        await this.performPostSetupVerification(config, options);
      }
      
      this.spinner.succeed(chalk.green('✅ Enhanced Claude-Flow project initialized successfully!'));
      
      // Display summary and next steps
      await this.displaySetupSummary(config, options);
      
    } catch (err) {
      this.spinner.fail(chalk.red('❌ Initialization failed'));
      throw err;
    }
  }

  private parseOptions(ctx: CommandContext): InitOptions {
    return {
      force: ctx.flags.force as boolean || false,
      minimal: ctx.flags.minimal as boolean || false,
      interactive: ctx.flags.interactive as boolean || !ctx.flags.minimal,
      template: ctx.flags.template as string || 'standard',
      skipValidation: ctx.flags.skipValidation as boolean || false,
      skipMcp: ctx.flags.skipMcp as boolean || false,
      dryRun: ctx.flags.dryRun as boolean || false,
      gitInit: ctx.flags.gitInit as boolean || true,
      installDeps: ctx.flags.installDeps as boolean || false,
    };
  }

  private async performPreflightChecks(options: InitOptions): Promise<void> {
    this.spinner.text = 'Performing pre-flight checks...';
    
    // Check if Node.js version is compatible
    const nodeVersion = process.version;
    const minNodeVersion = 'v20.0.0';
    if (nodeVersion < minNodeVersion) {
      throw new Error(`Node.js ${minNodeVersion} or higher is required. Current: ${nodeVersion}`);
    }
    
    // Check write permissions
    try {
      const testFile = path.join(this.projectRoot, '.claude-flow-test');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
    } catch (err) {
      throw new Error('Insufficient write permissions in current directory');
    }
    
    // Check for conflicting files if not forcing
    if (!options.force) {
      const criticalFiles = ['CLAUDE.md', 'claude-flow.config.json', 'package.json'];
      const existingFiles = [];
      
      for (const file of criticalFiles) {
        if (await fs.pathExists(path.join(this.projectRoot, file))) {
          existingFiles.push(file);
        }
      }
      
      if (existingFiles.length > 0) {
        throw new Error(`Conflicting files found: ${existingFiles.join(', ')}. Use --force to overwrite.`);
      }
    }
    
    // Check for required binaries
    const requiredBinaries = ['npm', 'git'];
    for (const binary of requiredBinaries) {
      try {
        const { spawn } = await import('child_process');
        await new Promise<void>((resolve, reject) => {
          const child = spawn(binary, ['--version'], { stdio: 'ignore' });
          child.on('exit', (code) => code === 0 ? resolve() : reject());
          child.on('error', reject);
        });
      } catch (err) {
        warning(`${binary} not found in PATH. Some features may not work.`);
      }
    }
  }

  private async runInteractiveWizard(options: InitOptions): Promise<ProjectConfig> {
    this.spinner.stop();
    
    console.log(chalk.cyan('\n🧙 Welcome to the Claude-Flow Interactive Setup Wizard!\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is your project name?',
        default: path.basename(this.projectRoot),
        validate: (input: string) => input.length > 0 || 'Project name cannot be empty',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Project description (optional):',
        default: 'A Claude-Flow AI orchestration project',
      },
      {
        type: 'list',
        name: 'template',
        message: 'Choose your project template:',
        choices: [
          { name: '📦 Minimal - Basic configuration with essential features', value: 'minimal' },
          { name: '🚀 Standard - Balanced setup with common features', value: 'standard' },
          { name: '🏢 Enterprise - Full-featured setup with all capabilities', value: 'enterprise' },
        ],
        default: 'standard',
      },
      {
        type: 'checkbox',
        name: 'features',
        message: 'Select additional features:',
        choices: [
          { name: '🔌 MCP Server Integration', value: 'mcp', checked: true },
          { name: '🧠 Memory Management System', value: 'memory', checked: true },
          { name: '🐝 Swarm Orchestration', value: 'swarm', checked: false },
          { name: '⚡ SPARC Development Mode', value: 'sparc', checked: false },
          { name: '📊 Performance Monitoring', value: 'monitoring', checked: false },
          { name: '🧪 Testing Framework', value: 'testing', checked: true },
        ],
      },
      {
        type: 'confirm',
        name: 'gitInit',
        message: 'Initialize Git repository?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'installDeps',
        message: 'Install dependencies automatically?',
        default: false,
      },
    ]);

    this.spinner.start('Configuring project...');

    const features = {
      mcp: answers.features.includes('mcp'),
      memory: answers.features.includes('memory'),
      swarm: answers.features.includes('swarm'),
      sparc: answers.features.includes('sparc'),
      monitoring: answers.features.includes('monitoring'),
      testing: answers.features.includes('testing'),
    };

    options.gitInit = answers.gitInit;
    options.installDeps = answers.installDeps;

    return {
      name: answers.projectName,
      description: answers.description,
      template: answers.template as 'minimal' | 'standard' | 'enterprise',
      features,
      directories: this.getDirectoriesForTemplate(answers.template, features),
      configFiles: this.getConfigFilesForTemplate(answers.template, features),
    };
  }

  private async createDefaultConfig(options: InitOptions): Promise<ProjectConfig> {
    const projectName = path.basename(this.projectRoot);
    const template = (options.template as 'minimal' | 'standard' | 'enterprise') || 'standard';
    
    const features = {
      mcp: !options.skipMcp && template !== 'minimal',
      memory: template !== 'minimal',
      swarm: template === 'enterprise',
      sparc: template === 'enterprise',
      monitoring: template === 'enterprise',
      testing: template !== 'minimal',
    };

    return {
      name: projectName,
      description: 'A Claude-Flow AI orchestration project',
      template,
      features,
      directories: this.getDirectoriesForTemplate(template, features),
      configFiles: this.getConfigFilesForTemplate(template, features),
    };
  }

  private getDirectoriesForTemplate(template: string, features: any): string[] {
    const baseDirs = ['.claude-flow', '.claude-flow/logs', '.claude-flow/sessions'];
    
    if (features.memory) {
      baseDirs.push('memory', 'memory/agents', 'memory/sessions', 'memory/namespaces');
    }
    
    if (features.swarm) {
      baseDirs.push('swarm', 'swarm/coordination', 'swarm/memory');
    }
    
    if (features.monitoring) {
      baseDirs.push('monitoring', 'monitoring/metrics', 'monitoring/logs');
    }
    
    if (features.testing) {
      baseDirs.push('__tests__', '__tests__/unit', '__tests__/integration');
    }
    
    if (template === 'enterprise') {
      baseDirs.push('docs', 'examples', 'workflows', 'templates');
    }
    
    return baseDirs;
  }

  private getConfigFilesForTemplate(template: string, features: any): string[] {
    const baseFiles = ['CLAUDE.md', 'claude-flow.config.json'];
    
    if (features.memory) {
      baseFiles.push('memory-config.json');
    }
    
    if (features.mcp) {
      baseFiles.push('mcp-config.json');
    }
    
    if (features.testing) {
      baseFiles.push('jest.config.js');
    }
    
    if (template === 'enterprise') {
      baseFiles.push('enterprise.config.json', 'monitoring.config.json');
    }
    
    return baseFiles;
  }

  private async validateProjectSetup(config: ProjectConfig, options: InitOptions): Promise<void> {
    this.spinner.text = 'Validating project configuration...';
    
    // Validate project name
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-_]*$/.test(config.name)) {
      throw new Error('Project name must contain only alphanumeric characters, hyphens, and underscores');
    }
    
    // Validate directory structure
    for (const dir of config.directories) {
      const fullPath = path.join(this.projectRoot, dir);
      const parent = path.dirname(fullPath);
      
      if (!await fs.pathExists(parent) && parent !== this.projectRoot) {
        warning(`Parent directory ${parent} doesn't exist. Will be created.`);
      }
    }
    
    // Validate feature combinations
    if (config.features.swarm && !config.features.memory) {
      throw new Error('Swarm orchestration requires memory management feature');
    }
    
    if (config.features.monitoring && config.template === 'minimal') {
      warning('Monitoring features may be limited in minimal template');
    }
  }

  private async createProjectStructure(config: ProjectConfig, options: InitOptions): Promise<void> {
    this.spinner.text = 'Creating project structure...';
    
    // Create directories
    for (const dir of config.directories) {
      const fullPath = path.join(this.projectRoot, dir);
      await fs.ensureDir(fullPath);
      
      // Create README.md for important directories
      if (['memory', 'swarm', 'monitoring'].includes(dir)) {
        await this.createDirectoryReadme(fullPath, dir);
      }
    }
    
    // Create .gitignore
    await this.createGitignore(config);
    
    // Create package.json if it doesn't exist
    if (!await fs.pathExists(path.join(this.projectRoot, 'package.json'))) {
      await this.createPackageJson(config);
    }
  }

  private async generateConfigurationFiles(config: ProjectConfig, options: InitOptions): Promise<void> {
    this.spinner.text = 'Generating configuration files...';
    
    // Enhanced CLAUDE.md
    await this.createEnhancedClaudeMd(config);
    
    // Main configuration file
    await this.createMainConfig(config);
    
    // Feature-specific configs
    if (config.features.memory) {
      await this.createMemoryConfig(config);
    }
    
    if (config.features.testing) {
      await this.createTestConfig(config);
    }
    
    if (config.template === 'enterprise') {
      await this.createEnterpriseConfig(config);
      await this.createMonitoringConfig(config);
    }
  }

  private async setupMcpConfiguration(config: ProjectConfig, options: InitOptions): Promise<void> {
    if (options.skipMcp || !config.features.mcp) {
      return;
    }
    
    this.spinner.text = 'Setting up MCP server configuration...';
    
    const mcpConfig = {
      name: `claude-flow-${config.name}`,
      version: '1.0.0',
      description: `MCP server for ${config.name}`,
      transport: {
        type: 'stdio',
        port: 3000,
      },
      tools: [
        { name: 'memory_store', enabled: config.features.memory },
        { name: 'memory_query', enabled: config.features.memory },
        { name: 'swarm_coordinate', enabled: config.features.swarm },
        { name: 'performance_monitor', enabled: config.features.monitoring },
      ].filter(tool => tool.enabled),
      capabilities: {
        resources: true,
        tools: true,
        prompts: config.template === 'enterprise',
      },
      logging: {
        level: config.template === 'enterprise' ? 'debug' : 'info',
        file: '.claude-flow/logs/mcp.log',
      },
    };
    
    await fs.writeJson(
      path.join(this.projectRoot, 'mcp-config.json'),
      mcpConfig,
      { spaces: 2 }
    );
  }

  private async initializeMemorySystem(config: ProjectConfig, options: InitOptions): Promise<void> {
    if (!config.features.memory) {
      return;
    }
    
    this.spinner.text = 'Initializing memory system...';
    
    // Create initial memory database
    const memoryData = {
      version: '2.0.0',
      createdAt: new Date().toISOString(),
      projectId: nanoid(),
      namespaces: {
        default: { id: 'default', createdAt: new Date().toISOString(), entries: [] },
        agents: { id: 'agents', createdAt: new Date().toISOString(), entries: [] },
        sessions: { id: 'sessions', createdAt: new Date().toISOString(), entries: [] },
      },
      metadata: {
        totalEntries: 0,
        lastAccessed: new Date().toISOString(),
        version: '2.0.0',
      },
    };
    
    await fs.writeJson(
      path.join(this.projectRoot, 'memory', 'memory-store.json'),
      memoryData,
      { spaces: 2 }
    );
    
    // Create namespace directories
    for (const namespace of Object.keys(memoryData.namespaces)) {
      await fs.ensureDir(path.join(this.projectRoot, 'memory', 'namespaces', namespace));
    }
  }

  private async initializeGitRepository(config: ProjectConfig): Promise<void> {
    this.spinner.text = 'Initializing Git repository...';
    
    try {
      const { spawn } = await import('child_process');
      
      await new Promise<void>((resolve, reject) => {
        const child = spawn('git', ['init'], { 
          cwd: this.projectRoot,
          stdio: 'ignore'
        });
        child.on('exit', (code) => code === 0 ? resolve() : reject(new Error('Git init failed')));
        child.on('error', reject);
      });
      
      // Create initial commit
      await new Promise<void>((resolve, reject) => {
        const child = spawn('git', ['add', '.'], { 
          cwd: this.projectRoot,
          stdio: 'ignore'
        });
        child.on('exit', (code) => code === 0 ? resolve() : reject(new Error('Git add failed')));
        child.on('error', reject);
      });
      
      await new Promise<void>((resolve, reject) => {
        const child = spawn('git', ['commit', '-m', 'Initial Claude-Flow project setup'], { 
          cwd: this.projectRoot,
          stdio: 'ignore'
        });
        child.on('exit', (code) => code === 0 ? resolve() : reject(new Error('Git commit failed')));
        child.on('error', reject);
      });
      
    } catch (err) {
      warning('Git initialization failed. You can initialize manually later.');
    }
  }

  private async installDependencies(config: ProjectConfig): Promise<void> {
    this.spinner.text = 'Installing dependencies...';
    
    try {
      const { spawn } = await import('child_process');
      
      await new Promise<void>((resolve, reject) => {
        const child = spawn('npm', ['install'], { 
          cwd: this.projectRoot,
          stdio: 'inherit'
        });
        child.on('exit', (code) => code === 0 ? resolve() : reject(new Error('npm install failed')));
        child.on('error', reject);
      });
      
    } catch (err) {
      warning('Dependency installation failed. Run npm install manually.');
    }
  }

  private async performPostSetupVerification(config: ProjectConfig, options: InitOptions): Promise<void> {
    this.spinner.text = 'Performing post-setup verification...';
    
    const verificationResults = {
      directories: 0,
      configFiles: 0,
      permissions: true,
      gitRepo: false,
    };
    
    // Verify directories
    for (const dir of config.directories) {
      if (await fs.pathExists(path.join(this.projectRoot, dir))) {
        verificationResults.directories++;
      }
    }
    
    // Verify config files
    for (const file of config.configFiles) {
      if (await fs.pathExists(path.join(this.projectRoot, file))) {
        verificationResults.configFiles++;
      }
    }
    
    // Check Git repository
    if (await fs.pathExists(path.join(this.projectRoot, '.git'))) {
      verificationResults.gitRepo = true;
    }
    
    if (verificationResults.directories < config.directories.length) {
      warning(`Only ${verificationResults.directories}/${config.directories.length} directories created`);
    }
    
    if (verificationResults.configFiles < config.configFiles.length) {
      warning(`Only ${verificationResults.configFiles}/${config.configFiles.length} config files created`);
    }
  }

  private async displaySetupSummary(config: ProjectConfig, options: InitOptions): Promise<void> {
    console.log(chalk.green('\n🎉 Setup Complete!\n'));
    
    console.log(chalk.bold('Project Summary:'));
    console.log(`  Name: ${chalk.cyan(config.name)}`);
    console.log(`  Template: ${chalk.yellow(config.template)}`);
    console.log(`  Description: ${config.description}`);
    
    console.log(chalk.bold('\n✨ Features Enabled:'));
    Object.entries(config.features).forEach(([feature, enabled]) => {
      if (enabled) {
        console.log(`  ✅ ${feature.charAt(0).toUpperCase() + feature.slice(1)}`);
      }
    });
    
    console.log(chalk.bold('\n📁 Directory Structure:'));
    config.directories.slice(0, 10).forEach(dir => {
      console.log(`  📂 ${dir}`);
    });
    if (config.directories.length > 10) {
      console.log(`  ... and ${config.directories.length - 10} more`);
    }
    
    console.log(chalk.bold('\n⚙️ Configuration Files:'));
    config.configFiles.forEach(file => {
      console.log(`  📄 ${file}`);
    });
    
    console.log(chalk.bold('\n🚀 Next Steps:'));
    console.log('  1. Review and customize configuration files');
    console.log('  2. Run: npx claude-flow start');
    console.log('  3. Visit: npx claude-flow help');
    
    if (config.features.mcp) {
      console.log('  4. Configure your Claude Desktop to use the MCP server');
    }
    
    if (options.dryRun) {
      console.log(chalk.yellow('\n⚠️ This was a dry run. No files were actually created.'));
    }
  }

  // Helper methods for creating specific files
  private async createEnhancedClaudeMd(config: ProjectConfig): Promise<void> {
    const content = this.generateClaudeMarkdown(config);
    await fs.writeFile(path.join(this.projectRoot, 'CLAUDE.md'), content);
  }

  private async createMainConfig(config: ProjectConfig): Promise<void> {
    const mainConfig = {
      name: config.name,
      version: '1.0.0',
      description: config.description,
      template: config.template,
      features: config.features,
      orchestrator: {
        maxAgents: config.template === 'enterprise' ? 20 : config.template === 'standard' ? 10 : 5,
        maxConcurrentTasks: config.template === 'enterprise' ? 50 : config.template === 'standard' ? 20 : 10,
        taskTimeout: 300000,
        defaultPriority: 5,
      },
      memory: config.features.memory ? {
        backend: 'json',
        path: './memory/memory-store.json',
        cacheSize: config.template === 'enterprise' ? 10000 : 1000,
        indexing: true,
        namespaces: ['default', 'agents', 'sessions'],
      } : null,
      mcp: config.features.mcp ? {
        enabled: true,
        config: './mcp-config.json',
        transport: 'stdio',
        port: 3000,
      } : null,
      logging: {
        level: config.template === 'enterprise' ? 'debug' : 'info',
        format: 'json',
        destination: '.claude-flow/logs/claude-flow.log',
      },
      createdAt: new Date().toISOString(),
      projectId: nanoid(),
    };

    await fs.writeJson(
      path.join(this.projectRoot, 'claude-flow.config.json'),
      mainConfig,
      { spaces: 2 }
    );
  }

  private async createMemoryConfig(config: ProjectConfig): Promise<void> {
    const memoryConfig = {
      backend: 'json',
      path: './memory/memory-store.json',
      indexing: {
        enabled: true,
        method: 'simple',
        fields: ['content', 'tags', 'namespace'],
      },
      namespaces: {
        default: { retention: '30d', maxSize: '10MB' },
        agents: { retention: 'permanent', maxSize: '50MB' },
        sessions: { retention: '90d', maxSize: '100MB' },
      },
      cache: {
        enabled: true,
        maxSize: config.template === 'enterprise' ? 10000 : 1000,
        ttl: 3600,
      },
      backup: {
        enabled: config.template !== 'minimal',
        interval: '24h',
        location: './memory/backups',
        maxBackups: 7,
      },
    };

    await fs.writeJson(
      path.join(this.projectRoot, 'memory-config.json'),
      memoryConfig,
      { spaces: 2 }
    );
  }

  private async createTestConfig(config: ProjectConfig): Promise<void> {
    const testConfig = `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.(ts|js)'],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.test.(ts|js)',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testTimeout: 30000,
};`;

    await fs.writeFile(path.join(this.projectRoot, 'jest.config.js'), testConfig);
  }

  private async createEnterpriseConfig(config: ProjectConfig): Promise<void> {
    const enterpriseConfig = {
      features: {
        advancedLogging: true,
        performanceMonitoring: true,
        securityAuditing: true,
        loadBalancing: true,
        clustering: true,
        apiRateLimit: true,
      },
      security: {
        encryption: true,
        authentication: true,
        authorization: true,
        auditLog: true,
      },
      performance: {
        clustering: true,
        workerThreads: true,
        caching: 'redis',
        compression: true,
      },
      monitoring: {
        metrics: true,
        healthChecks: true,
        alerts: true,
        dashboard: true,
      },
    };

    await fs.writeJson(
      path.join(this.projectRoot, 'enterprise.config.json'),
      enterpriseConfig,
      { spaces: 2 }
    );
  }

  private async createMonitoringConfig(config: ProjectConfig): Promise<void> {
    const monitoringConfig = {
      enabled: true,
      metrics: {
        collection: {
          interval: 30,
          retention: '7d',
        },
        storage: 'file',
        file: './monitoring/metrics/metrics.json',
      },
      healthChecks: {
        interval: 60,
        timeout: 5000,
        checks: [
          'orchestrator',
          'memory',
          'mcp-server',
          'file-system',
        ],
      },
      alerts: {
        enabled: true,
        thresholds: {
          cpuUsage: 80,
          memoryUsage: 85,
          errorRate: 5,
          responseTime: 2000,
        },
        channels: ['console', 'file'],
      },
      dashboard: {
        enabled: true,
        port: 3001,
        refreshInterval: 5,
      },
    };

    await fs.writeJson(
      path.join(this.projectRoot, 'monitoring.config.json'),
      monitoringConfig,
      { spaces: 2 }
    );
  }

  private async createGitignore(config: ProjectConfig): Promise<void> {
    const gitignore = `# Claude-Flow
.claude-flow/logs/*.log
.claude-flow/sessions/tmp*
memory/backups/
*.tmp
*.temp

# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
coverage/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Temporary files
*.log
*.pid
*.seed
*.pid.lock

# Runtime data
pids/
*.pid
*.seed
*.pid.lock
`;

    await fs.writeFile(path.join(this.projectRoot, '.gitignore'), gitignore);
  }

  private async createPackageJson(config: ProjectConfig): Promise<void> {
    const packageJson = {
      name: config.name,
      version: '1.0.0',
      description: config.description,
      main: 'index.js',
      scripts: {
        start: 'npx claude-flow start',
        dev: 'npx claude-flow start --verbose',
        test: config.features.testing ? 'jest' : 'echo "No tests configured"',
        lint: 'echo "Add linting configuration"',
        build: 'echo "Add build configuration"',
        ...(config.features.monitoring && {
          monitor: 'npx claude-flow monitor',
          'health-check': 'npx claude-flow status --health-check',
        }),
      },
      keywords: [
        'claude-flow',
        'ai-orchestration',
        'agent-coordination',
        'mcp',
      ],
      dependencies: {
        'claude-flow': '^2.0.0-alpha.90',
      },
      devDependencies: {
        ...(config.features.testing && {
          'jest': '^29.0.0',
          'ts-jest': '^29.0.0',
          '@types/jest': '^29.0.0',
        }),
      },
      engines: {
        node: '>=20.0.0',
        npm: '>=9.0.0',
      },
    };

    await fs.writeJson(
      path.join(this.projectRoot, 'package.json'),
      packageJson,
      { spaces: 2 }
    );
  }

  private async createDirectoryReadme(dirPath: string, dirName: string): Promise<void> {
    const readmeContent = this.generateDirectoryReadme(dirName);
    await fs.writeFile(path.join(dirPath, 'README.md'), readmeContent);
  }

  private generateClaudeMarkdown(config: ProjectConfig): string {
    return `# Claude Code Configuration - ${config.name}

## Project Information
- **Name**: ${config.name}
- **Description**: ${config.description}
- **Template**: ${config.template}
- **Created**: ${new Date().toISOString()}

## 🚨 CRITICAL: Concurrent Execution Rules

**ABSOLUTE RULE**: ALL operations MUST be concurrent/parallel in ONE message:

### 🔴 Mandatory Patterns:
- **TodoWrite**: ALWAYS batch ALL todos in ONE call (5-10+ minimum)
- **Task tool**: ALWAYS spawn ALL agents in ONE message
- **File operations**: ALWAYS batch ALL reads/writes/edits
- **Bash commands**: ALWAYS batch ALL terminal operations
- **Memory operations**: ALWAYS batch ALL store/retrieve

### ⚡ Golden Rule: "1 MESSAGE = ALL RELATED OPERATIONS"

## Build Commands
- \`npx claude-flow start\`: Start the orchestration system
- \`npx claude-flow status\`: Check system status
- \`npx claude-flow monitor\`: Real-time monitoring dashboard
${config.features.testing ? '- `npm test`: Run test suite' : ''}
${config.features.swarm ? '- `npx claude-flow swarm "<objective>"\`: Create agent swarms' : ''}
${config.features.sparc ? '- `npx claude-flow sparc tdd "<feature>"\`: TDD workflow' : ''}

## Features Enabled
${Object.entries(config.features)
  .filter(([_, enabled]) => enabled)
  .map(([feature, _]) => `- ✅ ${feature.charAt(0).toUpperCase() + feature.slice(1)}`)
  .join('\n')}

## Code Style Preferences
- Use TypeScript for all new code
- Follow ES modules (import/export) syntax
- Use async/await instead of Promise chains
- Prefer const/let over var
- Add JSDoc comments for public APIs
- Follow existing naming conventions

## Project Architecture
This is a Claude-Flow AI agent orchestration system with the following components:
- **CLI Interface**: Command-line tools for managing the system
- **Orchestrator**: Core engine for coordinating agents and tasks
${config.features.memory ? '- **Memory System**: Persistent storage and retrieval of information' : ''}
${config.features.mcp ? '- **MCP Integration**: Model Context Protocol server for Claude integration' : ''}
${config.features.swarm ? '- **Agent Coordination**: Multi-agent task distribution and management' : ''}
${config.features.monitoring ? '- **Performance Monitoring**: Real-time system metrics and alerting' : ''}

## Configuration Files
- \`claude-flow.config.json\`: Main configuration
${config.features.memory ? '- `memory-config.json`: Memory system settings' : ''}
${config.features.mcp ? '- `mcp-config.json`: MCP server configuration' : ''}
${config.template === 'enterprise' ? '- `enterprise.config.json`: Enterprise features\n- `monitoring.config.json`: Monitoring settings' : ''}

## Quick Start
1. Review and customize configuration files
2. Run \`npx claude-flow start\`
3. Use \`npx claude-flow help\` for available commands
${config.features.mcp ? '4. Configure Claude Desktop to use the MCP server' : ''}

## Important Notes
- Use \`claude --dangerously-skip-permissions\` for unattended operation
- The system supports both daemon and interactive modes
- Memory persistence is handled automatically
- All components are event-driven for scalability

## Debugging
- Check logs in \`.claude-flow/logs/\`
- Use \`npx claude-flow status --verbose\` for detailed system info
- Monitor with \`npx claude-flow monitor\` for real-time updates
- Use \`--verbose\` flag on commands for detailed output

---
Generated by Claude-Flow Enhanced Init v2.0.0
`;
  }

  private generateDirectoryReadme(dirName: string): string {
    const readmeTemplates: Record<string, string> = {
      memory: `# Memory Storage Directory

This directory contains the persistent memory system for your Claude-Flow project.

## Structure
- \`memory-store.json\`: Main memory database
- \`namespaces/\`: Organized memory by namespace
- \`sessions/\`: Session-specific memory data
- \`backups/\`: Automated memory backups

## Usage
- Query: \`npx claude-flow memory query <search>\`
- Stats: \`npx claude-flow memory stats\`
- Export: \`npx claude-flow memory export <file>\`

Last updated: ${new Date().toISOString()}`,

      swarm: `# Swarm Coordination Directory

This directory manages multi-agent swarm orchestration.

## Structure
- \`coordination/\`: Agent coordination data
- \`memory/\`: Shared swarm memory

## Usage
- Create swarm: \`npx claude-flow swarm "<objective>"\`
- Status: \`npx claude-flow swarm-status\`

Last updated: ${new Date().toISOString()}`,

      monitoring: `# Monitoring Directory

This directory contains performance monitoring and metrics.

## Structure
- \`metrics/\`: Performance metrics data
- \`logs/\`: System logs

## Usage
- Monitor: \`npx claude-flow monitor\`
- Health: \`npx claude-flow status --health-check\`

Last updated: ${new Date().toISOString()}`,
    };

    return readmeTemplates[dirName] || `# ${dirName.charAt(0).toUpperCase() + dirName.slice(1)} Directory

This directory is part of your Claude-Flow project structure.

Last updated: ${new Date().toISOString()}`;
  }
}

// Export the enhanced init action
export async function enhancedInitAction(ctx: CommandContext): Promise<void> {
  const enhancedInit = new EnhancedInitCommand();
  await enhancedInit.execute(ctx);
}