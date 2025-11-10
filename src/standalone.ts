/**
 * Standalone i18n API for non-React usage
 * 
 * This module provides a singleton i18n instance that can be used outside
 * of React components (e.g., in utility functions, services, middleware).
 * 
 * Features:
 * - Works independently of React
 * - Synchronizes with React context when both are used
 * - Provides translation and formatting functions
 * - Manages locale state
 * 
 * Usage:
 * ```typescript
 * import { i18n } from 'react-g11n/standalone';
 * 
 * // Initialize (required before use)
 * await i18n.init({
 *   defaultLocale: 'en',
 *   supportedLocales: ['en', 'es', 'fr'],
 * });
 * 
 * // Use translations
 * const greeting = i18n.t('common.greeting', { name: 'John' });
 * 
 * // Format dates, numbers, etc.
 * const formattedDate = i18n.format.date(new Date());
 * 
 * // Change locale
 * await i18n.changeLocale('es');
 * ```
 */

import type {
  I18nConfig,
  TranslationKey,
  TranslationOptions,
  TranslateFn,
  LocaleInfo,
  FormatService as IFormatService,
  CollationService as ICollationService,
  DisplayNamesService as IDisplayNamesService,
  SegmentationService as ISegmentationService,
  DocumentService as IDocumentService,
} from './types';
import { LocaleManager } from './core/locale-manager';
import { TranslationStore } from './core/translation-store';
import { TranslationLoader } from './core/translation-loader';
import { Translator } from './core/translator';
import { Interpolator } from './core/interpolator';
import { Pluralizer } from './core/pluralizer';
import { FormatService } from './core/format-service';
import { CollationService } from './core/collation-service';
import { DisplayNamesService } from './core/display-names-service';
import { SegmentationService } from './core/segmentation-service';
import { DocumentService } from './core/document-service';

/**
 * Locale change listener function
 */
export type StandaloneLocaleChangeListener = (locale: string) => void;

/**
 * Standalone i18n instance interface
 */
export interface StandaloneI18n {
  /** Translation function */
  t: TranslateFn;
  /** Format service for dates, numbers, currencies, etc. */
  format: IFormatService;
  /** Collation service for locale-aware string sorting and comparison */
  collation: ICollationService;
  /** Display names service for localized names */
  displayNames: IDisplayNamesService;
  /** Segmentation service for text segmentation */
  segmentation: ISegmentationService;
  /** Document service for document-level language attributes */
  document: IDocumentService;
  /** Get the current locale */
  getLocale(): string;
  /** Get all supported locales */
  getSupportedLocales(): LocaleInfo[];
  /** Change the current locale */
  changeLocale(locale: string): Promise<void>;
  /** Initialize the i18n system */
  init(config: I18nConfig): Promise<void>;
  /** Check if the system is initialized */
  isInitialized(): boolean;
  /** Subscribe to locale changes */
  subscribe(listener: StandaloneLocaleChangeListener): () => void;
  /** Load additional namespaces */
  loadNamespaces(namespaces: string[]): Promise<void>;
  /** Get missing translation keys (for debugging) */
  getMissingKeys(): string[];
}

/**
 * Standalone i18n implementation
 */
class StandaloneI18nImpl implements StandaloneI18n {
  private localeManager: LocaleManager | null = null;
  private translationStore: TranslationStore | null = null;
  private translator: Translator | null = null;
  private formatService: FormatService | null = null;
  private collationService: CollationService | null = null;
  private displayNamesService: DisplayNamesService | null = null;
  private segmentationService: SegmentationService | null = null;
  private documentService: DocumentService | null = null;
  private config: I18nConfig | null = null;
  private initialized = false;
  private externalListeners: Set<StandaloneLocaleChangeListener> = new Set();

  /**
   * Initialize the standalone i18n system
   * 
   * @param config - i18n configuration
   * @throws {Error} If already initialized
   */
  async init(config: I18nConfig): Promise<void> {
    if (this.initialized) {
      console.warn('[i18n] Standalone API is already initialized. Skipping re-initialization.');
      return;
    }

    this.config = config;

    // Initialize core services
    this.localeManager = new LocaleManager(config);
    const translationLoader = new TranslationLoader(config);
    this.translationStore = new TranslationStore(translationLoader);
    const interpolator = new Interpolator(config.interpolation);
    const pluralizer = new Pluralizer();
    this.translator = new Translator(
      this.translationStore,
      interpolator,
      pluralizer,
      config
    );
    const currentLocale = this.localeManager.getCurrentLocale();
    this.formatService = new FormatService(currentLocale);
    this.collationService = new CollationService(currentLocale);
    this.displayNamesService = new DisplayNamesService(currentLocale);
    this.segmentationService = new SegmentationService(currentLocale);
    this.documentService = new DocumentService();

    // Update document locale on initialization
    this.documentService.updateDocumentLocale(currentLocale);

    // Subscribe to locale changes to update all services
    this.localeManager.subscribe((newLocale) => {
      if (this.formatService) {
        this.formatService.setLocale(newLocale);
      }
      if (this.collationService) {
        this.collationService.setLocale(newLocale);
      }
      if (this.displayNamesService) {
        this.displayNamesService.setLocale(newLocale);
      }
      if (this.segmentationService) {
        this.segmentationService.setLocale(newLocale);
      }
      if (this.documentService) {
        this.documentService.updateDocumentLocale(newLocale);
      }
      // Notify external listeners
      this.notifyExternalListeners(newLocale);
    });

    // Load initial translations
    const namespacesToLoad = config.namespaces || ['common'];
    await this.translationStore.preloadLocale(currentLocale, namespacesToLoad);

    this.initialized = true;

    if (config.debug) {
      console.warn('[i18n] Standalone API initialized with locale:', currentLocale);
    }
  }

  /**
   * Check if the system is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Translation function
   * 
   * @param key - Translation key
   * @param options - Translation options
   * @returns Translated string
   * @throws {Error} If not initialized
   */
  t: TranslateFn = <K extends TranslationKey>(
    key: K,
    options?: TranslationOptions<K>
  ): string => {
    this.ensureInitialized();
    const locale = this.localeManager!.getCurrentLocale();
    return this.translator!.translate(locale, key, options);
  };

  /**
   * Get the format service
   * 
   * @throws {Error} If not initialized
   */
  get format(): IFormatService {
    this.ensureInitialized();
    return this.formatService!;
  }

  /**
   * Get the collation service
   * 
   * @throws {Error} If not initialized
   */
  get collation(): ICollationService {
    this.ensureInitialized();
    return this.collationService!;
  }

  /**
   * Get the display names service
   * 
   * @throws {Error} If not initialized
   */
  get displayNames(): IDisplayNamesService {
    this.ensureInitialized();
    return this.displayNamesService!;
  }

  /**
   * Get the segmentation service
   * 
   * @throws {Error} If not initialized
   */
  get segmentation(): ISegmentationService {
    this.ensureInitialized();
    return this.segmentationService!;
  }

  /**
   * Get the document service
   * 
   * @throws {Error} If not initialized
   */
  get document(): IDocumentService {
    this.ensureInitialized();
    return this.documentService!;
  }

  /**
   * Get the current locale
   * 
   * @returns Current locale code
   * @throws {Error} If not initialized
   */
  getLocale(): string {
    this.ensureInitialized();
    return this.localeManager!.getCurrentLocale();
  }

  /**
   * Get all supported locales
   * 
   * @returns Array of locale information
   * @throws {Error} If not initialized
   */
  getSupportedLocales(): LocaleInfo[] {
    this.ensureInitialized();
    return this.localeManager!.getSupportedLocales();
  }

  /**
   * Change the current locale
   * 
   * @param locale - New locale code
   * @throws {Error} If not initialized or locale is invalid
   */
  async changeLocale(locale: string): Promise<void> {
    this.ensureInitialized();

    // Load translations for the new locale
    const namespacesToLoad = this.config!.namespaces || ['common'];
    await this.translationStore!.preloadLocale(locale, namespacesToLoad);

    // Update locale in LocaleManager (this will trigger subscriptions)
    await this.localeManager!.setLocale(locale);
  }

  /**
   * Subscribe to locale changes
   * 
   * @param listener - Function to call when locale changes
   * @returns Unsubscribe function
   * @throws {Error} If not initialized
   */
  subscribe(listener: StandaloneLocaleChangeListener): () => void {
    this.ensureInitialized();
    this.externalListeners.add(listener);

    return () => {
      this.externalListeners.delete(listener);
    };
  }

  /**
   * Load additional namespaces for the current locale
   * 
   * @param namespaces - Array of namespace names to load
   * @throws {Error} If not initialized
   */
  async loadNamespaces(namespaces: string[]): Promise<void> {
    this.ensureInitialized();
    const currentLocale = this.localeManager!.getCurrentLocale();
    await this.translationStore!.preloadLocale(currentLocale, namespaces);
  }

  /**
   * Get missing translation keys (for debugging)
   * 
   * @returns Array of missing translation keys
   * @throws {Error} If not initialized
   */
  getMissingKeys(): string[] {
    this.ensureInitialized();
    return this.translationStore!.getMissingKeys();
  }

  /**
   * Ensure the system is initialized
   * 
   * @throws {Error} If not initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        '[i18n] Standalone API is not initialized. Call i18n.init(config) before using.'
      );
    }
  }

  /**
   * Notify external listeners of locale change
   * 
   * @param locale - New locale code
   */
  private notifyExternalListeners(locale: string): void {
    this.externalListeners.forEach((listener) => {
      try {
        listener(locale);
      } catch (error) {
        console.error('[i18n] Error in standalone locale change listener:', error);
      }
    });
  }

  /**
   * Internal method to synchronize with React context
   * This is called by the I18nProvider to keep standalone and React in sync
   * 
   * @internal
   */
  _syncWithReact(
    localeManager: LocaleManager,
    translationStore: TranslationStore,
    translator: Translator,
    formatService: FormatService,
    collationService: CollationService,
    displayNamesService: DisplayNamesService,
    segmentationService: SegmentationService,
    documentService: DocumentService,
    config: I18nConfig
  ): void {
    // Only sync if not already initialized or if we want to use React's instances
    if (!this.initialized) {
      this.localeManager = localeManager;
      this.translationStore = translationStore;
      this.translator = translator;
      this.formatService = formatService;
      this.collationService = collationService;
      this.displayNamesService = displayNamesService;
      this.segmentationService = segmentationService;
      this.documentService = documentService;
      this.config = config;
      this.initialized = true;

      // Subscribe to React's locale changes
      this.localeManager.subscribe((newLocale) => {
        this.notifyExternalListeners(newLocale);
      });

      if (config.debug) {
        console.warn('[i18n] Standalone API synchronized with React context');
      }
    }
  }

  /**
   * Internal method to notify standalone listeners from React
   * This allows React locale changes to propagate to standalone listeners
   * 
   * @internal
   */
  _notifyFromReact(locale: string): void {
    this.notifyExternalListeners(locale);
  }
}

/**
 * Singleton instance of the standalone i18n API
 */
export const i18n: StandaloneI18n = new StandaloneI18nImpl();

/**
 * Type guard to check if i18n is the implementation (for internal use)
 * @internal
 */
export function isStandaloneImpl(instance: StandaloneI18n): instance is StandaloneI18nImpl {
  return instance instanceof StandaloneI18nImpl;
}
