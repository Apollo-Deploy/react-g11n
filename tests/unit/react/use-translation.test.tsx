/**
 * Tests for useTranslation hook
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { useTranslation } from '../../../src/react/use-translation';
import { I18nProvider } from '../../../src/react/provider';
import type { I18nConfig } from '../../../src/types';

// Mock translation loader
vi.mock('../../../src/core/translation-loader', () => {
  return {
    TranslationLoader: vi.fn().mockImplementation(() => ({
      load: vi.fn().mockResolvedValue({
        greeting: 'Hello',
        welcome: 'Welcome {{name}}',
      }),
    })),
  };
});

describe('useTranslation', () => {
  const mockConfig: I18nConfig = {
    defaultLocale: 'en',
    supportedLocales: ['en', 'es', 'fr'],
    namespaces: ['common'],
    defaultNamespace: 'common',
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <I18nProvider config={mockConfig}>{children}</I18nProvider>
  );

  describe('hook usage within provider', () => {
    it('should return translation utilities when used within provider', async () => {
      const { result } = renderHook(() => useTranslation(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(result.current.t).toBeDefined();
      expect(result.current.locale).toBeDefined();
      expect(result.current.changeLocale).toBeDefined();
    });
  });

  describe('translation function access', () => {
    it('should provide translation function', async () => {
      const { result } = renderHook(() => useTranslation(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(typeof result.current.t).toBe('function');
    });
  });

  describe('locale state access', () => {
    it('should provide current locale', async () => {
      const { result } = renderHook(() => useTranslation(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(result.current.locale).toBe('en');
    });

    it('should provide list of available locales', async () => {
      const { result } = renderHook(() => useTranslation(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(result.current.locales).toBeDefined();
      expect(Array.isArray(result.current.locales)).toBe(true);
    });
  });

  describe('locale change function', () => {
    it('should provide changeLocale function', async () => {
      const { result } = renderHook(() => useTranslation(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(typeof result.current.changeLocale).toBe('function');
    });

    it('should update locale when changeLocale is called', async () => {
      const { result } = renderHook(() => useTranslation(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(result.current.locale).toBe('en');

      await result.current.changeLocale('es');

      await waitFor(() => {
        expect(result.current.locale).toBe('es');
      });
    });
  });

  describe('loading state access', () => {
    it('should provide isLoading state', async () => {
      const { result } = renderHook(() => useTranslation(), { wrapper });

      expect(result.current.isLoading).toBeDefined();
      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('should provide isReady state', async () => {
      const { result } = renderHook(() => useTranslation(), { wrapper });

      expect(result.current.isReady).toBeDefined();
      expect(typeof result.current.isReady).toBe('boolean');

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });
    });
  });

  describe('format service access', () => {
    it('should provide format service', async () => {
      const { result } = renderHook(() => useTranslation(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(result.current.format).toBeDefined();
      expect(typeof result.current.format.date).toBe('function');
      expect(typeof result.current.format.number).toBe('function');
      expect(typeof result.current.format.currency).toBe('function');
    });
  });

  describe('collation service access', () => {
    it('should provide collation service', async () => {
      const { result } = renderHook(() => useTranslation(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(result.current.collation).toBeDefined();
      expect(typeof result.current.collation.sort).toBe('function');
      expect(typeof result.current.collation.compare).toBe('function');
    });
  });

  describe('displayNames service access', () => {
    it('should provide displayNames service', async () => {
      const { result } = renderHook(() => useTranslation(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(result.current.displayNames).toBeDefined();
      expect(typeof result.current.displayNames.language).toBe('function');
      expect(typeof result.current.displayNames.region).toBe('function');
      expect(typeof result.current.displayNames.currency).toBe('function');
    });
  });

  describe('segmentation service access', () => {
    it('should provide segmentation service', async () => {
      const { result } = renderHook(() => useTranslation(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(result.current.segmentation).toBeDefined();
      expect(typeof result.current.segmentation.words).toBe('function');
      expect(typeof result.current.segmentation.sentences).toBe('function');
      expect(typeof result.current.segmentation.wordCount).toBe('function');
    });
  });

  describe('document service access', () => {
    it('should provide document service', async () => {
      const { result } = renderHook(() => useTranslation(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(result.current.document).toBeDefined();
      expect(typeof result.current.document.updateDocumentLanguage).toBe('function');
      expect(typeof result.current.document.updateDocumentDirection).toBe('function');
    });
  });

  describe('error when used outside provider', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useTranslation());
      }).toThrow('useTranslation must be used within an I18nProvider');
    });
  });

  describe('re-rendering on locale change', () => {
    it('should trigger re-render when locale changes', async () => {
      const { result } = renderHook(() => useTranslation(), { wrapper });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      const initialLocale = result.current.locale;

      await result.current.changeLocale('fr');

      await waitFor(() => {
        expect(result.current.locale).toBe('fr');
      });

      expect(result.current.locale).not.toBe(initialLocale);
    });
  });
});
