/**
 * Locale Detector Tests
 * 
 * Tests for browser locale detection and normalization
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  normalizeLocale,
  getBrowserLocales,
  detectBrowserLocale,
  isLocaleSupported,
  findBestMatchingLocale,
} from '../../../src/utils/locale-detector';

describe('Locale Detector', () => {
  describe('normalizeLocale', () => {
    it('should normalize en-US to en', () => {
      const result = normalizeLocale('en-US');
      expect(result).toBe('en');
    });

    it('should normalize es-MX to es', () => {
      const result = normalizeLocale('es-MX');
      expect(result).toBe('es');
    });

    it('should normalize fr-CA to fr', () => {
      const result = normalizeLocale('fr-CA');
      expect(result).toBe('fr');
    });

    it('should handle underscore separators', () => {
      const result = normalizeLocale('en_US');
      expect(result).toBe('en');
    });

    it('should convert to lowercase', () => {
      const result = normalizeLocale('EN-US');
      expect(result).toBe('en');
    });

    it('should handle already normalized locales', () => {
      const result = normalizeLocale('en');
      expect(result).toBe('en');
    });

    it('should return empty string for empty input', () => {
      const result = normalizeLocale('');
      expect(result).toBe('');
    });
  });

  describe('getBrowserLocales', () => {
    let originalNavigator: Navigator;

    beforeEach(() => {
      originalNavigator = global.navigator;
    });

    afterEach(() => {
      global.navigator = originalNavigator;
    });

    it('should retrieve locales from navigator.languages', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          languages: ['en-US', 'es-ES', 'fr-FR'],
        },
        writable: true,
        configurable: true,
      });

      const result = getBrowserLocales();
      expect(result).toEqual(['en-US', 'es-ES', 'fr-FR']);
    });

    it('should fallback to navigator.language when languages is not available', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'en-US',
        },
        writable: true,
        configurable: true,
      });

      const result = getBrowserLocales();
      expect(result).toEqual(['en-US']);
    });

    it('should return empty array when navigator is not available', () => {
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const result = getBrowserLocales();
      expect(result).toEqual([]);
    });
  });

  describe('detectBrowserLocale', () => {
    let originalNavigator: Navigator;

    beforeEach(() => {
      originalNavigator = global.navigator;
    });

    afterEach(() => {
      global.navigator = originalNavigator;
    });

    it('should detect exact match from browser preferences', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          languages: ['en-US', 'es-ES'],
        },
        writable: true,
        configurable: true,
      });

      const result = detectBrowserLocale(['en', 'es', 'fr'], 'en');
      expect(result).toBe('en');
    });

    it('should prioritize first matching locale', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          languages: ['es-MX', 'en-US'],
        },
        writable: true,
        configurable: true,
      });

      const result = detectBrowserLocale(['en', 'es', 'fr'], 'en');
      expect(result).toBe('es');
    });

    it('should fallback to partial match', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          languages: ['de-DE', 'en-GB'],
        },
        writable: true,
        configurable: true,
      });

      const result = detectBrowserLocale(['en', 'es', 'fr'], 'en');
      expect(result).toBe('en');
    });

    it('should return fallback when no match found', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          languages: ['de-DE', 'it-IT'],
        },
        writable: true,
        configurable: true,
      });

      const result = detectBrowserLocale(['en', 'es', 'fr'], 'en');
      expect(result).toBe('en');
    });
  });

  describe('isLocaleSupported', () => {
    const supportedLocales = ['en', 'es', 'fr'];

    it('should return true for supported locale', () => {
      const result = isLocaleSupported('en', supportedLocales);
      expect(result).toBe(true);
    });

    it('should return true for supported locale with region code', () => {
      const result = isLocaleSupported('en-US', supportedLocales);
      expect(result).toBe(true);
    });

    it('should return false for unsupported locale', () => {
      const result = isLocaleSupported('de', supportedLocales);
      expect(result).toBe(false);
    });

    it('should handle case insensitivity', () => {
      const result = isLocaleSupported('EN-US', supportedLocales);
      expect(result).toBe(true);
    });
  });

  describe('findBestMatchingLocale', () => {
    const supportedLocales = ['en', 'es', 'fr'];

    it('should find exact match', () => {
      const result = findBestMatchingLocale(['en-US'], supportedLocales, 'en');
      expect(result).toBe('en');
    });

    it('should prioritize first exact match', () => {
      const result = findBestMatchingLocale(['es-MX', 'en-US'], supportedLocales, 'en');
      expect(result).toBe('es');
    });

    it('should find partial match when no exact match', () => {
      const result = findBestMatchingLocale(['de-DE', 'en-GB'], supportedLocales, 'en');
      expect(result).toBe('en');
    });

    it('should return fallback when no match found', () => {
      const result = findBestMatchingLocale(['de-DE', 'it-IT'], supportedLocales, 'en');
      expect(result).toBe('en');
    });

    it('should handle empty candidates array', () => {
      const result = findBestMatchingLocale([], supportedLocales, 'en');
      expect(result).toBe('en');
    });
  });

  describe('edge cases', () => {
    it('should handle empty arrays', () => {
      const result = findBestMatchingLocale([], ['en'], 'en');
      expect(result).toBe('en');
    });

    it('should handle invalid locale formats', () => {
      const result = normalizeLocale('invalid-locale-format-123');
      expect(result).toBe('invalid');
    });

    it('should handle null-like values gracefully', () => {
      const result = normalizeLocale('');
      expect(result).toBe('');
    });
  });
});
