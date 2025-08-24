# Data Directory

This directory contains database files, persistent data storage, and data management components for the Claude Flow platform. It serves as the central repository for all persistent data used by the hive-mind coordination system.

## Table of Contents

1. [Database Files](#database-files) (1 database)
2. [Data Architecture](#data-architecture)
3. [Database Schema](#database-schema)
4. [Data Management](#data-management)
5. [Quick Reference](#quick-reference)

---

## Database Files

### hive-mind.db
**Primary SQLite database for hive-mind coordination system**
- Central persistent storage for all hive-mind operations
- Agent coordination state and session data
- Task execution history and performance metrics
- Memory system storage and indexing

**Database Purpose:**
- Store agent registration and capabilities
- Track coordination sessions and workflows
- Maintain performance analytics and optimization data
- Persist user preferences and system configurations

**Key Features:**
- ACID compliance for data integrity
- Optimized indexes for fast query performance
- Automated backup and recovery capabilities
- Cross-platform compatibility (SQLite format)

**Usage:**
```bash
# View database schema
sqlite3 data/hive-mind.db ".schema"

# Check database size and statistics
sqlite3 data/hive-mind.db ".dbstat"

# Backup database
cp data/hive-mind.db data/backup/hive-mind-$(date +%Y%m%d).db
```

---

## Data Architecture

### Storage Strategy
- **Primary Storage**: SQLite for structured data and relationships
- **Memory Cache**: In-memory caching for frequently accessed data
- **File Storage**: Separate file storage for large artifacts and logs
- **Backup Strategy**: Automated daily backups with retention policies

### Data Categories
1. **Agent Data**: Registration, capabilities, and status information
2. **Coordination Data**: Session states, communication logs, and workflows
3. **Performance Data**: Metrics, analytics, and optimization information
4. **Configuration Data**: System settings, user preferences, and defaults
5. **Archive Data**: Historical records and audit trails

### Data Flow
```
Application Layer
       ↓
Data Access Layer (ORM/Query Builder)
       ↓
SQLite Database Engine
       ↓
File System Storage (data/hive-mind.db)
```

---

## Database Schema

### Core Tables
```sql
-- Agent registration and management
agents (
  id, name, type, capabilities, status, 
  created_at, updated_at, metadata
)

-- Coordination sessions
sessions (
  id, name, status, configuration, 
  started_at, ended_at, results
)

-- Task execution tracking
tasks (
  id, session_id, agent_id, description, 
  status, priority, created_at, completed_at
)

-- Performance metrics
metrics (
  id, entity_type, entity_id, metric_name, 
  value, timestamp, metadata
)

-- Memory storage
memory_items (
  id, namespace, key, value, type,
  created_at, updated_at, metadata
)
```

### Relationships
- **Sessions** → **Tasks** (one-to-many)
- **Agents** → **Tasks** (one-to-many)
- **Sessions** → **Metrics** (one-to-many)
- **Agents** → **Metrics** (one-to-many)

### Indexes
- Performance-optimized indexes on frequently queried columns
- Composite indexes for complex query patterns
- Full-text search indexes for content search
- Time-based indexes for historical queries

---

## Data Management

### Database Operations
```bash
# Connect to database
sqlite3 data/hive-mind.db

# View all tables
.tables

# Describe table structure
.schema agents

# Check database integrity
PRAGMA integrity_check;

# Optimize database
VACUUM;
```

### Backup and Recovery
```bash
# Create backup
sqlite3 data/hive-mind.db ".backup data/backup/hive-mind.db"

# Restore from backup
sqlite3 data/hive-mind.db ".restore data/backup/hive-mind.db"

# Export to SQL
sqlite3 data/hive-mind.db ".dump" > data/export/hive-mind.sql

# Import from SQL
sqlite3 data/new-hive-mind.db < data/export/hive-mind.sql
```

### Data Maintenance
- **Regular Vacuuming**: Optimize database file size and performance
- **Backup Rotation**: Daily backups with 30-day retention
- **Archive Old Data**: Move historical data to archive tables
- **Index Optimization**: Regular analysis and optimization of query performance

### Migration Support
```bash
# Check current schema version
sqlite3 data/hive-mind.db "SELECT value FROM config WHERE key='schema_version'"

# Apply migrations
claude-flow db migrate --target latest

# Rollback migration
claude-flow db rollback --steps 1
```

---

## Quick Reference

### Database Access
```bash
# CLI access to database
sqlite3 data/hive-mind.db

# Programmatic access
const db = new Database('data/hive-mind.db');

# Connection with Claude Flow
claude-flow db shell
```

### Common Queries
```sql
-- Active agents
SELECT * FROM agents WHERE status = 'active';

-- Recent sessions
SELECT * FROM sessions ORDER BY created_at DESC LIMIT 10;

-- Performance metrics
SELECT metric_name, AVG(value) FROM metrics 
WHERE timestamp > datetime('now', '-1 day') 
GROUP BY metric_name;

-- Memory usage
SELECT namespace, COUNT(*) as items, 
       SUM(length(value)) as total_size 
FROM memory_items GROUP BY namespace;
```

### Monitoring Commands
```bash
# Database file size
ls -lh data/hive-mind.db

# Table statistics
claude-flow db stats

# Connection count
claude-flow db connections

# Performance analysis
claude-flow db analyze --slow-queries
```

### Environment Variables
- `CLAUDE_FLOW_DB_PATH`: Custom database file location
- `CLAUDE_FLOW_DB_BACKUP`: Backup directory path
- `CLAUDE_FLOW_DB_MAX_SIZE`: Maximum database size limit
- `CLAUDE_FLOW_DB_CACHE_SIZE`: SQLite cache size setting

### Best Practices
- **Regular Backups**: Automate daily backup procedures
- **Connection Pooling**: Use connection pooling for high-load scenarios
- **Query Optimization**: Monitor and optimize slow queries
- **Data Retention**: Implement retention policies for historical data
- **Security**: Encrypt sensitive data at rest
- **Monitoring**: Set up alerts for database health and performance

### Troubleshooting
- **Database locked**: Check for long-running transactions
- **Corruption**: Run integrity check and restore from backup
- **Performance**: Analyze query plans and optimize indexes
- **Disk space**: Monitor database size and implement cleanup

---

*Last Updated: ${new Date().toISOString()}*

This data directory provides robust, persistent storage for Claude Flow's hive-mind coordination system, ensuring data integrity and optimal performance.

*Last Updated: 2025-08-23*
