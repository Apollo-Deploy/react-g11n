/**
 * Test utilities for G11N system
 * 
 * Provides pre-configured providers and utilities for testing i18n functionality
 */

import React from 'react';
import { I18nContext } from '../../src/react/context';
import { LocaleManager } from '../../src/core/locale-manager';
import { TranslationStore } from '../../src/core/translation-store';
import { Translator } from '../../src/core/translator';
import { Interpolator } from '../../src/core/interpolator';
import { Pluralizer } from '../../src/core/pluralizer';
import { FormatService } from '../../src/core/format-service';
import { CollationService } from '../../src/core/collation-service';
import { DisplayNamesService } from '../../src/core/display-names-service';
import { SegmentationService } from '../../src/core/segmentation-service';
import { DocumentService } from '../../src/core/document-service';
import { MockTranslationLoader } from '../fixtures/translations';
import type { I18nConfig, I18nContextValue, TranslationKey, TranslationOptions } from '../../src/types';

export interface TestI18nProviderProps {
  config: I18nConfig;
  children: React.ReactNode;
  initialLocale?: string;
  onError?: (error: Error) => void;
}

/**
 * Test-specific I18n Provider that uses mock translations
 */
export function TestI18nProvider({ config, children, initialLocale, onError }: TestI18nProviderProps) {
  const [locale, setLocale] = React.useState(initialLocale || config.defaultLocale);
  const [isReady, setIsReady] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Initialize services
  const servicesRef = React.useRef<{
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
    const translationLoader = new MockTranslationLoader() as any;
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
  }

  const services = servicesRef.current;

  // Load initial translations
  React.useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoading(true);
        const namespaces = config.namespaces || [config.defaultNamespace || 'common'];
        await Promise.all(
          namespaces.map(ns => services.translationStore.loadNamespace(locale, ns))
        );
        setIsReady(true);
      } catch (error) {
        console.error('Failed to load translations:', error);
        if (onError) {
          onError(error as Error);
        }
        setIsReady(true); // Set ready anyway to not block tests
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [locale, config, services, onError]);

  // Translation function
  const t = React.useCallback(
    <K extends TranslationKey>(key: K, options?: TranslationOptions<K>): string => {
      return services.translator.translate(locale, key, options);
    },
    [locale, services]
  );

  // Change locale function
  const changeLocale = React.useCallback(
    async (newLocale: string) => {
      try {
        setIsLoading(true);
        await services.localeManager.setLocale(newLocale);
        setLocale(newLocale);
        
        // Update all services
        services.formatService.setLocale(newLocale);
        services.collationService.setLocale(newLocale);
        services.displayNamesService.setLocale(newLocale);
        services.segmentationService.setLocale(newLocale);
        services.documentService.updateDocumentLocale(newLocale);

        // Load translations for new locale
        const namespaces = config.namespaces || [config.defaultNamespace || 'common'];
        await Promise.all(
          namespaces.map(ns => services.translationStore.loadNamespace(newLocale, ns))
        );
      } catch (error) {
        console.error('Failed to change locale:', error);
        if (onError) {
          onError(error as Error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [config, services, onError]
  );

  const contextValue: I18nContextValue = React.useMemo(() => {
    const locales = services.localeManager.getSupportedLocales();

    return {
      locale,
      locales,
      isReady,
      isLoading,
      t,
      changeLocale,
      format: services.formatService,
      collation: services.collationService,
      displayNames: services.displayNamesService,
      segmentation: services.segmentationService,
      document: services.documentService,
      config,
    };
  }, [locale, isReady, isLoading, t, changeLocale, services, config]);

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}
