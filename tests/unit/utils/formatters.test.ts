/**
 * Tests for formatter utility functions
 * Demonstrates scaling coverage with comprehensive testing
 */

import {
  formatDuration,
  formatBytes,
  formatPercentage,
  formatNumber,
  formatRelativeTime,
  formatUptime,
  formatRate,
  truncate,
  formatStatus,
  formatHealth,
  formatMetric
} from '../../../src/utils/formatters';

describe('Formatters Tests', () => {
  describe('formatDuration', () => {
    test('should format milliseconds', () => {
      expect(formatDuration(500)).toBe('500ms');
      expect(formatDuration(999)).toBe('999ms');
    });

    test('should format seconds', () => {
      expect(formatDuration(1000)).toBe('1s');
      expect(formatDuration(5500)).toBe('6s');
      expect(formatDuration(59000)).toBe('59s');
    });

    test('should format minutes', () => {
      expect(formatDuration(60000)).toBe('1m');
      expect(formatDuration(150000)).toBe('3m');
      expect(formatDuration(3540000)).toBe('59m');
    });

    test('should format hours', () => {
      expect(formatDuration(3600000)).toBe('1h');
      expect(formatDuration(7200000)).toBe('2h');
      expect(formatDuration(82800000)).toBe('23h');
    });

    test('should format days', () => {
      expect(formatDuration(86400000)).toBe('1d');
      expect(formatDuration(172800000)).toBe('2d');
    });
  });

  describe('formatBytes', () => {
    test('should format zero bytes', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    test('should format bytes', () => {
      expect(formatBytes(500)).toBe('500 B');
      expect(formatBytes(1023)).toBe('1023 B');
    });

    test('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
    });

    test('should format megabytes', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(2621440)).toBe('2.5 MB');
    });

    test('should format gigabytes', () => {
      expect(formatBytes(1073741824)).toBe('1 GB');
    });
  });

  describe('formatPercentage', () => {
    test('should format percentage with default decimals', () => {
      expect(formatPercentage(0.1234)).toBe('12.3%');
      expect(formatPercentage(0.5)).toBe('50.0%');
    });

    test('should format percentage with custom decimals', () => {
      expect(formatPercentage(0.1234, 2)).toBe('12.34%');
      expect(formatPercentage(0.1234, 0)).toBe('12%');
    });
  });

  describe('formatNumber', () => {
    test('should format numbers with localeString', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1234567)).toBe('1,234,567');
    });
  });

  describe('formatRelativeTime', () => {
    test('should format recent times', () => {
      const now = new Date();
      const recent = new Date(now.getTime() - 30000); // 30 seconds ago
      expect(formatRelativeTime(recent)).toBe('just now');
    });

    test('should format minutes ago', () => {
      const now = new Date();
      const minutesAgo = new Date(now.getTime() - 300000); // 5 minutes ago
      expect(formatRelativeTime(minutesAgo)).toBe('5m ago');
    });

    test('should format hours ago', () => {
      const now = new Date();
      const hoursAgo = new Date(now.getTime() - 7200000); // 2 hours ago
      expect(formatRelativeTime(hoursAgo)).toBe('2h ago');
    });

    test('should format days ago', () => {
      const now = new Date();
      const daysAgo = new Date(now.getTime() - 172800000); // 2 days ago
      expect(formatRelativeTime(daysAgo)).toBe('2d ago');
    });
  });

  describe('formatUptime', () => {
    test('should format uptime', () => {
      const startTime = new Date(Date.now() - 5000); // 5 seconds ago
      const uptime = formatUptime(startTime);
      expect(uptime).toMatch(/\d+[smhd]/); // Should match any duration format
    });
  });

  describe('formatRate', () => {
    test('should format sub-second rates', () => {
      expect(formatRate(0.5)).toBe('500.0/s');
    });

    test('should format per-second rates', () => {
      expect(formatRate(5.5)).toBe('5.5/s');
      expect(formatRate(45)).toBe('45.0/s');
    });

    test('should format per-minute rates', () => {
      expect(formatRate(120)).toBe('2.0/min');
    });
  });

  describe('truncate', () => {
    test('should not truncate short strings', () => {
      expect(truncate('short', 10)).toBe('short');
    });

    test('should truncate long strings', () => {
      expect(truncate('this is a very long string', 10)).toBe('this is...');
    });

    test('should handle exact length', () => {
      expect(truncate('exactly10!', 10)).toBe('exactly10!');
    });
  });

  describe('formatStatus', () => {
    test('should capitalize first letter and lowercase rest', () => {
      expect(formatStatus('ACTIVE')).toBe('Active');
      expect(formatStatus('inactive')).toBe('Inactive');
      expect(formatStatus('PenDing')).toBe('Pending');
    });
  });

  describe('formatHealth', () => {
    test('should format healthy status', () => {
      expect(formatHealth(0.95)).toBe('🟢 95%');
      expect(formatHealth(0.8)).toBe('🟢 80%');
    });

    test('should format warning status', () => {
      expect(formatHealth(0.5)).toBe('🟡 50%');
      expect(formatHealth(0.35)).toBe('🟡 35%');
    });

    test('should format critical status', () => {
      expect(formatHealth(0.2)).toBe('🔴 20%');
      expect(formatHealth(0.1)).toBe('🔴 10%');
    });
  });

  describe('formatMetric', () => {
    test('should format small values', () => {
      expect(formatMetric(500, 'ops')).toBe('500.0 ops');
      expect(formatMetric(999, 'req')).toBe('999.0 req');
    });

    test('should format thousands', () => {
      expect(formatMetric(1500, 'ops')).toBe('1.5K ops');
      expect(formatMetric(50000, 'req')).toBe('50.0K req');
    });

    test('should format millions', () => {
      expect(formatMetric(1500000, 'ops')).toBe('1.5M ops');
      expect(formatMetric(5000000, 'req')).toBe('5.0M req');
    });
  });
});