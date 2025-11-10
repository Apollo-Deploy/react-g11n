/**
 * Tests for I18nContext
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import { I18nContext } from '../../../src/react/context';
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

describe('I18nContext', () => {
  const mockConfig: I18nConfig = {
    defaultLocale: 'en',
    supportedLocales: ['en', 'es', 'fr'],
    namespaces: ['common'],
    defaultNamespace: 'common',
  };

  describe('context creation', () => {
    it('should have default undefined value', () => {
      const TestComponent = () => {
        const context = useContext(I18nContext);
        return <div>{context === null ? 'null' : 'not-null'}</div>;
      };

      render(<TestComponent />);

      expect(screen.getByText('null')).toBeTruthy();
    });

    it('should have displayName set', () => {
      expect(I18nContext.displayName).toBe('I18nContext');
    });
  });

  describe('context value structure', () => {
    it('should provide complete context value structure', async () => {
      const TestComponent = () => {
        const context = useContext(I18nContext);
        
        if (!context) {
          return <div>No context</div>;
        }

        return (
          <div>
            <div>{typeof context.t === 'function' ? 't-exists' : 't-missing'}</div>
            <div>{context.locale !== undefined ? 'locale-exists' : 'locale-missing'}</div>
            <div>{Array.isArray(context.locales) ? 'locales-exists' : 'locales-missing'}</div>
            <div>{typeof context.changeLocale === 'function' ? 'changeLocale-exists' : 'changeLocale-missing'}</div>
            <div>{typeof context.isLoading === 'boolean' ? 'isLoading-exists' : 'isLoading-missing'}</div>
            <div>{typeof context.isReady === 'boolean' ? 'isReady-exists' : 'isReady-missing'}</div>
            <div>{context.format !== undefined ? 'format-exists' : 'format-missing'}</div>
            <div>{context.collation !== undefined ? 'collation-exists' : 'collation-missing'}</div>
            <div>{context.displayNames !== undefined ? 'displayNames-exists' : 'displayNames-missing'}</div>
            <div>{context.segmentation !== undefined ? 'segmentation-exists' : 'segmentation-missing'}</div>
            <div>{context.document !== undefined ? 'document-exists' : 'document-missing'}</div>
            <div>{context.config !== undefined ? 'config-exists' : 'config-missing'}</div>
          </div>
        );
      };

      render(
        <I18nProvider config={mockConfig}>
          <TestComponent />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('t-exists')).toBeTruthy();
        expect(screen.getByText('locale-exists')).toBeTruthy();
        expect(screen.getByText('locales-exists')).toBeTruthy();
        expect(screen.getByText('changeLocale-exists')).toBeTruthy();
        expect(screen.getByText('isLoading-exists')).toBeTruthy();
        expect(screen.getByText('isReady-exists')).toBeTruthy();
        expect(screen.getByText('format-exists')).toBeTruthy();
        expect(screen.getByText('collation-exists')).toBeTruthy();
        expect(screen.getByText('displayNames-exists')).toBeTruthy();
        expect(screen.getByText('segmentation-exists')).toBeTruthy();
        expect(screen.getByText('document-exists')).toBeTruthy();
        expect(screen.getByText('config-exists')).toBeTruthy();
      });
    });
  });

  describe('context consumer access', () => {
    it('should allow context consumer to access values', async () => {
      const TestComponent = () => {
        const context = useContext(I18nContext);
        
        if (!context) {
          return <div>No context</div>;
        }

        return (
          <div>
            <div data-testid="locale">{context.locale}</div>
            <div data-testid="ready">{context.isReady ? 'ready' : 'not-ready'}</div>
          </div>
        );
      };

      render(
        <I18nProvider config={mockConfig}>
          <TestComponent />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('locale').textContent).toBe('en');
        expect(screen.getByTestId('ready').textContent).toBe('ready');
      });
    });
  });

  describe('multiple consumers in component tree', () => {
    it('should provide same context to multiple consumers', async () => {
      const Consumer1 = () => {
        const context = useContext(I18nContext);
        return <div data-testid="consumer1">{context?.locale || 'no-locale'}</div>;
      };

      const Consumer2 = () => {
        const context = useContext(I18nContext);
        return <div data-testid="consumer2">{context?.locale || 'no-locale'}</div>;
      };

      const Consumer3 = () => {
        const context = useContext(I18nContext);
        return <div data-testid="consumer3">{context?.locale || 'no-locale'}</div>;
      };

      render(
        <I18nProvider config={mockConfig}>
          <div>
            <Consumer1 />
            <Consumer2 />
            <Consumer3 />
          </div>
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('consumer1').textContent).toBe('en');
        expect(screen.getByTestId('consumer2').textContent).toBe('en');
        expect(screen.getByTestId('consumer3').textContent).toBe('en');
      });
    });

    it('should update all consumers when context changes', async () => {
      const Consumer1 = () => {
        const context = useContext(I18nContext);
        return <div data-testid="consumer1">{context?.locale || 'no-locale'}</div>;
      };

      const Consumer2 = () => {
        const context = useContext(I18nContext);
        return <div data-testid="consumer2">{context?.locale || 'no-locale'}</div>;
      };

      const LocaleChanger = () => {
        const context = useContext(I18nContext);
        return (
          <button onClick={() => context?.changeLocale('es')}>
            Change Locale
          </button>
        );
      };

      render(
        <I18nProvider config={mockConfig}>
          <div>
            <Consumer1 />
            <Consumer2 />
            <LocaleChanger />
          </div>
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('consumer1').textContent).toBe('en');
        expect(screen.getByTestId('consumer2').textContent).toBe('en');
      });

      const button = screen.getByText('Change Locale');
      button.click();

      await waitFor(() => {
        expect(screen.getByTestId('consumer1').textContent).toBe('es');
        expect(screen.getByTestId('consumer2').textContent).toBe('es');
      });
    });
  });
});
