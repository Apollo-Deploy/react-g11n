/**
 * Interpolator Tests
 * 
 * Tests for variable interpolation in translation strings
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Interpolator } from '../../../src/core/interpolator';

describe('Interpolator', () => {
  let interpolator: Interpolator;

  beforeEach(() => {
    interpolator = new Interpolator();
  });

  describe('basic variable interpolation', () => {
    it('should interpolate a single variable', () => {
      const result = interpolator.interpolate('Hello {{name}}', { name: 'World' });
      expect(result).toBe('Hello World');
    });

    it('should interpolate multiple variables', () => {
      const result = interpolator.interpolate('{{greeting}} {{name}}!', {
        greeting: 'Hello',
        name: 'World',
      });
      expect(result).toBe('Hello World!');
    });

    it('should handle variables with spaces around them', () => {
      const result = interpolator.interpolate('Hello {{ name }}', { name: 'World' });
      expect(result).toBe('Hello World');
    });

    it('should interpolate variables in the middle of text', () => {
      const result = interpolator.interpolate('The {{item}} is {{color}}', {
        item: 'car',
        color: 'red',
      });
      expect(result).toBe('The car is red');
    });
  });

  describe('custom delimiters', () => {
    it('should support custom prefix and suffix', () => {
      const customInterpolator = new Interpolator({
        prefix: '${',
        suffix: '}',
      });
      const result = customInterpolator.interpolate('Hello ${name}', { name: 'World' });
      expect(result).toBe('Hello World');
    });

    it('should support different custom delimiters', () => {
      const customInterpolator = new Interpolator({
        prefix: '<<',
        suffix: '>>',
      });
      const result = customInterpolator.interpolate('Hello <<name>>', { name: 'World' });
      expect(result).toBe('Hello World');
    });
  });

  describe('nested object access', () => {
    it('should access nested properties with dot notation', () => {
      const result = interpolator.interpolate('Hello {{user.name}}', {
        user: { name: 'Alice' },
      });
      expect(result).toBe('Hello Alice');
    });

    it('should access deeply nested properties', () => {
      const result = interpolator.interpolate('{{user.address.city}}', {
        user: { address: { city: 'New York' } },
      });
      expect(result).toBe('New York');
    });

    it('should handle multiple nested properties', () => {
      const result = interpolator.interpolate('{{user.name}} lives in {{user.address.city}}', {
        user: { name: 'Bob', address: { city: 'Paris' } },
      });
      expect(result).toBe('Bob lives in Paris');
    });
  });

  describe('HTML escaping', () => {
    it('should escape HTML special characters by default', () => {
      const result = interpolator.interpolate('{{content}}', {
        content: '<script>alert("xss")</script>',
      });
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    it('should escape ampersands', () => {
      const result = interpolator.interpolate('{{text}}', { text: 'Tom & Jerry' });
      expect(result).toBe('Tom &amp; Jerry');
    });

    it('should escape quotes', () => {
      const result = interpolator.interpolate('{{text}}', { text: 'Say "hello"' });
      expect(result).toBe('Say &quot;hello&quot;');
    });

    it('should not escape when escapeValue is false', () => {
      const noEscapeInterpolator = new Interpolator({ escapeValue: false });
      const result = noEscapeInterpolator.interpolate('{{content}}', {
        content: '<b>bold</b>',
      });
      expect(result).toBe('<b>bold</b>');
    });
  });

  describe('missing variable handling', () => {
    it('should return placeholder when variable is missing', () => {
      const result = interpolator.interpolate('Hello {{name}}', {});
      expect(result).toBe('Hello {{name}}');
    });

    it('should return placeholder for undefined values', () => {
      const result = interpolator.interpolate('Hello {{name}}', { name: undefined });
      expect(result).toBe('Hello {{name}}');
    });

    it('should return placeholder for null values', () => {
      const result = interpolator.interpolate('Hello {{name}}', { name: null });
      expect(result).toBe('Hello {{name}}');
    });

    it('should warn about missing variables in development', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      interpolator.interpolate('Hello {{name}} and {{age}}', {});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing interpolation values')
      );

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      const result = interpolator.interpolate('', { name: 'World' });
      expect(result).toBe('');
    });

    it('should handle strings with no variables', () => {
      const result = interpolator.interpolate('Hello World', { name: 'Alice' });
      expect(result).toBe('Hello World');
    });

    it('should handle empty values object', () => {
      const result = interpolator.interpolate('Hello {{name}}', {});
      expect(result).toBe('Hello {{name}}');
    });

    it('should convert numbers to strings', () => {
      const result = interpolator.interpolate('Count: {{count}}', { count: 42 });
      expect(result).toBe('Count: 42');
    });

    it('should convert booleans to strings', () => {
      const result = interpolator.interpolate('Active: {{active}}', { active: true });
      expect(result).toBe('Active: true');
    });

    it('should handle special characters in values', () => {
      const result = interpolator.interpolate('{{text}}', { text: '!@#$%^&*()' });
      expect(result).toBe('!@#$%^&amp;*()');
    });

    it('should handle nested property access on non-objects', () => {
      const result = interpolator.interpolate('{{user.name}}', { user: 'string' });
      expect(result).toBe('{{user.name}}');
    });

    it('should handle nested property access on null', () => {
      const result = interpolator.interpolate('{{user.name}}', { user: null });
      expect(result).toBe('{{user.name}}');
    });
  });
});
