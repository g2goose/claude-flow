#!/usr/bin/env node

/**
 * Documentation Update Script
 * Automatically updates documentation files with current information
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Get current package info
const packagePath = path.join(rootDir, 'package.json');
const packageInfo = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const version = packageInfo.version;
const today = new Date().toISOString().split('T')[0];

console.log(`🔄 Updating documentation for Claude-Flow v${version}...`);

async function updateDocumentation() {
  try {
    // 1. Update main README.md
    await updateMainReadme();
    
    // 2. Update all directory README files
    await updateDirectoryReadmes();
    
    // 3. Validate and fix common issues
    await fixCommonIssues();
    
    // 4. Generate summary
    await generateSummary();
    
    console.log('✅ Documentation update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating documentation:', error);
    process.exit(1);
  }
}

async function updateMainReadme() {
  const readmePath = path.join(rootDir, 'README.md');
  if (!fs.existsSync(readmePath)) {
    console.log('⚠️ Main README.md not found');
    return;
  }
  
  let content = fs.readFileSync(readmePath, 'utf8');
  
  // Update version references
  content = content.replace(
    /v2\.0\.0-alpha\.\d+/g,
    `v${version}`
  );
  
  // Update npm version in badges
  const alphaVersion = version.includes('-alpha') ? version.split('-alpha.')[1] : version;
  content = content.replace(
    /alpha\.90/g,
    `alpha.${alphaVersion}`
  );
  
  // Update timestamp
  const timestampRegex = /\*Last Updated: \d{4}-\d{2}-\d{2}\*/g;
  if (timestampRegex.test(content)) {
    content = content.replace(timestampRegex, `*Last Updated: ${today}*`);
  } else {
    // Add timestamp before closing div if not exists
    content = content.replace(
      /(\*\*Built by \[rUv\].*?\*\*\n)\n<\/div>/,
      `$1\n*Last Updated: ${today}*\n\n</div>`
    );
  }
  
  fs.writeFileSync(readmePath, content, 'utf8');
  console.log('✅ Updated main README.md');
}

async function updateDirectoryReadmes() {
  const readmeFiles = await glob('**/README.md', { 
    cwd: rootDir,
    ignore: ['node_modules/**', 'dist/**', 'build/**']
  });
  
  let updateCount = 0;
  
  for (const readmeFile of readmeFiles) {
    if (readmeFile === 'README.md') continue; // Skip root README
    
    const fullPath = path.join(rootDir, readmeFile);
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Update version references
    content = content.replace(
      /v2\.0\.0-alpha\.\d+/g,
      `v${version}`
    );
    
    // Update or add timestamp
    const timestampRegex = /\*Last Updated: \d{4}-\d{2}-\d{2}\*/g;
    if (timestampRegex.test(content)) {
      content = content.replace(timestampRegex, `*Last Updated: ${today}*`);
    } else {
      // Add timestamp at the end if not exists
      if (!content.trim().endsWith('*')) {
        content = content.trim() + `\n\n*Last Updated: ${today}*\n`;
      }
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      updateCount++;
    }
  }
  
  console.log(`✅ Updated ${updateCount} directory README files`);
}

async function fixCommonIssues() {
  const mdFiles = await glob('**/*.md', { 
    cwd: rootDir,
    ignore: ['node_modules/**', 'dist/**', 'build/**', 'archive/**']
  });
  
  let fixedCount = 0;
  const issues = [];
  
  for (const mdFile of mdFiles) {
    const fullPath = path.join(rootDir, mdFile);
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Fix common broken references
    const fixes = [
      {
        pattern: /\]\(implementation-roadmap\.md\)/g,
        replacement: '](archive/superseded/implementation-roadmap.md)',
        description: 'Fixed implementation-roadmap.md reference'
      },
      {
        pattern: /\]\(REPOSITORY_REVIEW_FINAL_REPORT\.md\)/g,
        replacement: '](archive/superseded/REPOSITORY_REVIEW_FINAL_REPORT.md)',
        description: 'Fixed REPOSITORY_REVIEW_FINAL_REPORT.md reference'
      },
      {
        pattern: /\]\(DOCUMENTATION_CLEANUP_SUMMARY\.md\)/g,
        replacement: '](archive/superseded/DOCUMENTATION_CLEANUP_SUMMARY.md)',
        description: 'Fixed DOCUMENTATION_CLEANUP_SUMMARY.md reference'
      },
      {
        pattern: /github\.com\/ruvnet\/claude-code-flow/g,
        replacement: 'github.com/g2goose/claude-flow',
        description: 'Updated GitHub repository URL'
      },
      {
        pattern: /ruvnet\/claude-code-flow/g,
        replacement: 'g2goose/claude-flow',
        description: 'Updated GitHub repository reference'
      }
    ];
    
    for (const fix of fixes) {
      if (fix.pattern.test(content)) {
        content = content.replace(fix.pattern, fix.replacement);
        issues.push(`${mdFile}: ${fix.description}`);
      }
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      fixedCount++;
    }
  }
  
  if (fixedCount > 0) {
    console.log(`✅ Fixed common issues in ${fixedCount} files:`);
    issues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log('✅ No common issues found to fix');
  }
}

async function generateSummary() {
  const mdFiles = await glob('**/*.md', { 
    cwd: rootDir,
    ignore: ['node_modules/**', 'dist/**', 'build/**']
  });
  
  const readmeFiles = mdFiles.filter(f => f.endsWith('README.md'));
  
  const summary = {
    version,
    updateDate: today,
    totalMarkdownFiles: mdFiles.length,
    readmeFiles: readmeFiles.length,
    directories: {
      docs: fs.existsSync(path.join(rootDir, 'docs')),
      examples: fs.existsSync(path.join(rootDir, 'examples')),
      archive: fs.existsSync(path.join(rootDir, 'archive')),
      src: fs.existsSync(path.join(rootDir, 'src'))
    }
  };
  
  console.log('\n📊 Documentation Summary:');
  console.log(`  Version: ${summary.version}`);
  console.log(`  Update Date: ${summary.updateDate}`);
  console.log(`  Total Markdown Files: ${summary.totalMarkdownFiles}`);
  console.log(`  README Files: ${summary.readmeFiles}`);
  console.log('  Directory Structure: ✅ Complete');
  
  // Save summary to file
  const summaryPath = path.join(rootDir, 'docs', 'documentation-update-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`  Summary saved: ${summaryPath}`);
}

// Run the update
updateDocumentation();