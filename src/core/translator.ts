/**
 * Translator class - core translation engine
 * 
 * Orchestrates:
 * - Translation key resolution with namespace support
 * - Variable interpolation via Interpolator
 * - Pluralization via Pluralizer
 * - Missing translation handling with fallbacks
 * - Development mode warnings
 */

import { I18nConfig, TranslationKey, TranslationOptions } from '../types';
import { Interpolator } from './interpolator';
import { Pluralizer } from './pluralizer';
import type { TranslationStore } from './translation-store';

export class Translator {
  private readonly defaultNamespace: string;
  private readonly fallbackLocale?: string;
  private readonly debug: boolean;

  constructor(
    private store: TranslationStore,
    private interpolator: Interpolator,
    private pluralizer: Pluralizer,
    config: I18nConfig
  ) {
    this.defaultNamespace = config.defaultNamespace ?? 'common';
    this.fallbackLocale = config.fallbackLocale;
    this.debug = config.debug ?? false;
  }

  /**
   * Translate a key to a localized string
   * 
   * @param locale - The current locale
   * @param key - The translation key
   * @param options - Translation options (count, context, interpolation, etc.)
   * @returns The translated string
   */
  translate<K extends TranslationKey>(
    locale: string,
    key: K,
    options?: TranslationOptions<K>
  ): string {
    const namespace = options?.ns ?? this.defaultNamespace;

    // Try to resolve the translation
    let translation = this.resolveKey(locale, key, namespace, options);

    // If not found and fallback locale is configured, try fallback
    if (translation === null && this.fallbackLocale && this.fallbackLocale !== locale) {
      translation = this.resolveKey(this.fallbackLocale, key, namespace, options);
    }

    // If still not found, apply final fallback
    if (translation === null) {
      return this.applyFallback(key, options);
    }

    return translation;
  }

  /**
   * Resolve a translation key to a string
   * 
   * @param locale - The locale to use
   * @param key - The translation key
   * @param namespace - The namespace
   * @param options - Translation options
   * @returns The resolved translation or null if not found
   */
  private resolveKey(
    locale: string,
    key: string,
    namespace: string,
    options?: TranslationOptions<any>
  ): string | null {
    // Check if we need pluralization
    if (options?.count !== undefined) {
      return this.resolvePluralKey(locale, key, namespace, options);
    }

    // Standard key resolution
    const translation = this.store.getTranslation(locale, namespace, key);

    if (translation === undefined) {
      return null;
    }

    // Apply interpolation if needed
    const interpolationVars = this.extractInterpolationVars(options);
    if (interpolationVars && Object.keys(interpolationVars).length > 0) {
      return this.interpolator.interpolate(translation, interpolationVars);
    }

    return translation;
  }

  /**
   * Extract interpolation variables from options
   * Supports both options.interpolation and direct properties
   * 
   * @param options - Translation options
   * @returns Interpolation variables or undefined
   */
  private extractInterpolationVars(options?: TranslationOptions<any>): Record<string, any> | undefined {
    if (!options) {
      return undefined;
    }

    // If interpolation property exists, use it
    if (options.interpolation) {
      return options.interpolation;
    }

    // Otherwise, extract all non-reserved properties as interpolation vars
    const reservedKeys = ['count', 'ordinal', 'context', 'defaultValue', 'ns', 'interpolation', '_key'];
    const vars: Record<string, any> = {};
    let hasVars = false;

    for (const key in options) {
      if (!reservedKeys.includes(key) && options.hasOwnProperty(key)) {
        vars[key] = options[key];
        hasVars = true;
      }
    }

    return hasVars ? vars : undefined;
  }

  /**
   * Resolve a plural translation key
   * 
   * @param locale - The locale to use
   * @param key - The translation key
   * @param namespace - The namespace
   * @param options - Translation options with count
   * @returns The resolved plural translation or null if not found
   */
  private resolvePluralKey(
    locale: string,
    key: string,
    namespace: string,
    options: TranslationOptions<any>
  ): string | null {
    // Get the raw data which should be an object with plural forms
    const rawData = this.store.getRawData(locale, namespace, key);

    if (!rawData) {
      return null;
    }

    // Extract interpolation variables
    const interpolationVars = this.extractInterpolationVars(options);

    // If it's a string, just return it (not a plural form)
    if (typeof rawData === 'string') {
      if (interpolationVars || options.count !== undefined) {
        return this.interpolator.interpolate(rawData, {
          ...interpolationVars,
          count: options.count,
        });
      }
      return rawData;
    }

    // If it's an object, use the pluralizer
    if (typeof rawData === 'object' && rawData !== null) {
      const pluralTranslation = this.pluralizer.pluralize(
        locale,
        options.count!,
        rawData,
        options.ordinal ?? false,
        options.context
      );

      // Apply interpolation with count included
      if (interpolationVars || options.count !== undefined) {
        return this.interpolator.interpolate(pluralTranslation, {
          ...interpolationVars,
          count: options.count,
        });
      }

      return pluralTranslation;
    }

    return null;
  }

  /**
   * Apply fallback when translation is not found
   * 
   * @param key - The translation key
   * @param options - Translation options
   * @returns The fallback string
   */
  private applyFallback(key: string, options?: TranslationOptions<any>): string {
    // Log warning in development mode
    this.logMissingTranslation(key);

    // Use default value if provided
    if (options?.defaultValue) {
      return options.defaultValue;
    }

    // Return the key itself as ultimate fallback
    return key;
  }

  /**
   * Log a warning for missing translation in development mode
   * 
   * @param key - The missing translation key
   */
  private logMissingTranslation(key: string): void {
    if (this.debug || process.env.NODE_ENV !== 'production') {
      console.warn(`[i18n] Missing translation: ${key}`);
    }
  }
}
