/**
 * TranslationStore Tests
 * 
 * Tests for translation data storage and caching
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TranslationStore } from '../../../src/core/translation-store';
import { TranslationLoader } from '../../../src/core/translation-loader';
import type { I18nConfig } from '../../../src/types';

describe('TranslationStore', () => {
  let store: TranslationStore;
  let mockLoader: TranslationLoader;
  
  const mockConfig: I18nConfig = {
    defaultLocale: 'en',
    supportedLocales: ['en', 'es', 'fr'],
    defaultNamespace: 'common',
    namespaces: ['common'],
  };

  beforeEach(() => {
    mockLoader = new TranslationLoader(mockConfig);
    store = new TranslationStore(mockLoader);
  });

  describe('namespace loading and caching', () => {
    it('should load and cache namespace', async () => {
      const mockData = { hello: 'Hello', goodbye: 'Goodbye' };
      vi.spyOn(mockLoader, 'loadTranslation').mockResolvedValue(mockData);

      await store.loadNamespace('en', 'common');

      expect(store.hasNamespace('en', 'common')).toBe(true);
      expect(mockLoader.loadTranslation).toHaveBeenCalledWith('en', 'common');
    });

    it('should cache loaded translations', async () => {
      const mockData = { hello: 'Hello' };
      const loadSpy = vi.spyOn(mockLoader, 'loadTranslation').mockResolvedValue(mockData);

      await store.loadNamespace('en', 'common');
      await store.loadNamespace('en', 'common');

      expect(loadSpy).toHaveBeenCalledTimes(1);
    });

    it('should load different namespaces independently', async () => {
      const commonData = { hello: 'Hello' };
      const authData = { login: 'Login' };
      
      vi.spyOn(mockLoader, 'loadTranslation')
        .mockResolvedValueOnce(commonData)
        .mockResolvedValueOnce(authData);

      await store.loadNamespace('en', 'common');
      await store.loadNamespace('en', 'auth');

      expect(store.hasNamespace('en', 'common')).toBe(true);
      expect(store.hasNamespace('en', 'auth')).toBe(true);
    });
  });

  describe('duplicate request deduplication', () => {
    it('should deduplicate concurrent requests', async () => {
      const mockData = { hello: 'Hello' };
      const loadSpy = vi.spyOn(mockLoader, 'loadTranslation').mockResolvedValue(mockData);

      await Promise.all([
        store.loadNamespace('en', 'common'),
        store.loadNamespace('en', 'common'),
        store.loadNamespace('en', 'common'),
      ]);

      expect(loadSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent loads of different namespaces', async () => {
      const commonData = { hello: 'Hello' };
      const authData = { login: 'Login' };
      
      const loadSpy = vi.spyOn(mockLoader, 'loadTranslation')
        .mockImplementation(async (locale, namespace) => {
          if (namespace === 'common') return commonData;
          if (namespace === 'auth') return authData;
          return {};
        });

      await Promise.all([
        store.loadNamespace('en', 'common'),
        store.loadNamespace('en', 'auth'),
      ]);

      expect(loadSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('translation key resolution with dot notation', () => {
    beforeEach(async () => {
      const mockData = {
        simple: 'Simple value',
        nested: {
          key: 'Nested value',
          deep: {
            key: 'Deeply nested value',
          },
        },
      };
      vi.spyOn(mockLoader, 'loadTranslation').mockResolvedValue(mockData);
      await store.loadNamespace('en', 'common');
    });

    it('should resolve simple keys', () => {
      const result = store.getTranslation('en', 'common', 'simple');
      expect(result).toBe('Simple value');
    });

    it('should resolve nested keys with dot notation', () => {
      const result = store.getTranslation('en', 'common', 'nested.key');
      expect(result).toBe('Nested value');
    });

    it('should resolve deeply nested keys', () => {
      const result = store.getTranslation('en', 'common', 'nested.deep.key');
      expect(result).toBe('Deeply nested value');
    });

    it('should return undefined for missing keys', () => {
      const result = store.getTranslation('en', 'common', 'missing');
      expect(result).toBeUndefined();
    });

    it('should return undefined for missing nested keys', () => {
      const result = store.getTranslation('en', 'common', 'nested.missing');
      expect(result).toBeUndefined();
    });
  });

  describe('missing key tracking', () => {
    beforeEach(async () => {
      const mockData = { hello: 'Hello' };
      vi.spyOn(mockLoader, 'loadTranslation').mockResolvedValue(mockData);
      await store.loadNamespace('en', 'common');
    });

    it('should track missing keys', () => {
      store.getTranslation('en', 'common', 'missing1');
      store.getTranslation('en', 'common', 'missing2');

      const missingKeys = store.getMissingKeys();
      expect(missingKeys).toContain('en:common:missing1');
      expect(missingKeys).toContain('en:common:missing2');
    });

    it('should not track found keys', () => {
      store.getTranslation('en', 'common', 'hello');

      const missingKeys = store.getMissingKeys();
      expect(missingKeys).not.toContain('en:common:hello');
    });

    it('should not duplicate missing keys', () => {
      store.getTranslation('en', 'common', 'missing');
      store.getTranslation('en', 'common', 'missing');

      const missingKeys = store.getMissingKeys();
      const count = missingKeys.filter(k => k === 'en:common:missing').length;
      expect(count).toBe(1);
    });
  });

  describe('cache management', () => {
    it('should clear all cache', async () => {
      const mockData = { hello: 'Hello' };
      vi.spyOn(mockLoader, 'loadTranslation').mockResolvedValue(mockData);

      await store.loadNamespace('en', 'common');
      expect(store.hasNamespace('en', 'common')).toBe(true);

      store.clearCache();
      expect(store.hasNamespace('en', 'common')).toBe(false);
    });

    it('should clear missing keys on cache clear', async () => {
      const mockData = { hello: 'Hello' };
      vi.spyOn(mockLoader, 'loadTranslation').mockResolvedValue(mockData);

      await store.loadNamespace('en', 'common');
      store.getTranslation('en', 'common', 'missing');

      store.clearCache();
      expect(store.getMissingKeys()).toHaveLength(0);
    });

    it('should clear cache for specific locale', async () => {
      const mockData = { hello: 'Hello' };
      vi.spyOn(mockLoader, 'loadTranslation').mockResolvedValue(mockData);

      await store.loadNamespace('en', 'common');
      await store.loadNamespace('es', 'common');

      store.clearLocaleCache('en');

      expect(store.hasNamespace('en', 'common')).toBe(false);
      expect(store.hasNamespace('es', 'common')).toBe(true);
    });
  });

  describe('preloading multiple namespaces', () => {
    it('should preload multiple namespaces', async () => {
      const commonData = { hello: 'Hello' };
      const authData = { login: 'Login' };
      const profileData = { name: 'Name' };

      vi.spyOn(mockLoader, 'loadTranslation')
        .mockImplementation(async (locale, namespace) => {
          if (namespace === 'common') return commonData;
          if (namespace === 'auth') return authData;
          if (namespace === 'profile') return profileData;
          return {};
        });

      await store.preloadLocale('en', ['common', 'auth', 'profile']);

      expect(store.hasNamespace('en', 'common')).toBe(true);
      expect(store.hasNamespace('en', 'auth')).toBe(true);
      expect(store.hasNamespace('en', 'profile')).toBe(true);
    });

    it('should handle preload errors gracefully', async () => {
      vi.spyOn(mockLoader, 'loadTranslation')
        .mockResolvedValueOnce({ hello: 'Hello' })
        .mockRejectedValueOnce(new Error('Load failed'))
        .mockResolvedValueOnce({ name: 'Name' });

      await expect(
        store.preloadLocale('en', ['common', 'auth', 'profile'])
      ).resolves.not.toThrow();
    });
  });

  describe('raw data retrieval for plural forms', () => {
    beforeEach(async () => {
      const mockData = {
        simple: 'Simple value',
        plural: {
          one: 'One item',
          other: '{{count}} items',
        },
        nested: {
          plural: {
            one: 'One nested item',
            other: '{{count}} nested items',
          },
        },
      };
      vi.spyOn(mockLoader, 'loadTranslation').mockResolvedValue(mockData);
      await store.loadNamespace('en', 'common');
    });

    it('should return raw string data', () => {
      const result = store.getRawData('en', 'common', 'simple');
      expect(result).toBe('Simple value');
    });

    it('should return raw object data for plurals', () => {
      const result = store.getRawData('en', 'common', 'plural');
      expect(result).toEqual({
        one: 'One item',
        other: '{{count}} items',
      });
    });

    it('should return nested raw data', () => {
      const result = store.getRawData('en', 'common', 'nested.plural');
      expect(result).toEqual({
        one: 'One nested item',
        other: '{{count}} nested items',
      });
    });

    it('should return undefined for missing keys', () => {
      const result = store.getRawData('en', 'common', 'missing');
      expect(result).toBeUndefined();
    });
  });

  describe('concurrent loading operations', () => {
    it('should handle concurrent loads correctly', async () => {
      const mockData = { hello: 'Hello' };
      const loadSpy = vi.spyOn(mockLoader, 'loadTranslation').mockResolvedValue(mockData);

      const promises = Array(10).fill(null).map(() => 
        store.loadNamespace('en', 'common')
      );

      await Promise.all(promises);

      expect(loadSpy).toHaveBeenCalledTimes(1);
      expect(store.hasNamespace('en', 'common')).toBe(true);
    });

    it('should handle concurrent loads of different locales', async () => {
      const enData = { hello: 'Hello' };
      const esData = { hello: 'Hola' };
      const frData = { hello: 'Bonjour' };

      vi.spyOn(mockLoader, 'loadTranslation')
        .mockImplementation(async (locale) => {
          if (locale === 'en') return enData;
          if (locale === 'es') return esData;
          if (locale === 'fr') return frData;
          return {};
        });

      await Promise.all([
        store.loadNamespace('en', 'common'),
        store.loadNamespace('es', 'common'),
        store.loadNamespace('fr', 'common'),
      ]);

      expect(store.hasNamespace('en', 'common')).toBe(true);
      expect(store.hasNamespace('es', 'common')).toBe(true);
      expect(store.hasNamespace('fr', 'common')).toBe(true);
    });
  });

  describe('error recovery and empty object caching', () => {
    it('should cache empty object on load failure', async () => {
      const loadSpy = vi.spyOn(mockLoader, 'loadTranslation').mockRejectedValue(
        new Error('Load failed')
      );

      await store.loadNamespace('en', 'common');

      expect(store.hasNamespace('en', 'common')).toBe(true);
      expect(loadSpy).toHaveBeenCalledTimes(1);

      // Second load should not retry
      await store.loadNamespace('en', 'common');
      expect(loadSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      vi.spyOn(mockLoader, 'loadTranslation').mockRejectedValue(
        new Error('Network error')
      );

      await expect(store.loadNamespace('en', 'common')).resolves.not.toThrow();
    });

    it('should log errors in development', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      vi.spyOn(mockLoader, 'loadTranslation').mockRejectedValue(
        new Error('Load failed')
      );

      await store.loadNamespace('en', 'common');

      expect(consoleSpy).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });
});
