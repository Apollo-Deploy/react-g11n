/**
 * Test helper for standalone i18n API
 * 
 * Provides utilities to initialize standalone API with mock translations
 */

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
import type { I18nConfig, TranslationKey, TranslationOptions, LocaleInfo } from '../../src/types';

export interface StandaloneI18n {
  t: <K extends TranslationKey>(key: K, options?: TranslationOptions<K>) => string;
  format: FormatService;
  collation: CollationService;
  displayNames: DisplayNamesService;
  segmentation: SegmentationService;
  document: DocumentService;
  getLocale(): string;
  getSupportedLocales(): LocaleInfo[];
  changeLocale(locale: string): Promise<void>;
  init(config: I18nConfig): Promise<void>;
  isInitialized(): boolean;
  subscribe(listener: (locale: string) => void): () => void;
  loadNamespaces(namespaces: string[]): Promise<void>;
  getMissingKeys(): string[];
}

/**
 * Create a test standalone i18n instance with mock translations
 */
export function createTestStandaloneI18n(): StandaloneI18n {
  let config: I18nConfig | null = null;
  let localeManager: LocaleManager | null = null;
  let translationStore: TranslationStore | null = null;
  let translator: Translator | null = null;
  let formatService: FormatService | null = null;
  let collationService: CollationService | null = null;
  let displayNamesService: DisplayNamesService | null = null;
  let segmentationService: SegmentationService | null = null;
  let documentService: DocumentService | null = null;
  let initialized = false;

  const api: StandaloneI18n = {
    t: <K extends TranslationKey>(key: K, options?: TranslationOptions<K>): string => {
      if (!translator || !localeManager) {
        return key;
      }
      return translator.translate(localeManager.getCurrentLocale(), key, options);
    },

    get format() {
      if (!formatService) {
        throw new Error('i18n not initialized');
      }
      return formatService;
    },

    get collation() {
      if (!collationService) {
        throw new Error('i18n not initialized');
      }
      return collationService;
    },

    get displayNames() {
      if (!displayNamesService) {
        throw new Error('i18n not initialized');
      }
      return displayNamesService;
    },

    get segmentation() {
      if (!segmentationService) {
        throw new Error('i18n not initialized');
      }
      return segmentationService;
    },

    get document() {
      if (!documentService) {
        throw new Error('i18n not initialized');
      }
      return documentService;
    },

    getLocale(): string {
      if (!localeManager) {
        throw new Error('i18n not initialized');
      }
      return localeManager.getCurrentLocale();
    },

    getSupportedLocales(): LocaleInfo[] {
      if (!localeManager) {
        throw new Error('i18n not initialized');
      }
      return localeManager.getSupportedLocales();
    },

    async changeLocale(locale: string): Promise<void> {
      if (!localeManager || !translationStore || !formatService || !collationService || !displayNamesService || !segmentationService || !documentService || !config) {
        throw new Error('i18n not initialized');
      }

      await localeManager.setLocale(locale);
      
      // Update all services
      formatService.setLocale(locale);
      collationService.setLocale(locale);
      displayNamesService.setLocale(locale);
      segmentationService.setLocale(locale);
      documentService.updateDocumentLocale(locale);

      // Load translations for new locale
      const namespaces = config.namespaces || [config.defaultNamespace || 'common'];
      await Promise.all(
        namespaces.map(ns => translationStore?.loadNamespace(locale, ns))
      );
    },

    async init(cfg: I18nConfig): Promise<void> {
      config = cfg;
      
      // Initialize services with mock loader
      const loader = new MockTranslationLoader() as any;
      localeManager = new LocaleManager(config);
      translationStore = new TranslationStore(loader);
      const interpolator = new Interpolator(config.interpolation);
      const pluralizer = new Pluralizer();
      translator = new Translator(translationStore, interpolator, pluralizer, config);
      
      const currentLocale = localeManager.getCurrentLocale();
      formatService = new FormatService(currentLocale);
      collationService = new CollationService(currentLocale);
      displayNamesService = new DisplayNamesService(currentLocale);
      segmentationService = new SegmentationService(currentLocale);
      documentService = new DocumentService();

      // Load initial translations
      const namespaces = config.namespaces || [config.defaultNamespace || 'common'];
      await Promise.all(
        namespaces.map(ns => translationStore!.loadNamespace(currentLocale, ns))
      );

      initialized = true;
    },

    isInitialized(): boolean {
      return initialized;
    },

    subscribe(listener: (locale: string) => void): () => void {
      if (!localeManager) {
        throw new Error('i18n not initialized');
      }
      return localeManager.subscribe(listener);
    },

    async loadNamespaces(namespaces: string[]): Promise<void> {
      if (!translationStore || !localeManager) {
        throw new Error('i18n not initialized');
      }
      const locale = localeManager.getCurrentLocale();
      await Promise.all(
        namespaces.map(ns => translationStore!.loadNamespace(locale, ns))
      );
    },

    getMissingKeys(): string[] {
      // Not implemented for tests
      return [];
    },
  };

  return api;
}
