/**
 * Translator Tests
 * 
 * Tests for translation resolution, interpolation, and pluralization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Translator } from '../../../src/core/translator';
import { TranslationStore } from '../../../src/core/translation-store';
import { Interpolator } from '../../../src/core/interpolator';
import { Pluralizer } from '../../../src/core/pluralizer';
import type { I18nConfig } from '../../../src/types';

describe('Translator', () => {
  let translator: Translator;
  let mockStore: TranslationStore;
  let interpolator: Interpolator;
  let pluralizer: Pluralizer;

  const mockConfig: I18nConfig = {
    defaultLocale: 'en',
    supportedLocales: ['en', 'es', 'fr'],
    defaultNamespace: 'common',
    namespaces: ['common'],
  };

  beforeEach(() => {
    mockStore = {
      getTranslation: vi.fn(),
      getRawData: vi.fn(),
    } as any;
    
    interpolator = new Interpolator();
    pluralizer = new Pluralizer();
    translator = new Translator(mockStore, interpolator, pluralizer, mockConfig);
  });

  describe('basic translation key resolution', () => {
    it('should resolve simple translation key', () => {
      vi.mocked(mockStore.getTranslation).mockReturnValue('Hello World');

      const result = translator.translate('en', 'greeting');

      expect(result).toBe('Hello World');
      expect(mockStore.getTranslation).toHaveBeenCalledWith('en', 'common', 'greeting');
    });

    it('should resolve nested translation keys', () => {
      vi.mocked(mockStore.getTranslation).mockReturnValue('Welcome back');

      const result = translator.translate('en', 'messages.welcome');

      expect(result).toBe('Welcome back');
    });

    it('should return key when translation not found', () => {
      vi.mocked(mockStore.getTranslation).mockReturnValue(undefined);

      const result = translator.translate('en', 'missing.key');

      expect(result).toBe('missing.key');
    });
  });

  describe('namespace support', () => {
    it('should use default namespace', () => {
      vi.mocked(mockStore.getTranslation).mockReturnValue('Hello');

      translator.translate('en', 'greeting');

      expect(mockStore.getTranslation).toHaveBeenCalledWith('en', 'common', 'greeting');
    });

    it('should use custom namespace', () => {
      vi.mocked(mockStore.getTranslation).mockReturnValue('Login');

      const result = translator.translate('en', 'login', { ns: 'auth' });

      expect(result).toBe('Login');
      expect(mockStore.getTranslation).toHaveBeenCalledWith('en', 'auth', 'login');
    });

    it('should support different namespaces', () => {
      vi.mocked(mockStore.getTranslation)
        .mockReturnValueOnce('Common text')
        .mockReturnValueOnce('Auth text');

      const result1 = translator.translate('en', 'text', { ns: 'common' });
      const result2 = translator.translate('en', 'text', { ns: 'auth' });

      expect(result1).toBe('Common text');
      expect(result2).toBe('Auth text');
    });
  });

  describe('variable interpolation integration', () => {
    it('should interpolate variables', () => {
      vi.mocked(mockStore.getTranslation).mockReturnValue('Hello {{name}}');

      const result = translator.translate('en', 'greeting', {
        interpolation: { name: 'Alice' },
      });

      expect(result).toBe('Hello Alice');
    });

    it('should interpolate multiple variables', () => {
      vi.mocked(mockStore.getTranslation).mockReturnValue('{{greeting}} {{name}}!');

      const result = translator.translate('en', 'message', {
        interpolation: { greeting: 'Hello', name: 'Bob' },
      });

      expect(result).toBe('Hello Bob!');
    });

    it('should handle nested object interpolation', () => {
      vi.mocked(mockStore.getTranslation).mockReturnValue('Hello {{user.name}}');

      const result = translator.translate('en', 'greeting', {
        interpolation: { user: { name: 'Charlie' } },
      });

      expect(result).toBe('Hello Charlie');
    });
  });

  describe('pluralization integration', () => {
    it('should handle count-based pluralization', () => {
      vi.mocked(mockStore.getRawData).mockReturnValue({
        one: 'One item',
        other: '{{count}} items',
      });

      const result1 = translator.translate('en', 'items', { count: 1 });
      const result2 = translator.translate('en', 'items', { count: 5 });

      expect(result1).toBe('One item');
      expect(result2).toBe('5 items');
    });

    it('should interpolate count in plural forms', () => {
      vi.mocked(mockStore.getRawData).mockReturnValue({
        one: 'One item',
        other: '{{count}} items',
      });

      const result = translator.translate('en', 'items', { count: 10 });

      expect(result).toBe('10 items');
    });

    it('should handle zero count', () => {
      vi.mocked(mockStore.getRawData).mockReturnValue({
        zero: 'No items',
        one: 'One item',
        other: '{{count}} items',
      });

      const result = translator.translate('ar', 'items', { count: 0 });

      expect(result).toBe('No items');
    });

    it('should handle ordinal pluralization', () => {
      vi.mocked(mockStore.getRawData).mockReturnValue({
        one: '{{count}}st',
        two: '{{count}}nd',
        few: '{{count}}rd',
        other: '{{count}}th',
      });

      const result = translator.translate('en', 'position', {
        count: 1,
        ordinal: true,
      });

      expect(result).toBe('1st');
    });
  });

  describe('contextual translation resolution', () => {
    it('should use context for pluralization', () => {
      vi.mocked(mockStore.getRawData).mockReturnValue({
        male: { one: 'one male friend', other: '{{count}} male friends' },
        female: { one: 'one female friend', other: '{{count}} female friends' },
      });

      const result = translator.translate('en', 'friends', {
        count: 1,
        context: 'male',
      });

      expect(result).toBe('one male friend');
    });
  });

  describe('fallback locale support', () => {
    it('should fall back to fallback locale', () => {
      const configWithFallback: I18nConfig = {
        ...mockConfig,
        fallbackLocale: 'en',
      };
      
      translator = new Translator(mockStore, interpolator, pluralizer, configWithFallback);

      vi.mocked(mockStore.getTranslation)
        .mockReturnValueOnce(undefined) // First call for 'es' returns undefined
        .mockReturnValueOnce('Hello'); // Second call for 'en' returns value

      const result = translator.translate('es', 'greeting');

      expect(result).toBe('Hello');
      expect(mockStore.getTranslation).toHaveBeenCalledWith('es', 'common', 'greeting');
      expect(mockStore.getTranslation).toHaveBeenCalledWith('en', 'common', 'greeting');
    });

    it('should not use fallback if translation exists', () => {
      const configWithFallback: I18nConfig = {
        ...mockConfig,
        fallbackLocale: 'en',
      };
      
      translator = new Translator(mockStore, interpolator, pluralizer, configWithFallback);

      vi.mocked(mockStore.getTranslation).mockReturnValue('Hola');

      const result = translator.translate('es', 'greeting');

      expect(result).toBe('Hola');
      expect(mockStore.getTranslation).toHaveBeenCalledTimes(1);
    });

    it('should not use fallback if locale is same as fallback', () => {
      const configWithFallback: I18nConfig = {
        ...mockConfig,
        fallbackLocale: 'en',
      };
      
      translator = new Translator(mockStore, interpolator, pluralizer, configWithFallback);

      vi.mocked(mockStore.getTranslation).mockReturnValue(undefined);

      const result = translator.translate('en', 'missing');

      expect(result).toBe('missing');
      expect(mockStore.getTranslation).toHaveBeenCalledTimes(1);
    });
  });

  describe('default value fallback', () => {
    it('should use default value when translation missing', () => {
      vi.mocked(mockStore.getTranslation).mockReturnValue(undefined);

      const result = translator.translate('en', 'missing', {
        defaultValue: 'Default text',
      });

      expect(result).toBe('Default text');
    });

    it('should prefer translation over default value', () => {
      vi.mocked(mockStore.getTranslation).mockReturnValue('Actual translation');

      const result = translator.translate('en', 'key', {
        defaultValue: 'Default text',
      });

      expect(result).toBe('Actual translation');
    });
  });

  describe('missing translation warnings', () => {
    it('should warn about missing translations in development', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      vi.mocked(mockStore.getTranslation).mockReturnValue(undefined);

      translator.translate('en', 'missing.key');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing translation')
      );

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    it('should warn in debug mode', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const debugConfig: I18nConfig = {
        ...mockConfig,
        debug: true,
      };

      translator = new Translator(mockStore, interpolator, pluralizer, debugConfig);
      vi.mocked(mockStore.getTranslation).mockReturnValue(undefined);

      translator.translate('en', 'missing.key');

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('combined features', () => {
    it('should handle interpolation and pluralization together', () => {
      vi.mocked(mockStore.getRawData).mockReturnValue({
        one: 'You have one {{item}}',
        other: 'You have {{count}} {{item}}s',
      });

      const result = translator.translate('en', 'message', {
        count: 5,
        interpolation: { item: 'message' },
      });

      expect(result).toBe('You have 5 messages');
    });

    it('should handle namespace, interpolation, and pluralization', () => {
      vi.mocked(mockStore.getRawData).mockReturnValue({
        one: '{{user}} has one notification',
        other: '{{user}} has {{count}} notifications',
      });

      const result = translator.translate('en', 'notifications', {
        ns: 'profile',
        count: 3,
        interpolation: { user: 'Alice' },
      });

      expect(result).toBe('Alice has 3 notifications');
    });
  });

  describe('edge cases', () => {
    it('should handle empty keys', () => {
      vi.mocked(mockStore.getTranslation).mockReturnValue(undefined);

      const result = translator.translate('en', '');

      expect(result).toBe('');
    });

    it('should handle special characters in keys', () => {
      vi.mocked(mockStore.getTranslation).mockReturnValue('Special value');

      const result = translator.translate('en', 'special-key_123');

      expect(result).toBe('Special value');
    });

    it('should handle string plural data', () => {
      vi.mocked(mockStore.getRawData).mockReturnValue('Simple string');

      const result = translator.translate('en', 'key', { count: 1 });

      expect(result).toBe('Simple string');
    });

    it('should handle string plural data with interpolation', () => {
      vi.mocked(mockStore.getRawData).mockReturnValue('Hello {{name}}');

      const result = translator.translate('en', 'key', {
        count: 1,
        interpolation: { name: 'World' },
      });

      expect(result).toBe('Hello World');
    });
  });
});
