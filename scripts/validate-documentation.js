#!/usr/bin/env node

/**
 * Documentation Validation Script
 * Validates that all documentation is consistent and up-to-date
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

console.log(`🔍 Validating documentation for Claude-Flow v${version}...`);

let hasErrors = false;
const issues = [];

async function validateDocumentation() {
  try {
    // 1. Check version consistency
    await checkVersionConsistency();
    
    // 2. Validate internal links
    await validateInternalLinks();
    
    // 3. Check for broken references
    await checkBrokenReferences();
    
    // 4. Validate README structure
    await validateReadmeStructure();
    
    // Report results
    if (hasErrors) {
      console.log('\n❌ Documentation validation failed:');
      issues.forEach(issue => console.log(`  - ${issue}`));
      process.exit(1);
    } else {
      console.log('\n✅ All documentation validation checks passed!');
    }
    
  } catch (error) {
    console.error('❌ Error during validation:', error);
    process.exit(1);
  }
}

async function checkVersionConsistency() {
  console.log('🔍 Checking version consistency...');
  
  const filesToCheck = [
    'README.md',
    'docs/README.md',
    'src/README.md'
  ];
  
  for (const file of filesToCheck) {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for old version references
      const oldVersions = content.match(/v2\.0\.0-alpha\.(?!90)[0-9]+/g);
      if (oldVersions) {
        hasErrors = true;
        issues.push(`${file}: Contains outdated version references: ${oldVersions.join(', ')}`);
      }
    }
  }
  
  console.log('✅ Version consistency check completed');
}

async function validateInternalLinks() {
  console.log('🔍 Validating internal links...');
  
  const mdFiles = await glob('**/*.md', { 
    cwd: rootDir,
    ignore: ['node_modules/**', 'dist/**', 'build/**']
  });
  
  for (const mdFile of mdFiles) {
    const filePath = path.join(rootDir, mdFile);
    const content = fs.readFileSync(filePath, 'utf8');
    const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      const [, text, link] = match;
      
      // Skip external links, anchors, and email links
      if (link.startsWith('http') || link.startsWith('#') || link.startsWith('mailto:')) {
        continue;
      }
      
      // Check if local file exists
      const linkPath = path.resolve(path.dirname(filePath), link);
      if (!fs.existsSync(linkPath)) {
        hasErrors = true;
        issues.push(`${mdFile}: Broken link to ${link}`);
      }
    }
  }
  
  console.log('✅ Internal links validation completed');
}

async function checkBrokenReferences() {
  console.log('🔍 Checking for broken references...');
  
  const commonBrokenRefs = [
    'implementation-roadmap.md',
    'REPOSITORY_REVIEW_FINAL_REPORT.md',
    'DOCUMENTATION_CLEANUP_SUMMARY.md'
  ];
  
  const mdFiles = await glob('**/*.md', { 
    cwd: rootDir,
    ignore: ['node_modules/**', 'dist/**', 'build/**', 'archive/**']
  });
  
  for (const mdFile of mdFiles) {
    const filePath = path.join(rootDir, mdFile);
    const content = fs.readFileSync(filePath, 'utf8');
    
    for (const ref of commonBrokenRefs) {
      const pattern = new RegExp(`\\]\\(${ref}\\)`, 'g');
      if (pattern.test(content)) {
        hasErrors = true;
        issues.push(`${mdFile}: Contains reference to moved file ${ref} (should be in archive/superseded/)`);
      }
    }
    
    // Check for old GitHub repo references
    if (content.includes('ruvnet/claude-code-flow')) {
      hasErrors = true;
      issues.push(`${mdFile}: Contains old GitHub repository reference`);
    }
  }
  
  console.log('✅ Broken references check completed');
}

async function validateReadmeStructure() {
  console.log('🔍 Validating README structure...');
  
  const mainReadme = path.join(rootDir, 'README.md');
  if (fs.existsSync(mainReadme)) {
    const content = fs.readFileSync(mainReadme, 'utf8');
    
    // Check for required sections
    const requiredSections = [
      '## 📖 Introduction',
      '## 📚 Table of Contents',
      '## ⚡ **Try v2.0.0 Alpha in 4 Commands**',
      '## 🚀 Key Capabilities and Specifications'
    ];
    
    for (const section of requiredSections) {
      if (!content.includes(section)) {
        hasErrors = true;
        issues.push(`README.md: Missing required section: ${section}`);
      }
    }
    
    // Check for Last Updated timestamp
    if (!content.includes('*Last Updated:')) {
      hasErrors = true;
      issues.push('README.md: Missing Last Updated timestamp');
    }
  }
  
  console.log('✅ README structure validation completed');
}

// Run validation
validateDocumentation();