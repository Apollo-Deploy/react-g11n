/**
 * TranslationLoader Tests
 * 
 * Tests for dynamic translation file loading
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TranslationLoader } from '../../../src/core/translation-loader';
import type { I18nConfig } from '../../../src/types';

describe('TranslationLoader', () => {
  const mockConfig: I18nConfig = {
    defaultLocale: 'en',
    supportedLocales: ['en', 'es', 'fr'],
    defaultNamespace: 'common',
    namespaces: ['common'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('path resolution', () => {
    it('should resolve path with default template', () => {
      const loader = new TranslationLoader(mockConfig);
      const path = loader.getLoadPath('en', 'common');
      expect(path).toBe('locales/en/common.json');
    });

    it('should resolve path for different locales', () => {
      const loader = new TranslationLoader(mockConfig);
      expect(loader.getLoadPath('es', 'common')).toBe('locales/es/common.json');
      expect(loader.getLoadPath('fr', 'auth')).toBe('locales/fr/auth.json');
    });

    it('should support {{lng}} and {{ns}} placeholders', () => {
      const customConfig: I18nConfig = {
        ...mockConfig,
        loadPath: 'translations/{{lng}}/{{ns}}.json',
      };
      const loader = new TranslationLoader(customConfig);
      const path = loader.getLoadPath('en', 'common');
      expect(path).toBe('translations/en/common.json');
    });
  });

  describe('custom load path configuration', () => {
    it('should use custom load path', () => {
      const customConfig: I18nConfig = {
        ...mockConfig,
        loadPath: 'assets/i18n/{{locale}}/{{namespace}}.json',
      };
      const loader = new TranslationLoader(customConfig);
      const path = loader.getLoadPath('en', 'common');
      expect(path).toBe('assets/i18n/en/common.json');
    });

    it('should support different path patterns', () => {
      const customConfig: I18nConfig = {
        ...mockConfig,
        loadPath: '{{namespace}}.{{locale}}.json',
      };
      const loader = new TranslationLoader(customConfig);
      const path = loader.getLoadPath('en', 'common');
      expect(path).toBe('common.en.json');
    });
  });

  describe('successful translation file loading', () => {
    it('should load translation file successfully', async () => {
      const mockData = { hello: 'Hello', goodbye: 'Goodbye' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const loader = new TranslationLoader(mockConfig);
      const result = await loader.loadTranslation('en', 'common');

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('/locales/en/common.json');
    });

    it('should load different namespaces', async () => {
      const mockData = { login: 'Login', logout: 'Logout' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const loader = new TranslationLoader(mockConfig);
      const result = await loader.loadTranslation('en', 'auth');

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('/locales/en/auth.json');
    });
  });

  describe('error handling with missing files', () => {
    it('should return empty object when file is not found', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const loader = new TranslationLoader(mockConfig);
      const result = await loader.loadTranslation('en', 'missing');

      expect(result).toEqual({});
    });

    it('should handle network errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const loader = new TranslationLoader(mockConfig);
      const result = await loader.loadTranslation('en', 'common');

      expect(result).toEqual({});
    });

    it('should handle 500 errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const loader = new TranslationLoader(mockConfig);
      const result = await loader.loadTranslation('en', 'common');

      expect(result).toEqual({});
    });
  });

  describe('error handling with malformed JSON', () => {
    it('should return empty object for invalid JSON', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const loader = new TranslationLoader(mockConfig);
      const result = await loader.loadTranslation('en', 'common');

      expect(result).toEqual({});
    });

    it('should handle JSON parse errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      });

      const loader = new TranslationLoader(mockConfig);
      const result = await loader.loadTranslation('en', 'common');

      expect(result).toEqual({});
    });
  });

  describe('debug mode logging', () => {
    it('should log loading attempts in debug mode', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockData = { hello: 'Hello' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const debugConfig: I18nConfig = {
        ...mockConfig,
        debug: true,
      };
      const loader = new TranslationLoader(debugConfig);
      await loader.loadTranslation('en', 'common');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Loading translation')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Successfully loaded')
      );

      consoleSpy.mockRestore();
    });

    it('should log errors in debug mode', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      global.fetch = vi.fn().mockRejectedValue(new Error('Load failed'));

      const debugConfig: I18nConfig = {
        ...mockConfig,
        debug: true,
      };
      const loader = new TranslationLoader(debugConfig);
      await loader.loadTranslation('en', 'common');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load translation'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should not log in non-debug mode', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const mockData = { hello: 'Hello' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const loader = new TranslationLoader(mockConfig);
      await loader.loadTranslation('en', 'common');

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('concurrent load request handling', () => {
    it('should handle multiple concurrent loads', async () => {
      const mockData1 = { hello: 'Hello' };
      const mockData2 = { hola: 'Hola' };
      
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockData1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockData2,
        });

      const loader = new TranslationLoader(mockConfig);
      
      const [result1, result2] = await Promise.all([
        loader.loadTranslation('en', 'common'),
        loader.loadTranslation('es', 'common'),
      ]);

      expect(result1).toEqual(mockData1);
      expect(result2).toEqual(mockData2);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle mixed success and failure', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ hello: 'Hello' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        });

      const loader = new TranslationLoader(mockConfig);
      
      const [result1, result2] = await Promise.all([
        loader.loadTranslation('en', 'common'),
        loader.loadTranslation('en', 'missing'),
      ]);

      expect(result1).toEqual({ hello: 'Hello' });
      expect(result2).toEqual({});
    });
  });
});
