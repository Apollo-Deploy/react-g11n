/**
 * Formatting tests
 * 
 * Tests for:
 * - Date formatting
 * - Number formatting
 * - Currency formatting
 * - Relative time formatting
 * - List formatting
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FormatService } from '../../src/core/format-service';

describe('Formatting', () => {
  let formatService: FormatService;
  const testDate = new Date('2024-01-15T10:30:00Z');

  beforeEach(() => {
    formatService = new FormatService('en');
  });

  describe('Date Formatting', () => {
    it('should format date in short format', () => {
      const result = formatService.date(testDate, 'short');
      expect(result).toMatch(/1\/15\/2024|15\/1\/2024/); // Different locales may vary
    });

    it('should format date in medium format', () => {
      const result = formatService.date(testDate, 'medium');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should format date in long format', () => {
      const result = formatService.date(testDate, 'long');
      expect(result).toContain('January');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should format date in full format', () => {
      const result = formatService.date(testDate, 'full');
      expect(result).toContain('January');
      expect(result).toContain('15');
      expect(result).toContain('2024');
      expect(result).toMatch(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/);
    });

    it('should format date according to locale', () => {
      const enService = new FormatService('en');
      const esService = new FormatService('es');
      const frService = new FormatService('fr');

      const enResult = enService.date(testDate, 'long');
      const esResult = esService.date(testDate, 'long');
      const frResult = frService.date(testDate, 'long');

      expect(enResult).toContain('January');
      expect(esResult).toContain('enero');
      expect(frResult).toContain('janvier');
    });

    it('should use medium format by default', () => {
      const result = formatService.date(testDate);
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });
  });

  describe('Time Formatting', () => {
    it('should format time in short format', () => {
      const result = formatService.time(testDate, 'short');
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should format time in medium format', () => {
      const result = formatService.time(testDate, 'medium');
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    it('should format time in long format', () => {
      const result = formatService.time(testDate, 'long');
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    it('should format time according to locale', () => {
      const enService = new FormatService('en');
      const result = enService.time(testDate, 'short');
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('DateTime Formatting', () => {
    it('should format datetime in short format', () => {
      const result = formatService.dateTime(testDate, 'short');
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should format datetime in medium format', () => {
      const result = formatService.dateTime(testDate, 'medium');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2024');
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    it('should format datetime in long format', () => {
      const result = formatService.dateTime(testDate, 'long');
      expect(result).toContain('January');
      expect(result).toContain('15');
      expect(result).toContain('2024');
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    it('should use medium format by default', () => {
      const result = formatService.dateTime(testDate);
      expect(result).toContain('Jan');
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });
  });

  describe('Relative Time Formatting', () => {
    it('should format time in seconds', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 30 * 1000); // 30 seconds ago
      const result = formatService.relativeTime(past, now);
      expect(result).toMatch(/30 seconds ago|30 sec\. ago/);
    });

    it('should format time in minutes', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
      const result = formatService.relativeTime(past, now);
      expect(result).toMatch(/5 minutes ago|5 min\. ago/);
    });

    it('should format time in hours', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
      const result = formatService.relativeTime(past, now);
      expect(result).toMatch(/3 hours ago|3 hr\. ago/);
    });

    it('should format time in days', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      const result = formatService.relativeTime(past, now);
      expect(result).toMatch(/2 days ago/);
    });

    it('should format future time', () => {
      const now = new Date();
      const future = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
      const result = formatService.relativeTime(future, now);
      expect(result).toMatch(/in 5 minutes|in 5 min\./);
    });

    it('should use current time as base by default', () => {
      const past = new Date(Date.now() - 60 * 1000); // 1 minute ago
      const result = formatService.relativeTime(past);
      expect(result).toMatch(/1 minute ago|1 min\. ago/);
    });

    it('should format relative time according to locale', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

      const enService = new FormatService('en');
      const esService = new FormatService('es');
      const frService = new FormatService('fr');

      const enResult = enService.relativeTime(past, now);
      const esResult = esService.relativeTime(past, now);
      const frResult = frService.relativeTime(past, now);

      expect(enResult).toMatch(/2 days ago/);
      // Spanish may use "anteayer" (day before yesterday) or "hace 2 días" depending on implementation
      expect(esResult).toMatch(/hace 2 días|anteayer/);
      // French may use "avant-hier" (day before yesterday) or "il y a 2 jours" depending on implementation
      expect(frResult).toMatch(/il y a 2 jours|avant-hier/);
    });
  });

  describe('Number Formatting', () => {
    it('should format numbers according to locale', () => {
      const enService = new FormatService('en');
      const deService = new FormatService('de');

      const enResult = enService.number(1234.56);
      const deResult = deService.number(1234.56);

      expect(enResult).toBe('1,234.56');
      expect(deResult).toBe('1.234,56');
    });

    it('should format large numbers', () => {
      const result = formatService.number(1000000);
      expect(result).toBe('1,000,000');
    });

    it('should format decimal numbers', () => {
      const result = formatService.number(123.456);
      expect(result).toBe('123.456');
    });

    it('should format numbers with custom options', () => {
      const result = formatService.number(0.123, {
        style: 'percent',
      });
      expect(result).toBe('12%');
    });

    it('should format numbers with minimum fraction digits', () => {
      const result = formatService.number(10, {
        minimumFractionDigits: 2,
      });
      expect(result).toBe('10.00');
    });

    it('should format numbers with maximum fraction digits', () => {
      const result = formatService.number(10.12345, {
        maximumFractionDigits: 2,
      });
      expect(result).toBe('10.12');
    });
  });

  describe('Currency Formatting', () => {
    it('should format currency in USD', () => {
      const result = formatService.currency(1234.56, 'USD');
      expect(result).toMatch(/\$1,234\.56|\$1234\.56/);
    });

    it('should format currency in EUR', () => {
      const result = formatService.currency(1234.56, 'EUR');
      expect(result).toMatch(/€1,234\.56|1,234\.56\s*€|€1234\.56/);
    });

    it('should format currency in GBP', () => {
      const result = formatService.currency(1234.56, 'GBP');
      expect(result).toMatch(/£1,234\.56|£1234\.56/);
    });

    it('should format currency according to locale', () => {
      const enService = new FormatService('en-US');
      const deService = new FormatService('de-DE');

      const enResult = enService.currency(1234.56, 'EUR');
      const deResult = deService.currency(1234.56, 'EUR');

      expect(enResult).toContain('€');
      expect(deResult).toContain('€');
      expect(enResult).toContain('1,234.56');
      expect(deResult).toContain('1.234,56');
    });

    it('should format currency with custom options', () => {
      const result = formatService.currency(1234.56, 'USD', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      expect(result).toMatch(/\$1,235|\$1235/);
    });

    it('should handle zero currency values', () => {
      const result = formatService.currency(0, 'USD');
      expect(result).toMatch(/\$0\.00|\$0/);
    });

    it('should handle negative currency values', () => {
      const result = formatService.currency(-100, 'USD');
      expect(result).toContain('-');
      expect(result).toContain('100');
    });
  });

  describe('List Formatting', () => {
    it('should format list with conjunction (and)', () => {
      const items = ['apples', 'oranges', 'bananas'];
      const result = formatService.list(items, 'conjunction');
      expect(result).toMatch(/apples, oranges, and bananas|apples, oranges and bananas/);
    });

    it('should format list with disjunction (or)', () => {
      const items = ['red', 'green', 'blue'];
      const result = formatService.list(items, 'disjunction');
      expect(result).toMatch(/red, green, or blue|red, green or blue/);
    });

    it('should format two-item list', () => {
      const items = ['apples', 'oranges'];
      const result = formatService.list(items, 'conjunction');
      expect(result).toMatch(/apples and oranges/);
    });

    it('should format single-item list', () => {
      const items = ['apples'];
      const result = formatService.list(items, 'conjunction');
      expect(result).toBe('apples');
    });

    it('should format empty list', () => {
      const items: string[] = [];
      const result = formatService.list(items, 'conjunction');
      expect(result).toBe('');
    });

    it('should format list according to locale', () => {
      const items = ['un', 'deux', 'trois'];
      
      const enService = new FormatService('en');
      const frService = new FormatService('fr');

      const enResult = enService.list(items, 'conjunction');
      const frResult = frService.list(items, 'conjunction');

      expect(enResult).toContain('and');
      expect(frResult).toContain('et');
    });

    it('should use conjunction by default', () => {
      const items = ['a', 'b', 'c'];
      const result = formatService.list(items);
      expect(result).toMatch(/a, b, and c|a, b and c/);
    });
  });

  describe('Locale Changes', () => {
    it('should update formatting when locale changes', () => {
      formatService.setLocale('en');
      const enResult = formatService.number(1234.56);
      expect(enResult).toBe('1,234.56');

      formatService.setLocale('de');
      const deResult = formatService.number(1234.56);
      expect(deResult).toBe('1.234,56');
    });

    it('should return current locale', () => {
      formatService.setLocale('fr');
      expect(formatService.getLocale()).toBe('fr');
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid date gracefully', () => {
      const invalidDate = new Date('invalid');
      const result = formatService.date(invalidDate);
      expect(result).toBe('Invalid Date');
    });

    it('should handle very large numbers', () => {
      const result = formatService.number(Number.MAX_SAFE_INTEGER);
      expect(result).toBeTruthy();
    });

    it('should handle very small numbers', () => {
      const result = formatService.number(0.000001);
      expect(result).toBeTruthy();
    });

    it('should handle NaN', () => {
      const result = formatService.number(NaN);
      expect(result).toMatch(/NaN/);
    });

    it('should handle Infinity', () => {
      const result = formatService.number(Infinity);
      expect(result).toMatch(/∞|Infinity/);
    });
  });
});
