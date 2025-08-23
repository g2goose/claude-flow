# Documentation Maintenance Guide

This guide explains how the automated documentation system works and how to maintain it.

## 🤖 Automated Documentation System

The Claude-Flow repository now includes an automated documentation maintenance system that keeps all markdown files synchronized and up-to-date.

### Key Components

1. **GitHub Workflow** (`.github/workflows/documentation-sync.yml`)
   - Runs automatically on code changes
   - Validates and updates documentation
   - Fixes broken links and references
   - Updates version numbers and timestamps

2. **Update Script** (`scripts/update-documentation.js`)
   - Updates version references across all files
   - Fixes common broken references
   - Adds/updates timestamps
   - Generates summary reports

3. **Validation Script** (`scripts/validate-documentation.js`)
   - Validates internal links
   - Checks version consistency
   - Identifies broken references
   - Ensures README structure compliance

### NPM Scripts

```bash
# Update all documentation
npm run update-docs

# Validate documentation
npm run validate-docs
```

## 🔄 Automatic Triggers

The documentation system automatically runs when:

- **Code Changes**: Push to main/master branches
- **Pull Requests**: Validation on all PRs
- **Scheduled**: Weekly maintenance (Sundays at 2 AM UTC)
- **Manual**: Workflow dispatch for immediate updates

## 📝 What Gets Updated

### Version References
- Package version in badges and text
- Alpha version numbers in documentation
- Release notes and changelogs

### Link Validation
- Internal markdown links
- Cross-references between files
- Anchor links within documents

### Common Fixes
- References to moved files (archive/superseded/)
- GitHub repository URL updates
- Broken internal documentation links

### Timestamps
- "Last Updated" timestamps in README files
- Documentation generation dates
- Version history tracking

## 🛠️ Manual Maintenance

### Updating Documentation
```bash
# Run full documentation update
npm run update-docs

# Check for issues
npm run validate-docs

# View summary
cat docs/documentation-update-summary.json
```

### Adding New Documentation
When adding new markdown files:

1. **Follow naming conventions**: Use lowercase with hyphens
2. **Include metadata**: Add "Last Updated" timestamp
3. **Update references**: Update any files that should link to the new content
4. **Test links**: Run validation script to check for issues

### Directory Structure
The system maintains READMEs for key directories:
- All major source directories (`src/`, `docs/`, etc.)
- Integration directories (`.hive-mind/`, `data/`, etc.)
- Archive and legacy directories
- Example and tutorial directories

## 🔍 Monitoring and Troubleshooting

### GitHub Actions
Monitor the documentation workflow in the Actions tab:
- Check for failures or warnings
- Review automated commits
- Validate workflow execution logs

### Common Issues

**Broken Links:**
- Usually caused by moved or renamed files
- Check the validation script output
- Update references manually if needed

**Version Inconsistencies:**
- Ensure `package.json` version is correct
- Run update script after version changes
- Check for hardcoded version references

**Missing READMEs:**
- Create missing README files for important directories
- Follow existing README structure and format
- Include proper metadata and timestamps

### Debugging
```bash
# Enable debug mode
export CLAUDE_FLOW_DEBUG=true

# Run with verbose output
npm run validate-docs

# Check specific files
node scripts/validate-documentation.js --file README.md
```

## 🎯 Best Practices

### Writing Documentation
- **Clear Structure**: Use consistent heading hierarchy
- **Internal Links**: Link to related documentation
- **Examples**: Include practical usage examples
- **Maintenance**: Keep content current and accurate

### Link Management
- **Relative Paths**: Use relative paths for internal links
- **Anchor Links**: Use proper anchor formatting
- **Testing**: Always test links after changes

### Version Control
- **Atomic Commits**: Group documentation changes logically
- **Descriptive Messages**: Use clear commit messages
- **Review Process**: Include documentation in code reviews

## 📊 Metrics and Reporting

The system tracks:
- **Total Files**: Count of all markdown files
- **README Files**: Directory-specific documentation
- **Link Health**: Broken vs working links
- **Update Frequency**: Documentation freshness

View current metrics:
```bash
cat docs/documentation-update-summary.json
```

## 🔧 Configuration

### Workflow Configuration
Edit `.github/workflows/documentation-sync.yml` to:
- Change update frequency
- Modify validation rules
- Add custom checks
- Configure notifications

### Script Configuration
Modify `scripts/update-documentation.js` to:
- Add new file patterns
- Include additional fixes
- Change version update logic
- Customize output format

## 🆘 Getting Help

If you encounter issues:

1. **Check Workflow Logs**: GitHub Actions provide detailed logs
2. **Run Local Validation**: Use `npm run validate-docs`
3. **Review Common Issues**: Check this guide's troubleshooting section
4. **Manual Fixes**: Update documentation manually when needed
5. **Report Problems**: Create GitHub issues for persistent problems

---

*This documentation maintenance system ensures Claude-Flow's extensive documentation (277+ markdown files) stays accurate and accessible.*

*Last Updated: 2025-08-23*