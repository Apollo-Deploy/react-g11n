/**
 * I18nProvider - React provider component for i18n system
 * 
 * Initializes and manages:
 * - LocaleManager for locale state
 * - TranslationStore for caching
 * - TranslationLoader for dynamic loading
 * - Translator for translation resolution
 * - FormatService for locale-aware formatting
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { I18nConfig, I18nContextValue, TranslationKey, TranslationOptions } from '../types';
import { LocaleManager } from '../core/locale-manager';
import { TranslationStore } from '../core/translation-store';
import { TranslationLoader } from '../core/translation-loader';
import { Translator } from '../core/translator';
import { Interpolator } from '../core/interpolator';
import { Pluralizer } from '../core/pluralizer';
import { FormatService } from '../core/format-service';
import { CollationService } from '../core/collation-service';
import { DisplayNamesService } from '../core/display-names-service';
import { SegmentationService } from '../core/segmentation-service';
import { DocumentService } from '../core/document-service';
import { isStandaloneImpl, i18n } from '../standalone';
import { I18nContext } from './context';

/**
 * Props for I18nProvider component
 */
export interface I18nProviderProps {
  /** i18n configuration */
  config: I18nConfig;
  /** Child components */
  children: React.ReactNode;
  /** Optional initial locale (overrides detection) */
  initialLocale?: string;
  /** Callback when locale changes */
  onLocaleChange?: (locale: string) => void;
  /** Error handler callback */
  onError?: (error: Error) => void;
}

/**
 * I18nProvider component
 * 
 * Wraps the application and provides i18n context to all child components.
 * Initializes all core services and manages locale state.
 */
export function I18nProvider({
  config,
  children,
  initialLocale,
  onLocaleChange,
  onError,
}: I18nProviderProps) {
  // Initialize core services (only once)
  const servicesRef = useRef<{
    localeManager: LocaleManager;
    translationStore: TranslationStore;
    translator: Translator;
    formatService: FormatService;
    collationService: CollationService;
    displayNamesService: DisplayNamesService;
    segmentationService: SegmentationService;
    documentService: DocumentService;
  } | null>(null);

  if (!servicesRef.current) {
    const localeManager = new LocaleManager(config, initialLocale);
    const translationLoader = new TranslationLoader(config);
    const translationStore = new TranslationStore(translationLoader);
    const interpolator = new Interpolator(config.interpolation);
    const pluralizer = new Pluralizer();
    const translator = new Translator(translationStore, interpolator, pluralizer, config);
    const currentLocale = localeManager.getCurrentLocale();
    const formatService = new FormatService(currentLocale);
    const collationService = new CollationService(currentLocale);
    const displayNamesService = new DisplayNamesService(currentLocale);
    const segmentationService = new SegmentationService(currentLocale);
    const documentService = new DocumentService();

    servicesRef.current = {
      localeManager,
      translationStore,
      translator,
      formatService,
      collationService,
      displayNamesService,
      segmentationService,
      documentService,
    };

    // Update document locale on initialization
    documentService.updateDocumentLocale(currentLocale);

    // Synchronize standalone API with React context
    if (isStandaloneImpl(i18n)) {
      i18n._syncWithReact(
        localeManager,
        translationStore,
        translator,
        formatService,
        collationService,
        displayNamesService,
        segmentationService,
        documentService,
        config
      );
    }
  }

  const {
    localeManager,
    translationStore,
    translator,
    formatService,
    collationService,
    displayNamesService,
    segmentationService,
    documentService,
  } = servicesRef.current;

  // Locale state
  const [locale, setLocale] = useState<string>(localeManager.getCurrentLocale());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Load initial translations
  useEffect(() => {
    const loadInitialTranslations = async () => {
      try {
        setIsLoading(true);
        
        const namespacesToLoad = config.namespaces || ['common'];
        const currentLocale = localeManager.getCurrentLocale();
        
        // Load all configured namespaces for the current locale
        await translationStore.preloadLocale(currentLocale, namespacesToLoad);
        
        setIsReady(true);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to load translations');
        if (onError) {
          onError(err);
        } else {
          console.error('[i18n] Failed to load initial translations:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialTranslations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - dependencies are stable service instances

  // Subscribe to locale changes
  useEffect(() => {
    const unsubscribe = localeManager.subscribe((newLocale) => {
      setLocale(newLocale);
      
      // Update all services with new locale
      formatService.setLocale(newLocale);
      collationService.setLocale(newLocale);
      displayNamesService.setLocale(newLocale);
      segmentationService.setLocale(newLocale);
      documentService.updateDocumentLocale(newLocale);
      
      // Notify standalone API of locale change
      if (isStandaloneImpl(i18n)) {
        i18n._notifyFromReact(newLocale);
      }
      
      if (onLocaleChange) {
        onLocaleChange(newLocale);
      }
    });

    return unsubscribe;
  }, [
    localeManager,
    formatService,
    collationService,
    displayNamesService,
    segmentationService,
    documentService,
    onLocaleChange,
  ]);

  // Translation function
  const t = useCallback(
    <K extends TranslationKey>(key: K, options?: TranslationOptions<K>): string => {
      return translator.translate(locale, key, options);
    },
    [translator, locale]
  );

  // Change locale function
  const changeLocale = useCallback(
    async (newLocale: string): Promise<void> => {
      try {
        setIsLoading(true);
        
        // Load translations for the new locale
        const namespacesToLoad = config.namespaces || ['common'];
        await translationStore.preloadLocale(newLocale, namespacesToLoad);
        
        // Update locale in LocaleManager (this will trigger the subscription)
        await localeManager.setLocale(newLocale);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to change locale');
        if (onError) {
          onError(err);
        } else {
          console.error('[i18n] Failed to change locale:', err);
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [localeManager, translationStore, config.namespaces, onError]
  );

  // Get available locales
  const locales = useMemo(
    () => localeManager.getSupportedLocales(),
    [localeManager]
  );

  // Context value
  const contextValue: I18nContextValue = useMemo(
    () => ({
      t,
      locale,
      locales,
      changeLocale,
      isLoading,
      isReady,
      format: formatService,
      collation: collationService,
      displayNames: displayNamesService,
      segmentation: segmentationService,
      document: documentService,
      config,
    }),
    [
      t,
      locale,
      locales,
      changeLocale,
      isLoading,
      isReady,
      formatService,
      collationService,
      displayNamesService,
      segmentationService,
      documentService,
      config,
    ]
  );

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}
