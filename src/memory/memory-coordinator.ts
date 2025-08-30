/**
 * Memory Coordination Specialist Agent
 * 
 * Manages distributed memory system enabling knowledge persistence across sessions
 * and facilitating information sharing between agents in Claude Flow swarms.
 * 
 * Key Features:
 * - Cross-session memory persistence using SQLite backend
 * - Agent memory allocation and sharing protocols
 * - Memory key-value storage with namespace management
 * - Session management and restoration capabilities
 * - Performance monitoring for memory operations
 */

import { EventEmitter } from 'node:events';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import type { ILogger } from '../core/logger.js';
import type { IEventBus } from '../core/event-bus.js';
import { Logger } from '../core/logger.js';
import { EventBus } from '../core/event-bus.js';
import { generateId } from '../utils/helpers.js';
import type { MemoryEntry, MemoryQuery, MemoryConfig } from '../utils/types.js';

// Enhanced memory-specific interfaces
export interface MemoryNamespace {
  id: string;
  name: string;
  description: string;
  agentId?: string;
  shareLevel: 'private' | 'team' | 'public' | 'global';
  createdAt: Date;
  updatedAt: Date;
  config: NamespaceConfig;
  metrics: NamespaceMetrics;
}

export interface NamespaceConfig {
  maxEntries: number;
  defaultTTL: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  autoCleanup: boolean;
  allowedAgents?: string[];
}

export interface NamespaceMetrics {
  entryCount: number;
  totalSize: number;
  accessCount: number;
  lastAccessed: Date;
  averageAccessTime: number;
}

export interface SwarmSession {
  id: string;
  swarmId: string;
  createdAt: Date;
  endedAt?: Date;
  status: 'active' | 'paused' | 'completed' | 'failed';
  agentIds: string[];
  memorySnapshot: Record<string, MemoryEntry>;
  metadata: SessionMetadata;
}

export interface SessionMetadata {
  initiatedBy: string;
  objective: string;
  totalTasks: number;
  completedTasks: number;
  memoryUsage: number;
  messageCount: number;
  errorCount: number;
}

export interface MemoryAllocation {
  agentId: string;
  namespace: string;
  allocatedSize: number;
  usedSize: number;
  maxEntries: number;
  currentEntries: number;
  priority: number;
  createdAt: Date;
}

export interface MemoryShareRequest {
  id: string;
  fromAgent: string;
  toAgent: string;
  entryIds: string[];
  shareLevel: 'read' | 'write' | 'full';
  expiresAt?: Date;
  approved: boolean;
  createdAt: Date;
}

export interface MemoryAnalytics {
  totalMemoryUsage: number;
  entryCount: number;
  namespaceCount: number;
  activeAgents: number;
  activeSessions: number;
  topNamespaces: Array<{ name: string; usage: number }>;
  agentUsage: Record<string, number>;
  performanceMetrics: {
    averageReadTime: number;
    averageWriteTime: number;
    cacheHitRate: number;
    syncLatency: number;
  };
  trends: {
    hourly: number[];
    daily: number[];
    memoryGrowthRate: number;
  };
}

export interface MemoryCoordinatorConfig extends MemoryConfig {
  // Extended configuration options
  enableDistribution: boolean;
  enableReplication: boolean;
  maxNamespaces: number;
  maxAgentAllocations: number;
  cleanupInterval: number;
  analyticsInterval: number;
  sessionTimeout: number;
  sharePolicyStrict: boolean;
  enableMemoryCompaction: boolean;
  compressionThreshold: number;
  encryptionKey?: string;
  performanceTracking: boolean;
  crossSessionPersistence: boolean;
}

/**
 * Enhanced SQLite Memory Backend with advanced features
 */
class EnhancedSQLiteBackend {
  private db: any;
  private sqliteLoaded = false;
  private performanceTracker = new Map<string, number[]>();

  constructor(
    private dbPath: string,
    private logger: ILogger,
    private config: MemoryCoordinatorConfig
  ) {}

  async initialize(): Promise<void> {
    this.logger.info('Initializing Enhanced SQLite Memory Backend', { dbPath: this.dbPath });

    try {
      // Load SQLite with better-sqlite3
      if (!this.sqliteLoaded) {
        const module = await import('../sqlite-wrapper.js');
        const { createDatabase } = module;
        this.db = await createDatabase(this.dbPath);
        this.sqliteLoaded = true;
      }

      // Ensure directory exists
      const dir = path.dirname(this.dbPath);
      await fs.mkdir(dir, { recursive: true });

      // Optimize SQLite for concurrent access and performance
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma('cache_size = -64000'); // 64MB cache
      this.db.pragma('temp_store = memory');
      this.db.pragma('mmap_size = 268435456'); // 256MB mmap
      this.db.pragma('optimize');

      await this.createAdvancedSchema();
      await this.createIndexes();
      await this.createTriggers();

      this.logger.info('Enhanced SQLite Memory Backend initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Enhanced SQLite Memory Backend', error);
      throw error;
    }
  }

  private async createAdvancedSchema(): Promise<void> {
    const schemas = [
      // Enhanced memory entries table
      `CREATE TABLE IF NOT EXISTS memory_entries (
        id TEXT PRIMARY KEY,
        namespace_id TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        key TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('observation', 'insight', 'decision', 'artifact', 'error', 'state', 'communication')),
        content TEXT NOT NULL,
        content_type TEXT DEFAULT 'text',
        content_hash TEXT,
        compressed BOOLEAN DEFAULT FALSE,
        encrypted BOOLEAN DEFAULT FALSE,
        context TEXT NOT NULL DEFAULT '{}',
        timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        tags TEXT NOT NULL DEFAULT '[]',
        version INTEGER NOT NULL DEFAULT 1,
        parent_id TEXT,
        child_count INTEGER DEFAULT 0,
        access_count INTEGER DEFAULT 0,
        last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
        size_bytes INTEGER DEFAULT 0,
        metadata TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES memory_entries(id) ON DELETE CASCADE,
        UNIQUE(namespace_id, key, agent_id)
      )`,
      
      // Memory namespaces table
      `CREATE TABLE IF NOT EXISTS memory_namespaces (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        agent_id TEXT,
        share_level TEXT NOT NULL CHECK (share_level IN ('private', 'team', 'public', 'global')),
        max_entries INTEGER DEFAULT 10000,
        default_ttl INTEGER DEFAULT 86400,
        compression_enabled BOOLEAN DEFAULT FALSE,
        encryption_enabled BOOLEAN DEFAULT FALSE,
        auto_cleanup BOOLEAN DEFAULT TRUE,
        allowed_agents TEXT DEFAULT '[]',
        entry_count INTEGER DEFAULT 0,
        total_size INTEGER DEFAULT 0,
        access_count INTEGER DEFAULT 0,
        last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Swarm sessions table
      `CREATE TABLE IF NOT EXISTS swarm_sessions (
        id TEXT PRIMARY KEY,
        swarm_id TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'completed', 'failed')),
        agent_ids TEXT NOT NULL DEFAULT '[]',
        initiated_by TEXT NOT NULL,
        objective TEXT,
        total_tasks INTEGER DEFAULT 0,
        completed_tasks INTEGER DEFAULT 0,
        memory_usage INTEGER DEFAULT 0,
        message_count INTEGER DEFAULT 0,
        error_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ended_at DATETIME,
        metadata TEXT DEFAULT '{}'
      )`,
      
      // Memory allocations table
      `CREATE TABLE IF NOT EXISTS memory_allocations (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        namespace TEXT NOT NULL,
        allocated_size INTEGER NOT NULL,
        used_size INTEGER DEFAULT 0,
        max_entries INTEGER NOT NULL,
        current_entries INTEGER DEFAULT 0,
        priority INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(agent_id, namespace)
      )`,
      
      // Memory share requests table
      `CREATE TABLE IF NOT EXISTS memory_share_requests (
        id TEXT PRIMARY KEY,
        from_agent TEXT NOT NULL,
        to_agent TEXT NOT NULL,
        entry_ids TEXT NOT NULL,
        share_level TEXT NOT NULL CHECK (share_level IN ('read', 'write', 'full')),
        approved BOOLEAN DEFAULT FALSE,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        approved_at DATETIME
      )`,
      
      // Performance metrics table
      `CREATE TABLE IF NOT EXISTS memory_performance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation_type TEXT NOT NULL,
        namespace_id TEXT,
        agent_id TEXT,
        duration_ms INTEGER NOT NULL,
        success BOOLEAN NOT NULL,
        memory_usage INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Memory analytics snapshots
      `CREATE TABLE IF NOT EXISTS memory_analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total_memory_usage INTEGER NOT NULL,
        entry_count INTEGER NOT NULL,
        namespace_count INTEGER NOT NULL,
        active_agents INTEGER NOT NULL,
        active_sessions INTEGER NOT NULL,
        cache_hit_rate REAL DEFAULT 0.0,
        avg_read_time REAL DEFAULT 0.0,
        avg_write_time REAL DEFAULT 0.0,
        hourly_trend TEXT DEFAULT '[]',
        daily_trend TEXT DEFAULT '[]',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const schema of schemas) {
      this.db.exec(schema);
    }
  }

  private async createIndexes(): Promise<void> {
    const indexes = [
      // Memory entries indexes
      'CREATE INDEX IF NOT EXISTS idx_memory_entries_namespace ON memory_entries(namespace_id)',
      'CREATE INDEX IF NOT EXISTS idx_memory_entries_agent ON memory_entries(agent_id)',
      'CREATE INDEX IF NOT EXISTS idx_memory_entries_session ON memory_entries(session_id)',
      'CREATE INDEX IF NOT EXISTS idx_memory_entries_key ON memory_entries(key)',
      'CREATE INDEX IF NOT EXISTS idx_memory_entries_type ON memory_entries(type)',
      'CREATE INDEX IF NOT EXISTS idx_memory_entries_timestamp ON memory_entries(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_memory_entries_expires ON memory_entries(expires_at)',
      'CREATE INDEX IF NOT EXISTS idx_memory_entries_parent ON memory_entries(parent_id)',
      'CREATE INDEX IF NOT EXISTS idx_memory_entries_hash ON memory_entries(content_hash)',
      
      // Namespace indexes
      'CREATE INDEX IF NOT EXISTS idx_namespaces_agent ON memory_namespaces(agent_id)',
      'CREATE INDEX IF NOT EXISTS idx_namespaces_share_level ON memory_namespaces(share_level)',
      'CREATE INDEX IF NOT EXISTS idx_namespaces_last_accessed ON memory_namespaces(last_accessed)',
      
      // Session indexes
      'CREATE INDEX IF NOT EXISTS idx_sessions_swarm ON swarm_sessions(swarm_id)',
      'CREATE INDEX IF NOT EXISTS idx_sessions_status ON swarm_sessions(status)',
      'CREATE INDEX IF NOT EXISTS idx_sessions_created ON swarm_sessions(created_at)',
      
      // Allocation indexes
      'CREATE INDEX IF NOT EXISTS idx_allocations_agent ON memory_allocations(agent_id)',
      'CREATE INDEX IF NOT EXISTS idx_allocations_namespace ON memory_allocations(namespace)',
      
      // Performance indexes
      'CREATE INDEX IF NOT EXISTS idx_performance_timestamp ON memory_performance(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_performance_operation ON memory_performance(operation_type)',
      'CREATE INDEX IF NOT EXISTS idx_performance_agent ON memory_performance(agent_id)'
    ];

    for (const index of indexes) {
      this.db.exec(index);
    }
  }

  private async createTriggers(): Promise<void> {
    const triggers = [
      // Update namespace metrics when entries are added
      `CREATE TRIGGER IF NOT EXISTS update_namespace_on_insert
       AFTER INSERT ON memory_entries
       BEGIN
         UPDATE memory_namespaces 
         SET entry_count = entry_count + 1,
             total_size = total_size + NEW.size_bytes,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = NEW.namespace_id;
       END`,
      
      // Update namespace metrics when entries are deleted
      `CREATE TRIGGER IF NOT EXISTS update_namespace_on_delete
       AFTER DELETE ON memory_entries
       BEGIN
         UPDATE memory_namespaces 
         SET entry_count = entry_count - 1,
             total_size = total_size - OLD.size_bytes,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = OLD.namespace_id;
       END`,
      
      // Update parent child count
      `CREATE TRIGGER IF NOT EXISTS update_parent_child_count
       AFTER INSERT ON memory_entries
       WHEN NEW.parent_id IS NOT NULL
       BEGIN
         UPDATE memory_entries 
         SET child_count = child_count + 1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = NEW.parent_id;
       END`,
      
      // Auto-expire entries
      `CREATE TRIGGER IF NOT EXISTS auto_expire_entries
       AFTER UPDATE ON memory_entries
       WHEN NEW.expires_at IS NOT NULL AND NEW.expires_at <= CURRENT_TIMESTAMP
       BEGIN
         DELETE FROM memory_entries WHERE id = NEW.id;
       END`,
      
      // Update allocation metrics
      `CREATE TRIGGER IF NOT EXISTS update_allocation_on_insert
       AFTER INSERT ON memory_entries
       BEGIN
         UPDATE memory_allocations 
         SET used_size = used_size + NEW.size_bytes,
             current_entries = current_entries + 1,
             updated_at = CURRENT_TIMESTAMP
         WHERE agent_id = NEW.agent_id AND namespace = NEW.namespace_id;
       END`
    ];

    for (const trigger of triggers) {
      this.db.exec(trigger);
    }
  }

  async storeEntry(entry: MemoryEntry & { namespace: string; key: string }): Promise<void> {
    const startTime = Date.now();
    
    try {
      const content = typeof entry.content === 'string' 
        ? entry.content 
        : JSON.stringify(entry.content);
      
      const contentHash = this.generateHash(content);
      const sizeBytes = Buffer.byteLength(content, 'utf8');
      
      const sql = `
        INSERT OR REPLACE INTO memory_entries (
          id, namespace_id, agent_id, session_id, key, type, content, content_hash,
          context, timestamp, expires_at, tags, version, parent_id, size_bytes, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const stmt = this.db.prepare(sql);
      stmt.run(
        entry.id,
        entry.namespace,
        entry.agentId,
        entry.sessionId,
        entry.key,
        entry.type,
        content,
        contentHash,
        JSON.stringify(entry.context),
        entry.timestamp.toISOString(),
        entry.metadata?.expiresAt ? new Date(entry.metadata.expiresAt).toISOString() : null,
        JSON.stringify(entry.tags),
        entry.version,
        entry.parentId || null,
        sizeBytes,
        JSON.stringify(entry.metadata || {})
      );

      this.trackPerformance('store', Date.now() - startTime, true, entry.agentId);
    } catch (error) {
      this.trackPerformance('store', Date.now() - startTime, false, entry.agentId);
      throw error;
    }
  }

  async retrieveEntry(key: string, namespace: string, agentId?: string): Promise<MemoryEntry | undefined> {
    const startTime = Date.now();
    
    try {
      let sql = 'SELECT * FROM memory_entries WHERE key = ? AND namespace_id = ?';
      const params: any[] = [key, namespace];
      
      if (agentId) {
        sql += ' AND agent_id = ?';
        params.push(agentId);
      }
      
      sql += ' ORDER BY version DESC LIMIT 1';
      
      const stmt = this.db.prepare(sql);
      const row = stmt.get(...params);
      
      if (!row) {
        this.trackPerformance('retrieve', Date.now() - startTime, true, agentId);
        return undefined;
      }

      // Update access count and timestamp
      this.db.prepare(`
        UPDATE memory_entries 
        SET access_count = access_count + 1, last_accessed = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(row.id);

      const entry = this.rowToEntry(row);
      this.trackPerformance('retrieve', Date.now() - startTime, true, agentId);
      
      return entry;
    } catch (error) {
      this.trackPerformance('retrieve', Date.now() - startTime, false, agentId);
      throw error;
    }
  }

  private trackPerformance(operation: string, duration: number, success: boolean, agentId?: string): void {
    if (!this.config.performanceTracking) return;

    try {
      this.db.prepare(`
        INSERT INTO memory_performance (operation_type, agent_id, duration_ms, success)
        VALUES (?, ?, ?, ?)
      `).run(operation, agentId || null, duration, success ? 1 : 0);
    } catch (error) {
      // Silently fail performance tracking
    }
  }

  private generateHash(content: string): string {
    // Simple hash function (in production, use crypto.createHash)
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private rowToEntry(row: any): MemoryEntry {
    return {
      id: row.id,
      agentId: row.agent_id,
      sessionId: row.session_id,
      type: row.type,
      content: row.content,
      context: JSON.parse(row.context || '{}'),
      timestamp: new Date(row.timestamp),
      tags: JSON.parse(row.tags || '[]'),
      version: row.version,
      parentId: row.parent_id,
      metadata: JSON.parse(row.metadata || '{}')
    };
  }

  async shutdown(): Promise<void> {
    if (this.db) {
      this.db.close();
    }
  }
}

/**
 * Memory Coordination Specialist Agent
 * 
 * Main coordinator class that orchestrates all memory operations,
 * manages agent allocations, and provides advanced memory features.
 */
export class MemoryCoordinator extends EventEmitter {
  private logger: ILogger;
  private eventBus: IEventBus;
  private backend: EnhancedSQLiteBackend;
  private namespaces = new Map<string, MemoryNamespace>();
  private allocations = new Map<string, MemoryAllocation>();
  private activeSessions = new Map<string, SwarmSession>();
  private shareRequests = new Map<string, MemoryShareRequest>();
  private analytics: MemoryAnalytics;
  private cleanupTimer?: NodeJS.Timeout;
  private analyticsTimer?: NodeJS.Timeout;
  private performanceCache = new Map<string, any>();
  private initialized = false;

  constructor(
    private config: MemoryCoordinatorConfig,
    logger?: ILogger,
    eventBus?: IEventBus
  ) {
    super();
    
    this.logger = logger || new Logger('MemoryCoordinator');
    this.eventBus = eventBus || EventBus.getInstance();
    
    this.backend = new EnhancedSQLiteBackend(
      this.config.sqlitePath || './data/memory-coordinator.db',
      this.logger,
      this.config
    );

    this.analytics = {
      totalMemoryUsage: 0,
      entryCount: 0,
      namespaceCount: 0,
      activeAgents: 0,
      activeSessions: 0,
      topNamespaces: [],
      agentUsage: {},
      performanceMetrics: {
        averageReadTime: 0,
        averageWriteTime: 0,
        cacheHitRate: 0,
        syncLatency: 0
      },
      trends: {
        hourly: new Array(24).fill(0),
        daily: new Array(30).fill(0),
        memoryGrowthRate: 0
      }
    };

    // Set up default configuration
    this.config = {
      backend: 'sqlite',
      cacheSizeMB: 100,
      syncInterval: 30000,
      conflictResolution: 'last-write',
      retentionDays: 30,
      enableDistribution: true,
      enableReplication: false,
      maxNamespaces: 1000,
      maxAgentAllocations: 10000,
      cleanupInterval: 300000, // 5 minutes
      analyticsInterval: 60000, // 1 minute
      sessionTimeout: 3600000, // 1 hour
      sharePolicyStrict: false,
      enableMemoryCompaction: true,
      compressionThreshold: 1024,
      performanceTracking: true,
      crossSessionPersistence: true,
      ...config
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.logger.info('Initializing Memory Coordinator...');
    
    try {
      // Initialize backend
      await this.backend.initialize();
      
      // Load existing namespaces and allocations
      await this.loadExistingData();
      
      // Start periodic tasks
      this.startPeriodicTasks();
      
      // Create default namespaces
      await this.createDefaultNamespaces();
      
      this.initialized = true;
      this.emit('coordinator:initialized');
      this.logger.info('Memory Coordinator initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Memory Coordinator', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (!this.initialized) return;

    this.logger.info('Shutting down Memory Coordinator...');
    
    // Stop periodic tasks
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
    if (this.analyticsTimer) clearInterval(this.analyticsTimer);
    
    // Save final analytics
    await this.updateAnalytics();
    
    // Shutdown backend
    await this.backend.shutdown();
    
    this.initialized = false;
    this.emit('coordinator:shutdown');
    this.logger.info('Memory Coordinator shutdown completed');
  }

  /**
   * Store memory entry with advanced features
   */
  async store(key: string, value: any, options: {
    namespace?: string;
    agentId: string;
    sessionId?: string;
    type?: MemoryEntry['type'];
    tags?: string[];
    ttl?: number;
    parentId?: string;
    metadata?: Record<string, any>;
  }): Promise<string> {
    const entryId = generateId('mem');
    const namespace = options.namespace || 'default';
    const timestamp = new Date();
    
    // Check allocation limits
    const allocation = await this.checkAllocation(options.agentId, namespace);
    if (!allocation) {
      throw new Error(`No allocation found for agent ${options.agentId} in namespace ${namespace}`);
    }

    const entry: MemoryEntry & { namespace: string; key: string } = {
      id: entryId,
      namespace,
      key,
      agentId: options.agentId,
      sessionId: options.sessionId || 'default',
      type: options.type || 'observation',
      content: value,
      context: {},
      timestamp,
      tags: options.tags || [],
      version: 1,
      parentId: options.parentId,
      metadata: {
        ...options.metadata,
        ...(options.ttl && { expiresAt: Date.now() + (options.ttl * 1000) })
      }
    };

    await this.backend.storeEntry(entry);
    
    // Update allocation usage
    await this.updateAllocation(options.agentId, namespace, 'increment');
    
    this.emit('memory:stored', { entry });
    return entryId;
  }

  /**
   * Retrieve memory entry
   */
  async retrieve(key: string, options: {
    namespace?: string;
    agentId?: string;
  }): Promise<any> {
    const namespace = options.namespace || 'default';
    const entry = await this.backend.retrieveEntry(key, namespace, options.agentId);
    
    if (entry) {
      this.emit('memory:retrieved', { entry });
      return typeof entry.content === 'string' 
        ? entry.content 
        : JSON.parse(entry.content);
    }
    
    return undefined;
  }

  /**
   * Create memory namespace
   */
  async createNamespace(name: string, config: Partial<NamespaceConfig> = {}, agentId?: string): Promise<string> {
    const namespaceId = generateId('ns');
    
    const namespace: MemoryNamespace = {
      id: namespaceId,
      name,
      description: `Namespace: ${name}`,
      agentId,
      shareLevel: 'team',
      createdAt: new Date(),
      updatedAt: new Date(),
      config: {
        maxEntries: config.maxEntries || 10000,
        defaultTTL: config.defaultTTL || 86400,
        compressionEnabled: config.compressionEnabled || false,
        encryptionEnabled: config.encryptionEnabled || false,
        autoCleanup: config.autoCleanup !== false,
        allowedAgents: config.allowedAgents || []
      },
      metrics: {
        entryCount: 0,
        totalSize: 0,
        accessCount: 0,
        lastAccessed: new Date(),
        averageAccessTime: 0
      }
    };

    this.namespaces.set(namespaceId, namespace);
    this.emit('namespace:created', { namespace });
    this.logger.info(`Created namespace: ${name} (${namespaceId})`);
    
    return namespaceId;
  }

  /**
   * Create memory allocation for an agent
   */
  async createAllocation(agentId: string, namespace: string, config: {
    maxSize: number;
    maxEntries: number;
    priority?: number;
  }): Promise<void> {
    const allocationId = `${agentId}:${namespace}`;
    
    if (this.allocations.has(allocationId)) {
      throw new Error(`Allocation already exists for agent ${agentId} in namespace ${namespace}`);
    }

    const allocation: MemoryAllocation = {
      agentId,
      namespace,
      allocatedSize: config.maxSize,
      usedSize: 0,
      maxEntries: config.maxEntries,
      currentEntries: 0,
      priority: config.priority || 1,
      createdAt: new Date()
    };

    this.allocations.set(allocationId, allocation);
    this.emit('allocation:created', { allocation });
    this.logger.info(`Created allocation for agent ${agentId} in namespace ${namespace}`);
  }

  /**
   * Start a swarm session
   */
  async startSession(swarmId: string, agentIds: string[], metadata: Partial<SessionMetadata>): Promise<string> {
    const sessionId = generateId('session');
    
    const session: SwarmSession = {
      id: sessionId,
      swarmId,
      createdAt: new Date(),
      status: 'active',
      agentIds: [...agentIds],
      memorySnapshot: {},
      metadata: {
        initiatedBy: metadata.initiatedBy || 'unknown',
        objective: metadata.objective || '',
        totalTasks: 0,
        completedTasks: 0,
        memoryUsage: 0,
        messageCount: 0,
        errorCount: 0,
        ...metadata
      }
    };

    this.activeSessions.set(sessionId, session);
    this.emit('session:started', { session });
    this.logger.info(`Started swarm session: ${sessionId} for swarm: ${swarmId}`);
    
    return sessionId;
  }

  /**
   * End a swarm session and create memory snapshot
   */
  async endSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Create memory snapshot
    session.memorySnapshot = {};
    for (const agentId of session.agentIds) {
      // Collect relevant memories for this agent during the session
      // This would be expanded with actual retrieval logic
    }

    session.status = 'completed';
    session.endedAt = new Date();
    
    this.activeSessions.delete(sessionId);
    this.emit('session:ended', { session });
    this.logger.info(`Ended swarm session: ${sessionId}`);
  }

  /**
   * Share memory between agents
   */
  async shareMemory(entryIds: string[], fromAgent: string, toAgent: string, shareLevel: 'read' | 'write' | 'full'): Promise<string> {
    const requestId = generateId('share');
    
    const request: MemoryShareRequest = {
      id: requestId,
      fromAgent,
      toAgent,
      entryIds,
      shareLevel,
      approved: !this.config.sharePolicyStrict, // Auto-approve if not strict
      createdAt: new Date()
    };

    this.shareRequests.set(requestId, request);
    
    if (request.approved) {
      await this.processShareRequest(requestId);
    }
    
    this.emit('memory:shareRequested', { request });
    return requestId;
  }

  /**
   * Get memory analytics
   */
  async getAnalytics(): Promise<MemoryAnalytics> {
    await this.updateAnalytics();
    return { ...this.analytics };
  }

  /**
   * Get memory usage for specific agent
   */
  async getAgentUsage(agentId: string): Promise<{
    allocations: MemoryAllocation[];
    totalUsage: number;
    entryCount: number;
    namespaces: string[];
  }> {
    const allocations = Array.from(this.allocations.values())
      .filter(alloc => alloc.agentId === agentId);
    
    const totalUsage = allocations.reduce((sum, alloc) => sum + alloc.usedSize, 0);
    const entryCount = allocations.reduce((sum, alloc) => sum + alloc.currentEntries, 0);
    const namespaces = allocations.map(alloc => alloc.namespace);

    return { allocations, totalUsage, entryCount, namespaces };
  }

  /**
   * Perform memory cleanup and optimization
   */
  async performCleanup(): Promise<void> {
    this.logger.info('Starting memory cleanup...');
    
    // Clean up expired entries (handled by triggers)
    // Clean up old sessions
    const now = Date.now();
    for (const [sessionId, session] of this.activeSessions) {
      if (session.status === 'active' && 
          now - session.createdAt.getTime() > this.config.sessionTimeout) {
        session.status = 'failed';
        session.endedAt = new Date();
        this.activeSessions.delete(sessionId);
      }
    }
    
    // Update analytics
    await this.updateAnalytics();
    
    this.emit('memory:cleaned');
    this.logger.info('Memory cleanup completed');
  }

  // Private helper methods

  private async loadExistingData(): Promise<void> {
    // Load namespaces, allocations, etc. from database
    // This would be implemented with actual database queries
  }

  private async createDefaultNamespaces(): Promise<void> {
    const defaultNamespaces = ['default', 'system', 'coordination', 'patterns'];
    
    for (const name of defaultNamespaces) {
      try {
        await this.createNamespace(name);
      } catch (error) {
        // Namespace might already exist
      }
    }
  }

  private startPeriodicTasks(): void {
    // Cleanup task
    this.cleanupTimer = setInterval(() => {
      this.performCleanup().catch(error => {
        this.logger.error('Cleanup task failed', error);
      });
    }, this.config.cleanupInterval);

    // Analytics task
    this.analyticsTimer = setInterval(() => {
      this.updateAnalytics().catch(error => {
        this.logger.error('Analytics update failed', error);
      });
    }, this.config.analyticsInterval);
  }

  private async checkAllocation(agentId: string, namespace: string): Promise<MemoryAllocation | undefined> {
    const allocationId = `${agentId}:${namespace}`;
    return this.allocations.get(allocationId);
  }

  private async updateAllocation(agentId: string, namespace: string, operation: 'increment' | 'decrement'): Promise<void> {
    const allocationId = `${agentId}:${namespace}`;
    const allocation = this.allocations.get(allocationId);
    
    if (allocation) {
      if (operation === 'increment') {
        allocation.currentEntries++;
      } else {
        allocation.currentEntries = Math.max(0, allocation.currentEntries - 1);
      }
    }
  }

  private async processShareRequest(requestId: string): Promise<void> {
    const request = this.shareRequests.get(requestId);
    if (!request || !request.approved) return;

    // Implementation for actually sharing the memory entries
    // This would involve creating new entries or permissions
    
    this.emit('memory:shared', { request });
  }

  private async updateAnalytics(): Promise<void> {
    // Update analytics based on current state
    this.analytics.namespaceCount = this.namespaces.size;
    this.analytics.activeAgents = new Set(Array.from(this.allocations.values()).map(a => a.agentId)).size;
    this.analytics.activeSessions = this.activeSessions.size;
    
    // Additional analytics would be computed here
    this.emit('analytics:updated', { analytics: this.analytics });
  }
}