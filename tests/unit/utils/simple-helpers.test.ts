/**
 * Simple test file that actually imports and exercises source code
 * This ensures we get meaningful code coverage metrics
 */

import { 
  add, 
  helloWorld, 
  generateId,
  delay,
  timeout
} from '../../../src/utils/helpers';

describe('Simple Helpers Tests', () => {
  describe('add function', () => {
    test('should add two positive numbers', () => {
      const result = add(2, 3);
      expect(result).toBe(5);
    });

    test('should add positive and negative numbers', () => {
      const result = add(10, -5);
      expect(result).toBe(5);
    });

    test('should handle zero', () => {
      const result = add(0, 7);
      expect(result).toBe(7);
    });

    test('should handle floating point numbers', () => {
      const result = add(1.5, 2.3);
      expect(result).toBeCloseTo(3.8);
    });
  });

  describe('helloWorld function', () => {
    test('should return Hello, World!', () => {
      const result = helloWorld();
      expect(result).toBe('Hello, World!');
    });
  });

  describe('generateId function', () => {
    test('should generate an ID without prefix', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(10);
      expect(id).toMatch(/^[0-9a-z_]+$/);
    });

    test('should generate an ID with prefix', () => {
      const id = generateId('test');
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^test_/);
      expect(id.length).toBeGreaterThan(15);
    });

    test('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    test('should generate unique IDs with same prefix', () => {
      const id1 = generateId('same');
      const id2 = generateId('same');
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^same_/);
      expect(id2).toMatch(/^same_/);
    });
  });

  describe('delay function', () => {
    test('should delay execution', async () => {
      const start = Date.now();
      await delay(50);
      const end = Date.now();
      const elapsed = end - start;
      expect(elapsed).toBeGreaterThanOrEqual(45); // Allow some variance
    });

    test('should return a promise', () => {
      const result = delay(10);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('timeout function', () => {
    test('should resolve if promise completes before timeout', async () => {
      const quickPromise = Promise.resolve('success');
      const result = await timeout(quickPromise, 100);
      expect(result).toBe('success');
    });

    test('should reject if promise takes too long', async () => {
      const slowPromise = new Promise(resolve => setTimeout(() => resolve('late'), 100));
      await expect(timeout(slowPromise, 50)).rejects.toThrow('Operation timed out');
    });

    test('should reject with custom message', async () => {
      const slowPromise = new Promise(resolve => setTimeout(() => resolve('late'), 100));
      await expect(timeout(slowPromise, 50, 'Custom timeout message'))
        .rejects.toThrow('Custom timeout message');
    });

    test('should handle promise rejection', async () => {
      const failingPromise = Promise.reject(new Error('Original error'));
      await expect(timeout(failingPromise, 100)).rejects.toThrow('Original error');
    });

    test('should handle promise rejection before timeout', async () => {
      const failingPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Delayed error')), 30)
      );
      await expect(timeout(failingPromise, 100)).rejects.toThrow('Delayed error');
    });
  });
});