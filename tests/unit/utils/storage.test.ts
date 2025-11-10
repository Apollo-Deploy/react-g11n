/**
 * Storage Utility Tests
 * 
 * Tests for localStorage operations for locale persistence
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  persistLocale,
  getPersistedLocale,
  clearPersistedLocale,
} from '../../../src/utils/storage';

describe('Storage Utility', () => {
  const LOCALE_KEY = 'i18n_locale';

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('persistLocale', () => {
    it('should persist locale to localStorage', () => {
      const result = persistLocale('en');
      expect(result).toBe(true);
      expect(localStorage.getItem(LOCALE_KEY)).toBe('en');
    });

    it('should persist different locales', () => {
      persistLocale('es');
      expect(localStorage.getItem(LOCALE_KEY)).toBe('es');

      persistLocale('fr');
      expect(localStorage.getItem(LOCALE_KEY)).toBe('fr');
    });

    it('should overwrite existing locale', () => {
      persistLocale('en');
      persistLocale('es');
      expect(localStorage.getItem(LOCALE_KEY)).toBe('es');
    });
  });

  describe('getPersistedLocale', () => {
    it('should retrieve persisted locale from localStorage', () => {
      localStorage.setItem(LOCALE_KEY, 'en');
      const result = getPersistedLocale();
      expect(result).toBe('en');
    });

    it('should return null when no locale is persisted', () => {
      const result = getPersistedLocale();
      expect(result).toBeNull();
    });

    it('should retrieve updated locale', () => {
      localStorage.setItem(LOCALE_KEY, 'en');
      expect(getPersistedLocale()).toBe('en');

      localStorage.setItem(LOCALE_KEY, 'es');
      expect(getPersistedLocale()).toBe('es');
    });
  });

  describe('clearPersistedLocale', () => {
    it('should remove persisted locale from localStorage', () => {
      localStorage.setItem(LOCALE_KEY, 'en');
      const result = clearPersistedLocale();
      expect(result).toBe(true);
      expect(localStorage.getItem(LOCALE_KEY)).toBeNull();
    });

    it('should return true even when no locale exists', () => {
      const result = clearPersistedLocale();
      expect(result).toBe(true);
    });

    it('should clear only the locale key', () => {
      localStorage.setItem(LOCALE_KEY, 'en');
      localStorage.setItem('other_key', 'value');
      
      clearPersistedLocale();
      
      expect(localStorage.getItem(LOCALE_KEY)).toBeNull();
      expect(localStorage.getItem('other_key')).toBe('value');
    });
  });

  describe('localStorage availability detection', () => {
    it('should handle localStorage being unavailable', () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('localStorage not available');
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = persistLocale('en');

      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalled();

      Storage.prototype.setItem = originalSetItem;
      consoleWarnSpy.mockRestore();
    });

    it('should handle localStorage getItem errors', () => {
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = vi.fn(() => {
        throw new Error('localStorage not available');
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = getPersistedLocale();

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      Storage.prototype.getItem = originalGetItem;
      consoleErrorSpy.mockRestore();
    });
  });

  describe('quota exceeded error handling', () => {
    it('should handle quota exceeded error', () => {
      // First call succeeds (availability check), second call fails (actual persist)
      let callCount = 0;
      const originalSetItem = Storage.prototype.setItem;
      const originalRemoveItem = Storage.prototype.removeItem;
      
      Storage.prototype.setItem = vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          // First call for availability check succeeds
          return;
        }
        // Second call for actual persist fails with quota error
        const error = new DOMException('Quota exceeded', 'QuotaExceededError');
        throw error;
      });
      
      Storage.prototype.removeItem = vi.fn();

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = persistLocale('en');

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('quota exceeded')
      );

      Storage.prototype.setItem = originalSetItem;
      Storage.prototype.removeItem = originalRemoveItem;
      consoleErrorSpy.mockRestore();
    });
  });

  describe('security error handling', () => {
    it('should handle security errors gracefully', () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new DOMException('Access denied', 'SecurityError');
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = persistLocale('en');

      expect(result).toBe(false);

      Storage.prototype.setItem = originalSetItem;
      consoleWarnSpy.mockRestore();
    });
  });

  describe('graceful degradation', () => {
    it('should degrade gracefully when localStorage is unavailable', () => {
      const originalSetItem = Storage.prototype.setItem;
      const originalGetItem = Storage.prototype.getItem;
      
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('Not available');
      });
      Storage.prototype.getItem = vi.fn(() => {
        throw new Error('Not available');
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const persistResult = persistLocale('en');
      const getResult = getPersistedLocale();

      expect(persistResult).toBe(false);
      expect(getResult).toBeNull();

      Storage.prototype.setItem = originalSetItem;
      Storage.prototype.getItem = originalGetItem;
      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });
});
