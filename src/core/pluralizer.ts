/**
 * Pluralizer class for handling pluralization in translations
 * 
 * Handles:
 * - CLDR-compliant plural form selection
 * - Ordinal pluralization (1st, 2nd, 3rd, etc.)
 * - Contextual pluralization (gender, formality)
 * - Interval-based pluralization
 * - Fallback to 'other' form when specific form is missing
 */

import { PluralForm } from "../types";
import { getPluralForm } from "../utils/cldr-rules";

export class Pluralizer {
  /**
   * Pluralize a translation based on count and locale
   * 
   * @param locale - The current locale
   * @param count - The count to determine plural form
   * @param translations - Object containing plural translations
   * @param ordinal - Whether to use ordinal pluralization
   * @param context - Optional context for contextual pluralization
   * @returns The appropriate plural translation
   */
  pluralize(
    locale: string,
    count: number,
    translations: Record<string, any>,
    ordinal: boolean = false,
    context?: string
  ): string {
    // Handle interval-based pluralization first
    const intervalResult = this.tryIntervalPluralization(count, translations);
    if (intervalResult !== null) {
      return intervalResult;
    }

    // Handle contextual pluralization
    if (context && translations[context]) {
      const contextualTranslations = translations[context];
      if (typeof contextualTranslations === 'object') {
        const contextualResult = this.selectPluralTranslation(
          locale,
          count,
          contextualTranslations,
          ordinal
        );
        if (contextualResult !== null) {
          return contextualResult;
        }
      }
    }

    // Standard pluralization
    return this.selectPluralTranslation(locale, count, translations, ordinal) || String(count);
  }

  /**
   * Get the plural form for a given count and locale
   * 
   * @param locale - The locale code
   * @param count - The count to determine plural form for
   * @param ordinal - Whether to use ordinal rules
   * @returns The plural form (zero, one, two, few, many, other)
   */
  getPluralForm(locale: string, count: number, ordinal: boolean = false): PluralForm {
    return getPluralForm(locale, count, ordinal);
  }

  /**
   * Select the appropriate plural translation based on CLDR rules
   * 
   * @param locale - The current locale
   * @param count - The count to determine plural form
   * @param translations - Object containing plural translations
   * @param ordinal - Whether to use ordinal pluralization
   * @returns The selected translation or null if not found
   */
  private selectPluralTranslation(
    locale: string,
    count: number,
    translations: Record<string, any>,
    ordinal: boolean
  ): string | null {
    // Get the plural form for this count and locale
    const form = this.getPluralForm(locale, count, ordinal);

    // Try to get the translation for the specific form
    if (translations[form] !== undefined) {
      return String(translations[form]);
    }

    // Fall back to 'other' form if specific form is missing
    if (form !== 'other' && translations.other !== undefined) {
      return String(translations.other);
    }

    // If no suitable translation found, return null
    return null;
  }

  /**
   * Try to match count against interval-based pluralization rules
   * 
   * Supports formats like:
   * - "0": "no items"
   * - "1": "one item"
   * - "2-5": "a few items"
   * - "6-10": "several items"
   * - "11+": "many items"
   * 
   * @param count - The count to check
   * @param translations - Object containing translations
   * @returns The matched translation or null if no interval matches
   */
  private tryIntervalPluralization(
    count: number,
    translations: Record<string, any>
  ): string | null {
    // Check for exact match first
    if (translations[String(count)] !== undefined) {
      return String(translations[String(count)]);
    }

    // Check for interval matches
    for (const key in translations) {
      if (this.isIntervalKey(key)) {
        if (this.matchesInterval(count, key)) {
          return String(translations[key]);
        }
      }
    }

    return null;
  }

  /**
   * Check if a key represents an interval pattern
   * 
   * @param key - The translation key to check
   * @returns true if the key is an interval pattern
   */
  private isIntervalKey(key: string): boolean {
    // Match patterns like "2-5", "10-20", "100+"
    return /^\d+-\d+$/.test(key) || /^\d+\+$/.test(key);
  }

  /**
   * Check if a count matches an interval pattern
   * 
   * @param count - The count to check
   * @param interval - The interval pattern (e.g., "2-5", "10+")
   * @returns true if the count matches the interval
   */
  private matchesInterval(count: number, interval: string): boolean {
    // Handle "X+" pattern (e.g., "10+" means 10 or more)
    if (interval.endsWith('+')) {
      const min = parseInt(interval.slice(0, -1), 10);
      return count >= min;
    }

    // Handle "X-Y" pattern (e.g., "2-5" means 2, 3, 4, or 5)
    if (interval.includes('-')) {
      const [minStr, maxStr] = interval.split('-');
      if (minStr && maxStr) {
        const min = parseInt(minStr, 10);
        const max = parseInt(maxStr, 10);
        return count >= min && count <= max;
      }
    }

    return false;
  }
}
