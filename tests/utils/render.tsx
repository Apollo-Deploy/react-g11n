/**
 * Test rendering utilities
 * 
 * Provides custom render function with i18n provider
 */

import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { TestI18nProvider } from './g11n-test-provider';
import type { I18nConfig } from '../../src/types';

const defaultConfig: I18nConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'es', 'fr'],
  fallbackLocale: 'en',
  namespaces: ['common'],
  defaultNamespace: 'common',
  debug: false,
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  config?: I18nConfig;
  initialLocale?: string;
}

/**
 * Custom render function that wraps components with TestI18nProvider
 */
export function render(
  ui: React.ReactElement,
  options?: CustomRenderOptions
) {
  const { config = defaultConfig, initialLocale, ...renderOptions } = options || {};

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <TestI18nProvider config={config} initialLocale={initialLocale}>
        {children}
      </TestI18nProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { render as default };
