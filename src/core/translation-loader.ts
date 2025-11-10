/**
 * TranslationLoader class for dynamically loading translation files
 * 
 * Handles:
 * - Dynamic imports of translation files
 * - Path resolution for translation files
 * - Graceful error handling
 * - Custom load paths from configuration
 */

import { I18nConfig, TranslationNamespace } from "../types";

export class TranslationLoader {
  private readonly loadPath: string;
  private readonly debug: boolean;

  constructor(config: I18nConfig) {
    // Default load path: locales/{{locale}}/{{namespace}}.json
    this.loadPath = config.loadPath ?? 'locales/{{locale}}/{{namespace}}.json';
    this.debug = config.debug ?? false;
  }

  /**
   * Load a translation file for a specific locale and namespace
   * 
   * @param locale - The locale code (e.g., 'en', 'es', 'fr')
   * @param namespace - The namespace (e.g., 'common', 'auth')
   * @returns Promise resolving to the translation namespace object
   * @throws TranslationLoadError if loading fails
   */
  async loadTranslation(locale: string, namespace: string): Promise<TranslationNamespace> {
    try {
      const path = this.getLoadPath(locale, namespace);
      
      if (this.debug) {
        console.log(`[i18n] Loading translation: ${path}`);
      }

      const translation = await this.resolveTranslationFile(locale, namespace);

      if (this.debug) {
        console.log(`[i18n] Successfully loaded: ${path}`);
      }

      return translation;
    } catch (error) {
      if (this.debug) {
        console.error(
          `[i18n] Failed to load translation: ${locale}/${namespace}`,
          error
        );
      }

      // Return empty object instead of throwing to allow graceful degradation
      // The TranslationStore will track missing keys
      return {};
    }
  }

  /**
   * Get the resolved load path for a locale and namespace
   * 
   * @param locale - The locale code
   * @param namespace - The namespace
   * @returns The resolved file path
   */
  getLoadPath(locale: string, namespace: string): string {
    return this.loadPath
      .replace('{{locale}}', locale)
      .replace('{{namespace}}', namespace)
      .replace('{{lng}}', locale) // Alternative placeholder
      .replace('{{ns}}', namespace); // Alternative placeholder
  }

  /**
   * Dynamically import a translation file
   * 
   * @param locale - The locale code
   * @param namespace - The namespace
   * @returns Promise resolving to the translation data
   */
  private async resolveTranslationFile(
    locale: string,
    namespace: string
  ): Promise<TranslationNamespace> {
    // Construct the path relative to the project root
    const path = this.getLoadPath(locale, namespace);
    
    // Ensure path starts with / for absolute path from public root
    const fetchPath = path.startsWith('/') ? path : `/${path}`;
    
    // Use fetch to load translation files as static assets
    // This works in both development and production
    const response = await fetch(fetchPath);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  }
}
