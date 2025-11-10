/**
 * DocumentService
 * 
 * Manages document-level globalization attributes including language and text direction.
 * Updates HTML lang and dir attributes to ensure proper accessibility and browser behavior.
 */

export class DocumentService {
  /**
   * Updates the document's language attribute
   * Handles full locale codes including subtags (e.g., "en-US", "zh-Hans")
   * 
   * @param locale - The locale code to set (e.g., "en", "en-US", "zh-Hans")
   */
  updateDocumentLanguage(locale: string): void {
    if (typeof document === 'undefined') {
      // Server-side rendering or non-browser environment
      return;
    }

    const htmlElement = document.documentElement;
    if (htmlElement) {
      htmlElement.setAttribute('lang', locale);
    }
  }

  /**
   * Updates the document's text direction attribute
   * 
   * @param direction - The text direction ('ltr' or 'rtl')
   */
  updateDocumentDirection(direction: 'ltr' | 'rtl'): void {
    if (typeof document === 'undefined') {
      // Server-side rendering or non-browser environment
      return;
    }

    const htmlElement = document.documentElement;
    if (htmlElement) {
      htmlElement.setAttribute('dir', direction);
    }
  }

  /**
   * Gets the current document language attribute
   * 
   * @returns The current lang attribute value or null if not set
   */
  getDocumentLanguage(): string | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const htmlElement = document.documentElement;
    return htmlElement ? htmlElement.getAttribute('lang') : null;
  }

  /**
   * Gets the current document text direction attribute
   * 
   * @returns The current dir attribute value or null if not set
   */
  getDocumentDirection(): string | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const htmlElement = document.documentElement;
    return htmlElement ? htmlElement.getAttribute('dir') : null;
  }

  /**
   * Updates both language and direction attributes
   * Automatically determines direction based on locale
   * 
   * @param locale - The locale code to set
   */
  updateDocumentLocale(locale: string): void {
    this.updateDocumentLanguage(locale);
    
    // Determine direction based on locale
    const direction = this.getDirectionForLocale(locale);
    this.updateDocumentDirection(direction);
  }

  /**
   * Determines the text direction for a given locale
   * 
   * @param locale - The locale code
   * @returns 'rtl' for right-to-left languages, 'ltr' otherwise
   */
  private getDirectionForLocale(locale: string): 'ltr' | 'rtl' {
    // Extract the base language code (before any subtags)
    const baseLanguage = locale.split('-')[0]?.toLowerCase() || 'en';
    
    // List of RTL languages
    const rtlLanguages = [
      'ar', // Arabic
      'he', // Hebrew
      'fa', // Persian/Farsi
      'ur', // Urdu
      'yi', // Yiddish
      'ji', // Yiddish (alternative code)
      'iw', // Hebrew (alternative code)
      'ps', // Pashto
      'sd', // Sindhi
      'ug', // Uyghur
      'ku', // Kurdish (some variants)
    ];

    return rtlLanguages.includes(baseLanguage) ? 'rtl' : 'ltr';
  }

  /**
   * Parses a locale code into its components
   * 
   * @param locale - The locale code (e.g., "en-US", "zh-Hans-CN")
   * @returns An object with language, script, and region components
   */
  parseLocale(locale: string): {
    language: string;
    script?: string;
    region?: string;
    full: string;
  } {
    const parts = locale.split('-');
    const result: {
      language: string;
      script?: string;
      region?: string;
      full: string;
    } = {
      language: parts[0]?.toLowerCase() || 'en',
      full: locale,
    };

    // Parse subtags
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      
      if (!part) continue;
      
      // Script codes are 4 characters (e.g., "Hans", "Latn")
      if (part.length === 4) {
        result.script = part;
      }
      // Region codes are 2 characters (e.g., "US", "CN")
      else if (part.length === 2) {
        result.region = part.toUpperCase();
      }
    }

    return result;
  }

  /**
   * Validates a locale code format
   * 
   * @param locale - The locale code to validate
   * @returns true if the locale format is valid
   */
  isValidLocaleFormat(locale: string): boolean {
    // Basic validation: should start with 2-3 letter language code
    const localePattern = /^[a-z]{2,3}(-[A-Z][a-z]{3})?(-[A-Z]{2})?$/i;
    return localePattern.test(locale);
  }
}
