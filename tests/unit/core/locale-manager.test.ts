/**
 * LocaleManager Tests
 * 
 * Tests for locale state management, detection, and persistence
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocaleManager } from '../../../src/core/locale-manager';
import type { I18nConfig } from '../../../src/types';

describe('LocaleManager', () => {
  const mockConfig: I18nConfig = {
    defaultLocale: 'en',
    supportedLocales: ['en', 'es', 'fr', 'de'],
    defaultNamespace: 'common',
    namespaces: ['common'],
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default locale', () => {
      const manager = new LocaleManager(mockConfig);
      expect(manager.getCurrentLocale()).toBe('en');
    });

    it('should initialize with explicitly provided locale', () => {
      const manager = new LocaleManager(mockConfig, 'es');
      expect(manager.getCurrentLocale()).toBe('es');
    });

    it('should initialize with persisted locale from localStorage', () => {
      localStorage.setItem('i18n_locale', 'fr');
      const manager = new LocaleManager(mockConfig);
      expect(manager.getCurrentLocale()).toBe('fr');
    });

    it('should prioritize explicit locale over persisted locale', () => {
      localStorage.setItem('i18n_locale', 'fr');
      const manager = new LocaleManager(mockConfig, 'es');
      expect(manager.getCurrentLocale()).toBe('es');
    });

    it('should fall back to default if persisted locale is unsupported', () => {
      localStorage.setItem('i18n_locale', 'unsupported');
      const manager = new LocaleManager(mockConfig);
      expect(manager.getCurrentLocale()).toBe('en');
    });
  });

  describe('locale validation', () => {
    it('should validate supported locales', () => {
      const manager = new LocaleManager(mockConfig);
      expect(manager.isLocaleSupported('en')).toBe(true);
      expect(manager.isLocaleSupported('es')).toBe(true);
      expect(manager.isLocaleSupported('fr')).toBe(true);
    });

    it('should reject unsupported locales', () => {
      const manager = new LocaleManager(mockConfig);
      expect(manager.isLocaleSupported('ja')).toBe(false);
      expect(manager.isLocaleSupported('invalid')).toBe(false);
    });
  });

  describe('locale change operations', () => {
    it('should change locale successfully', async () => {
      const manager = new LocaleManager(mockConfig);
      await manager.setLocale('es');
      expect(manager.getCurrentLocale()).toBe('es');
    });

    it('should throw error for unsupported locale', async () => {
      const manager = new LocaleManager(mockConfig);
      await expect(manager.setLocale('ja')).rejects.toThrow();
    });

    it('should not change if locale is already current', async () => {
      const manager = new LocaleManager(mockConfig, 'en');
      const listener = vi.fn();
      manager.subscribe(listener);
      
      await manager.setLocale('en');
      
      expect(listener).not.toHaveBeenCalled();
    });

    it('should persist locale to localStorage on change', async () => {
      const manager = new LocaleManager(mockConfig);
      await manager.setLocale('es');
      expect(localStorage.getItem('i18n_locale')).toBe('es');
    });
  });

  describe('subscriber management', () => {
    it('should notify subscribers on locale change', async () => {
      const manager = new LocaleManager(mockConfig);
      const listener = vi.fn();
      
      manager.subscribe(listener);
      await manager.setLocale('es');
      
      expect(listener).toHaveBeenCalledWith('es');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should notify multiple subscribers', async () => {
      const manager = new LocaleManager(mockConfig);
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      manager.subscribe(listener1);
      manager.subscribe(listener2);
      await manager.setLocale('fr');
      
      expect(listener1).toHaveBeenCalledWith('fr');
      expect(listener2).toHaveBeenCalledWith('fr');
    });

    it('should allow unsubscribing', async () => {
      const manager = new LocaleManager(mockConfig);
      const listener = vi.fn();
      
      const unsubscribe = manager.subscribe(listener);
      unsubscribe();
      await manager.setLocale('es');
      
      expect(listener).not.toHaveBeenCalled();
    });

    it('should track listener count', () => {
      const manager = new LocaleManager(mockConfig);
      const unsubscribe1 = manager.subscribe(() => {});
      const unsubscribe2 = manager.subscribe(() => {});
      
      expect(manager.getListenerCount()).toBe(2);
      
      unsubscribe1();
      expect(manager.getListenerCount()).toBe(1);
      
      unsubscribe2();
      expect(manager.getListenerCount()).toBe(0);
    });

    it('should handle errors in listeners gracefully', async () => {
      const manager = new LocaleManager(mockConfig);
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const normalListener = vi.fn();
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      manager.subscribe(errorListener);
      manager.subscribe(normalListener);
      
      await manager.setLocale('es');
      
      expect(errorListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('browser locale detection', () => {
    it('should detect browser locale', () => {
      const manager = new LocaleManager(mockConfig);
      const detected = manager.detectBrowserLocale();
      expect(mockConfig.supportedLocales).toContain(detected);
    });
  });

  describe('localStorage persistence', () => {
    it('should persist locale changes', async () => {
      const manager = new LocaleManager(mockConfig);
      await manager.setLocale('fr');
      expect(localStorage.getItem('i18n_locale')).toBe('fr');
    });

    it('should handle localStorage unavailability gracefully', async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
      
      const manager = new LocaleManager(mockConfig);
      await expect(manager.setLocale('es')).resolves.not.toThrow();
      
      setItemSpy.mockRestore();
    });
  });

  describe('text direction', () => {
    it('should return ltr for LTR languages', () => {
      const manager = new LocaleManager(mockConfig, 'en');
      expect(manager.getTextDirection()).toBe('ltr');
    });

    it('should return rtl for RTL languages', () => {
      const rtlConfig: I18nConfig = {
        ...mockConfig,
        supportedLocales: ['en', 'ar', 'he'],
      };
      const manager = new LocaleManager(rtlConfig, 'ar');
      expect(manager.getTextDirection()).toBe('rtl');
    });

    it('should get text direction for specific locale', () => {
      const rtlConfig: I18nConfig = {
        ...mockConfig,
        supportedLocales: ['en', 'ar'],
      };
      const manager = new LocaleManager(rtlConfig, 'en');
      expect(manager.getTextDirectionForLocale('ar')).toBe('rtl');
      expect(manager.getTextDirectionForLocale('en')).toBe('ltr');
    });
  });

  describe('locale metadata', () => {
    it('should return locale information', () => {
      const manager = new LocaleManager(mockConfig);
      const info = manager.getLocaleInfo('en');
      
      expect(info.code).toBe('en');
      expect(info.name).toBe('English');
      expect(info.nativeName).toBe('English');
      expect(info.direction).toBe('ltr');
    });

    it('should return all supported locales info', () => {
      const manager = new LocaleManager(mockConfig);
      const locales = manager.getSupportedLocales();
      
      expect(locales).toHaveLength(4);
      expect(locales.map(l => l.code)).toEqual(['en', 'es', 'fr', 'de']);
    });

    it('should return default metadata for unknown locales', () => {
      const manager = new LocaleManager(mockConfig);
      const info = manager.getLocaleInfo('unknown');
      
      expect(info.code).toBe('unknown');
      expect(info.direction).toBe('ltr');
    });
  });

  describe('error handling', () => {
    it('should throw InvalidLocaleError for unsupported locale', async () => {
      const manager = new LocaleManager(mockConfig);
      
      await expect(manager.setLocale('unsupported')).rejects.toThrow();
    });

    it('should handle normalized locale codes', async () => {
      const manager = new LocaleManager(mockConfig);
      await manager.setLocale('en-US');
      expect(manager.getCurrentLocale()).toBe('en');
    });
  });

  describe('reset functionality', () => {
    it('should reset to default locale', async () => {
      const configWithFallback: I18nConfig = {
        ...mockConfig,
        fallbackLocale: 'en',
      };
      const manager = new LocaleManager(configWithFallback, 'es');
      
      await manager.resetToDefault();
      expect(manager.getCurrentLocale()).toBe('en');
    });
  });
});
