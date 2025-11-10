/**
 * useTranslation hook - Primary hook for accessing i18n functionality
 * 
 * Provides:
 * - Translation function (t)
 * - Current locale
 * - Available locales
 * - Locale change function
 * - Loading states
 * - Format service
 */

'use client';

import { useContext } from 'react';
import { I18nContext } from './context';
import type { UseTranslationResult, TranslationKey, TranslationOptions } from '../types';

/**
 * useTranslation hook
 * 
 * Access translation functionality in React components.
 * Must be used within an I18nProvider.
 * 
 * @param namespace - Optional namespace to use for translations in this component
 * @returns Translation utilities and state
 * @throws Error if used outside I18nProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, locale, changeLocale, format } = useTranslation('common');
 *   
 *   return (
 *     <div>
 *       <h1>{t('greeting', { name: 'World' })}</h1>
 *       <p>Current locale: {locale}</p>
 *       <p>{format.date(new Date(), 'long')}</p>
 *       <button onClick={() => changeLocale('es')}>
 *         Switch to Spanish
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTranslation(namespace?: string): UseTranslationResult {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error(
      'useTranslation must be used within an I18nProvider. ' +
      'Make sure your component is wrapped with <I18nProvider>.'
    );
  }

  // If a namespace is provided, wrap the translation function to automatically inject it
  const t = namespace
    ? <K extends TranslationKey>(key: K, options?: TranslationOptions<K>): string => {
        return context.t(key, { ...options, ns: namespace });
      }
    : context.t;

  return {
    t,
    locale: context.locale,
    locales: context.locales,
    changeLocale: context.changeLocale,
    isLoading: context.isLoading,
    isReady: context.isReady,
    format: context.format,
    collation: context.collation,
    displayNames: context.displayNames,
    segmentation: context.segmentation,
    document: context.document,
  };
}
