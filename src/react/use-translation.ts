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
import type { UseTranslationResult } from '../types';

/**
 * useTranslation hook
 * 
 * Access translation functionality in React components.
 * Must be used within an I18nProvider.
 * 
 * @returns Translation utilities and state
 * @throws Error if used outside I18nProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, locale, changeLocale, format } = useTranslation();
 *   
 *   return (
 *     <div>
 *       <h1>{t('common.greeting', { name: 'World' })}</h1>
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
export function useTranslation(): UseTranslationResult {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error(
      'useTranslation must be used within an I18nProvider. ' +
      'Make sure your component is wrapped with <I18nProvider>.'
    );
  }

  return {
    t: context.t,
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
