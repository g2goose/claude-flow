# Windows Installation Guide

This guide provides step-by-step instructions for installing and configuring Claude-Flow on Windows systems.

## Prerequisites

- **Windows 10** or **Windows 11**
- **Node.js 18+** (LTS recommended)
- **npm 9+** or **pnpm** (recommended)
- **PowerShell 5.1+** or **PowerShell Core 7+**

## Installation Options

### Option 1: Using pnpm (Recommended)

pnpm handles Windows native dependencies better than npm:

```powershell
# Install pnpm globally
npm install -g pnpm

# Install Claude Flow
pnpm install -g claude-flow@alpha

# Or use directly without installation
pnpx claude-flow@alpha init --force
```

### Option 2: Using npm

```powershell
# Install Claude Code first (required)
npm install -g @anthropic-ai/claude-code

# Install Claude Flow
npm install -g claude-flow@alpha

# Initialize
npx claude-flow@alpha init --force
```

## Windows-Specific Configuration

### SQLite Considerations

On Windows, Claude Flow may fall back to in-memory storage if SQLite native modules fail to install:

- **Features still work**: All functionality remains available
- **Data persistence**: Session data won't persist between restarts
- **Solution**: Use the Docker setup for persistent storage

### PowerShell Execution Policy

If you encounter execution policy errors:

```powershell
# Check current policy
Get-ExecutionPolicy

# Set policy for current user (recommended)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Alternative: Bypass for single session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

### Windows Defender / Antivirus

Add exclusions for Claude Flow directories:

1. Open Windows Security
2. Go to Virus & threat protection
3. Add exclusions for:
   - `%APPDATA%\npm\node_modules\claude-flow`
   - `%USERPROFILE%\.claude-flow`
   - Your project directories

## Quick Start

```powershell
# 1. Initialize Claude Flow
npx claude-flow@alpha init --force

# 2. Test installation
npx claude-flow@alpha --help

# 3. Start a simple task
npx claude-flow@alpha swarm "create a hello world app" --claude
```

## Troubleshooting

### Common Issues

**Issue**: `npm ERR! gyp ERR! build error`
**Solution**: Use pnpm instead of npm, or use Docker setup

**Issue**: `Execution of scripts is disabled on this system`
**Solution**: Set PowerShell execution policy (see above)

**Issue**: SQLite database errors
**Solution**: Claude Flow will automatically use in-memory storage. Features work normally.

**Issue**: Permission denied errors
**Solution**: Run PowerShell as Administrator or adjust execution policy

### Getting Help

- Check the [troubleshooting section](../Docker-Readme.md#troubleshooting) in Docker-Readme.md
- Open an issue on [GitHub](https://github.com/g2goose/claude-flow/issues)
- See the [Docker setup guide](../Docker-Readme.md) for alternative installation

## Alternative: Docker Setup

For the most reliable Windows experience, consider using Docker:

```powershell
# See Docker-Readme.md for complete instructions
docker compose up -d
```

This provides:
- Consistent cross-platform behavior
- Persistent SQLite storage
- Easier troubleshooting
- Better resource isolation

## Next Steps

After installation:

1. Review the [User Guide](USER_GUIDE.md)
2. Check [Architecture Overview](ARCHITECTURE.md)
3. Try the [examples](../examples/)
4. Join the [community discussions](https://github.com/g2goose/claude-flow/discussions)