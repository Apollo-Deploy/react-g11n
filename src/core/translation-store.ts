/**
 * TranslationStore class for managing translation data storage and caching
 * 
 * Handles:
 * - Map-based caching of loaded translations
 * - Namespace loading with deduplication of concurrent requests
 * - Tracking of missing translation keys
 * - Preloading functionality for specific locales
 * - Cache management
 */

import type { TranslationNamespace } from '../types';
import type { TranslationLoader } from './translation-loader';

export class TranslationStore {
  // Map structure: locale -> namespace -> translations
  private translations: Map<string, Map<string, TranslationNamespace>>;
  
  // Track ongoing loading promises to prevent duplicate requests
  private loadingPromises: Map<string, Promise<void>>;
  
  // Track missing translation keys for debugging
  private missingKeys: Set<string>;

  constructor(private loader: TranslationLoader) {
    this.translations = new Map();
    this.loadingPromises = new Map();
    this.missingKeys = new Set();
  }

  /**
   * Load a namespace for a specific locale
   * Deduplicates concurrent requests for the same namespace
   * 
   * @param locale - The locale code
   * @param namespace - The namespace to load
   * @returns Promise that resolves when the namespace is loaded
   */
  async loadNamespace(locale: string, namespace: string): Promise<void> {
    const key = `${locale}:${namespace}`;

    // If already loaded, return immediately
    if (this.hasNamespace(locale, namespace)) {
      return;
    }

    // If currently loading, return the existing promise
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }

    // Start loading
    const loadingPromise = this.performLoad(locale, namespace, key);
    this.loadingPromises.set(key, loadingPromise);

    try {
      await loadingPromise;
    } finally {
      // Clean up the loading promise
      this.loadingPromises.delete(key);
    }
  }

  /**
   * Perform the actual loading of a namespace
   * 
   * @param locale - The locale code
   * @param namespace - The namespace to load
   * @param key - The cache key
   */
  private async performLoad(locale: string, namespace: string, key: string): Promise<void> {
    try {
      const data = await this.loader.loadTranslation(locale, namespace);
      this.cacheTranslation(locale, namespace, data);
    } catch (error) {
      // Even if loading fails, cache an empty object to prevent repeated attempts
      this.cacheTranslation(locale, namespace, {});
      
      if (process.env.NODE_ENV !== 'production') {
        console.error(`[i18n] Failed to load namespace: ${key}`, error);
      }
    }
  }

  /**
   * Get a translation for a specific key
   * 
   * @param locale - The locale code
   * @param namespace - The namespace
   * @param key - The translation key (supports dot notation)
   * @returns The translation string or undefined if not found
   */
  getTranslation(locale: string, namespace: string, key: string): string | undefined {
    const namespaceData = this.getNamespaceData(locale, namespace);
    
    if (!namespaceData) {
      return undefined;
    }

    const value = this.resolveKey(namespaceData, key);
    
    if (value === undefined) {
      this.trackMissingKey(`${locale}:${namespace}:${key}`);
    }

    return value;
  }

  /**
   * Check if a namespace is loaded for a locale
   * 
   * @param locale - The locale code
   * @param namespace - The namespace
   * @returns true if the namespace is loaded
   */
  hasNamespace(locale: string, namespace: string): boolean {
    const localeData = this.translations.get(locale);
    return localeData?.has(namespace) ?? false;
  }

  /**
   * Preload multiple namespaces for a locale
   * Useful for preloading translations before switching locales
   * 
   * @param locale - The locale code
   * @param namespaces - Array of namespace names to preload
   * @returns Promise that resolves when all namespaces are loaded
   */
  async preloadLocale(locale: string, namespaces: string[]): Promise<void> {
    const loadPromises = namespaces.map(namespace => 
      this.loadNamespace(locale, namespace)
    );
    
    await Promise.all(loadPromises);
  }

  /**
   * Get all missing translation keys that have been tracked
   * 
   * @returns Array of missing key identifiers
   */
  getMissingKeys(): string[] {
    return Array.from(this.missingKeys);
  }

  /**
   * Clear all cached translations
   * Useful for testing or forcing a reload
   */
  clearCache(): void {
    this.translations.clear();
    this.loadingPromises.clear();
    this.missingKeys.clear();
  }

  /**
   * Clear cache for a specific locale
   * 
   * @param locale - The locale code
   */
  clearLocaleCache(locale: string): void {
    this.translations.delete(locale);
    
    // Clear any loading promises for this locale
    const keysToDelete: string[] = [];
    for (const key of this.loadingPromises.keys()) {
      if (key.startsWith(`${locale}:`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.loadingPromises.delete(key));
  }

  /**
   * Cache a loaded translation namespace
   * 
   * @param locale - The locale code
   * @param namespace - The namespace
   * @param data - The translation data
   */
  private cacheTranslation(
    locale: string,
    namespace: string,
    data: TranslationNamespace
  ): void {
    if (!this.translations.has(locale)) {
      this.translations.set(locale, new Map());
    }

    const localeData = this.translations.get(locale)!;
    localeData.set(namespace, data);
  }

  /**
   * Get the namespace data for a locale
   * 
   * @param locale - The locale code
   * @param namespace - The namespace
   * @returns The namespace data or undefined
   */
  private getNamespaceData(locale: string, namespace: string): TranslationNamespace | undefined {
    const localeData = this.translations.get(locale);
    return localeData?.get(namespace);
  }

  /**
   * Resolve a key using dot notation in a nested object
   * 
   * @param data - The translation namespace data
   * @param key - The key to resolve (supports dot notation)
   * @returns The resolved value or undefined
   */
  private resolveKey(data: TranslationNamespace, key: string): string | undefined {
    const keys = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = data;

    for (const k of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }

      if (typeof current !== 'object') {
        return undefined;
      }

      current = current[k];
    }

    // Only return if it's a string or can be converted to string
    if (typeof current === 'string') {
      return current;
    }

    // If it's an object (plural forms), return undefined
    // The Translator will handle plural resolution
    if (typeof current === 'object' && current !== null) {
      return undefined;
    }

    return current !== undefined ? String(current) : undefined;
  }

  /**
   * Track a missing translation key
   * 
   * @param key - The full key identifier (locale:namespace:key)
   */
  private trackMissingKey(key: string): void {
    this.missingKeys.add(key);
  }

  /**
   * Get raw namespace data (useful for plural resolution)
   * 
   * @param locale - The locale code
   * @param namespace - The namespace
   * @param key - The translation key
   * @returns The raw data at the key path (could be string or object)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRawData(locale: string, namespace: string, key: string): any {
    const namespaceData = this.getNamespaceData(locale, namespace);
    
    if (!namespaceData) {
      return undefined;
    }

    const keys = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = namespaceData;

    for (const k of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }

      if (typeof current !== 'object') {
        return undefined;
      }

      current = current[k];
    }

    return current;
  }
}
