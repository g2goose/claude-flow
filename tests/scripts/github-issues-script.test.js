/**
 * Test for GitHub Issues Creation Script
 * 
 * This test verifies that the create-github-issues.sh script works correctly
 * in dry-run mode and handles error cases appropriately.
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('GitHub Issues Creation Script', () => {
  const scriptPath = path.join(process.cwd(), 'scripts', 'create-github-issues.sh');
  
  beforeAll(() => {
    // Ensure the script exists and is executable
    expect(fs.existsSync(scriptPath)).toBe(true);
    
    // Make sure it's executable
    try {
      execSync(`chmod +x "${scriptPath}"`, { stdio: 'ignore' });
    } catch (error) {
      // Ignore chmod errors (might already be executable)
    }
  });

  test('script should exist and be executable', () => {
    expect(fs.existsSync(scriptPath)).toBe(true);
    
    // Check if file is executable
    const stats = fs.statSync(scriptPath);
    expect(stats.mode & parseInt('111', 8)).toBeTruthy(); // Check if any execute bit is set
  });

  test('dry-run mode should work without GitHub CLI authentication', () => {
    const result = execSync(`"${scriptPath}" --dry-run`, { 
      encoding: 'utf8',
      cwd: process.cwd(),
      timeout: 30000
    });
    
    // Check for expected output elements
    expect(result).toContain('🔍 DRY RUN MODE - No issues will be created');
    expect(result).toContain('🚀 GitHub Issues Creator (Bash)');
    expect(result).toContain('Repository: g2goose/claude-flow');
    expect(result).toContain('Assignee: @g2goose');
    expect(result).toContain('Would create standard labels if missing');
    expect(result).toContain('Would create issue:');
    expect(result).toContain('[CRITICAL] CI/CD Pipeline failing');
    expect(result).toContain('[HIGH] Verification Pipeline tests failing');
    expect(result).toContain('[MEDIUM] Truth Scoring Pipeline likely failing');
    expect(result).toContain('[MEDIUM] Integration Tests infrastructure');
    expect(result).toContain('[MEDIUM] Docker Build workflow failing');
    expect(result).toContain('[LOW] Status Badge and Rollback Manager');
    expect(result).toContain('🎉 All issues have been assigned to @g2goose as requested!');
    expect(result).toContain('To actually create the issues, run:');
    expect(result).toContain('npm run create-issues:bash');
  });

  test('script should handle missing GitHub CLI gracefully', () => {
    // This test checks error handling when gh is not authenticated
    try {
      const result = execSync(`"${scriptPath}"`, { 
        encoding: 'utf8',
        cwd: process.cwd(),
        timeout: 10000
      });
      
      // If it succeeds, it should show the authentication error
      expect(result).toContain('❌ GitHub CLI not authenticated');
      
    } catch (error) {
      if (error.status === 1) {
        // Expected exit code when gh is not found or not authenticated
        const output = error.stdout || error.stderr || '';
        expect(output).toMatch(/❌ GitHub CLI not (found|authenticated)/);
      } else {
        throw error;
      }
    }
  });

  test('script should validate expected labels are included', () => {
    const result = execSync(`"${scriptPath}" --dry-run`, { 
      encoding: 'utf8',
      cwd: process.cwd(),
      timeout: 30000
    });
    
    // Check that all expected labels are mentioned
    const expectedLabels = [
      'bug,high-priority,ci/cd,typescript',
      'bug,high-priority,testing,verification',
      'bug,medium-priority,verification,truth-scoring',
      'bug,medium-priority,testing,infrastructure',
      'bug,medium-priority,docker,build',
      'enhancement,low-priority,workflows'
    ];
    
    expectedLabels.forEach(labelSet => {
      expect(result).toContain(`Labels: ${labelSet}`);
    });
  });

  test('script should reference correct repository and assignee', () => {
    const result = execSync(`"${scriptPath}" --dry-run`, { 
      encoding: 'utf8',
      cwd: process.cwd(),
      timeout: 30000
    });
    
    expect(result).toContain('Repository: g2goose/claude-flow');
    expect(result).toContain('Assignee: @g2goose');
    
    // All issues should be assigned to g2goose
    const issueMatches = result.match(/Would create issue:/g);
    const issueAssigneeMatches = result.match(/  Assignee: @g2goose/g); // indented assignee lines for issues
    
    expect(issueMatches).toBeTruthy();
    expect(issueAssigneeMatches).toBeTruthy();
    expect(issueAssigneeMatches.length).toBe(issueMatches.length);
  });

  test('script should have all 6 expected issues', () => {
    const result = execSync(`"${scriptPath}" --dry-run`, { 
      encoding: 'utf8',
      cwd: process.cwd(),
      timeout: 30000
    });
    
    const issueMatches = result.match(/Would create issue:/g);
    expect(issueMatches).toBeTruthy();
    expect(issueMatches.length).toBe(6);
    
    // Check each specific issue title
    expect(result).toContain('[CRITICAL] CI/CD Pipeline failing with 1078 TypeScript compilation errors');
    expect(result).toContain('[HIGH] Verification Pipeline tests failing with type compilation errors');
    expect(result).toContain('[MEDIUM] Truth Scoring Pipeline likely failing due to verification system dependencies');
    expect(result).toContain('[MEDIUM] Integration Tests infrastructure needs reorganization');
    expect(result).toContain('[MEDIUM] Docker Build workflow failing due to TypeScript compilation issues');
    expect(result).toContain('[LOW] Status Badge and Rollback Manager workflows need verification');
  });
});