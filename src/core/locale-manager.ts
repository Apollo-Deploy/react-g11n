/**
 * LocaleManager - Manages locale state, detection, and persistence
 * 
 * Responsibilities:
 * - Maintain current locale state
 * - Detect browser language preferences
 * - Validate locale codes
 * - Persist locale to localStorage
 * - Notify subscribers of locale changes
 * - Provide locale metadata
 */

import { LocaleInfo, I18nConfig, InvalidLocaleError, TextDirection } from '../types';
import { detectBrowserLocale, isLocaleSupported, normalizeLocale } from '../utils/locale-detector';
import { getPersistedLocale, persistLocale } from '../utils/storage';

/**
 * Locale change listener function
 */
export type LocaleChangeListener = (locale: string) => void;

/**
 * Locale metadata database
 * Maps locale codes to their metadata (name, native name, direction)
 */
const LOCALE_METADATA: Record<string, Omit<LocaleInfo, 'code'>> = {
  en: {
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
  },
  fr: {
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
  },
  de: {
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
  },
  it: {
    name: 'Italian',
    nativeName: 'Italiano',
    direction: 'ltr',
  },
  pt: {
    name: 'Portuguese',
    nativeName: 'Português',
    direction: 'ltr',
  },
  ru: {
    name: 'Russian',
    nativeName: 'Русский',
    direction: 'ltr',
  },
  ja: {
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
  },
  zh: {
    name: 'Chinese',
    nativeName: '中文',
    direction: 'ltr',
  },
  ko: {
    name: 'Korean',
    nativeName: '한국어',
    direction: 'ltr',
  },
  ar: {
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
  },
  he: {
    name: 'Hebrew',
    nativeName: 'עברית',
    direction: 'rtl',
  },
  hi: {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr',
  },
  tr: {
    name: 'Turkish',
    nativeName: 'Türkçe',
    direction: 'ltr',
  },
  pl: {
    name: 'Polish',
    nativeName: 'Polski',
    direction: 'ltr',
  },
  nl: {
    name: 'Dutch',
    nativeName: 'Nederlands',
    direction: 'ltr',
  },
  sv: {
    name: 'Swedish',
    nativeName: 'Svenska',
    direction: 'ltr',
  },
  da: {
    name: 'Danish',
    nativeName: 'Dansk',
    direction: 'ltr',
  },
  fi: {
    name: 'Finnish',
    nativeName: 'Suomi',
    direction: 'ltr',
  },
  no: {
    name: 'Norwegian',
    nativeName: 'Norsk',
    direction: 'ltr',
  },
};

/**
 * LocaleManager class
 * Manages locale state, detection, validation, and persistence
 */
export class LocaleManager {
  private currentLocale: string;
  private readonly supportedLocales: string[];
  private readonly fallbackLocale: string;
  private readonly listeners: Set<LocaleChangeListener>;
  private readonly debug: boolean;

  /**
   * Create a new LocaleManager instance
   * @param config - i18n configuration
   * @param initialLocale - Optional initial locale to use
   */
  constructor(config: I18nConfig, initialLocale?: string) {
    this.supportedLocales = config.supportedLocales;
    this.fallbackLocale = config.fallbackLocale || config.defaultLocale;
    this.listeners = new Set();
    this.debug = config.debug || false;

    // Determine initial locale with priority:
    // 1. Explicitly provided initialLocale
    // 2. Persisted locale from localStorage
    // 3. Detected browser locale
    // 4. Default locale from config
    this.currentLocale = this.determineInitialLocale(initialLocale, config.defaultLocale);

    if (this.debug) {
      console.warn('[i18n] LocaleManager initialized with locale:', this.currentLocale);
    }
  }

  /**
   * Determine the initial locale based on priority
   * @param initialLocale - Explicitly provided initial locale
   * @param defaultLocale - Default locale from config
   * @returns The determined locale code
   */
  private determineInitialLocale(initialLocale: string | undefined, defaultLocale: string): string {
    // Priority 1: Explicitly provided initial locale
    if (initialLocale) {
      const normalized = normalizeLocale(initialLocale);
      if (this.isLocaleSupported(normalized)) {
        return normalized;
      }
      if (this.debug) {
        console.warn(`[i18n] Provided initial locale "${initialLocale}" is not supported. Falling back.`);
      }
    }

    // Priority 2: Persisted locale from localStorage
    const persistedLocale = getPersistedLocale();
    if (persistedLocale) {
      const normalized = normalizeLocale(persistedLocale);
      if (this.isLocaleSupported(normalized)) {
        if (this.debug) {
          console.warn('[i18n] Using persisted locale:', normalized);
        }
        return normalized;
      }
    }

    // Priority 3: Detected browser locale
    const detectedLocale = detectBrowserLocale(this.supportedLocales, defaultLocale);
    if (detectedLocale !== defaultLocale) {
      if (this.debug) {
        console.warn('[i18n] Using detected browser locale:', detectedLocale);
      }
      return detectedLocale;
    }

    // Priority 4: Default locale
    if (this.debug) {
      console.warn('[i18n] Using default locale:', defaultLocale);
    }
    return defaultLocale;
  }

  /**
   * Get the current locale code
   * @returns The current locale code
   */
  getCurrentLocale(): string {
    return this.currentLocale;
  }

  /**
   * Get information about all supported locales
   * @returns Array of locale information objects
   */
  getSupportedLocales(): LocaleInfo[] {
    return this.supportedLocales.map((code) => this.getLocaleInfo(code));
  }

  /**
   * Get information about a specific locale
   * @param locale - The locale code
   * @returns Locale information object
   */
  getLocaleInfo(locale: string): LocaleInfo {
    const normalized = normalizeLocale(locale);
    const metadata = LOCALE_METADATA[normalized];

    if (!metadata) {
      // Return default metadata for unknown locales
      return {
        code: normalized,
        name: normalized.toUpperCase(),
        nativeName: normalized.toUpperCase(),
        direction: 'ltr',
      };
    }

    return {
      code: normalized,
      ...metadata,
    };
  }

  /**
   * Set the current locale
   * @param locale - The locale code to set
   * @throws {InvalidLocaleError} If the locale is not supported
   */
  async setLocale(locale: string): Promise<void> {
    const normalized = normalizeLocale(locale);

    // Validate locale
    if (!this.isLocaleSupported(normalized)) {
      throw new InvalidLocaleError(normalized, this.supportedLocales);
    }

    // Check if locale is already current
    if (normalized === this.currentLocale) {
      if (this.debug) {
        console.warn('[i18n] Locale is already set to:', normalized);
      }
      return;
    }

    const previousLocale = this.currentLocale;
    this.currentLocale = normalized;

    // Persist locale to localStorage
    this.persistLocaleToStorage(normalized);

    if (this.debug) {
      console.warn(`[i18n] Locale changed from "${previousLocale}" to "${normalized}"`);
    }

    // Notify all listeners
    this.notifyListeners();
  }

  /**
   * Detect the browser's preferred locale
   * @returns The detected locale code
   */
  detectBrowserLocale(): string {
    return detectBrowserLocale(this.supportedLocales, this.fallbackLocale);
  }

  /**
   * Check if a locale is supported
   * @param locale - The locale code to check
   * @returns true if the locale is supported, false otherwise
   */
  isLocaleSupported(locale: string): boolean {
    return isLocaleSupported(locale, this.supportedLocales);
  }

  /**
   * Subscribe to locale changes
   * @param listener - Function to call when locale changes
   * @returns Unsubscribe function
   */
  subscribe(listener: LocaleChangeListener): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get the number of active listeners
   * @returns Number of active listeners
   */
  getListenerCount(): number {
    return this.listeners.size;
  }

  /**
   * Persist the locale to localStorage
   * @param locale - The locale code to persist
   */
  private persistLocaleToStorage(locale: string): void {
    const success = persistLocale(locale);
    if (!success && this.debug) {
      console.warn('[i18n] Failed to persist locale to localStorage');
    }
  }

  /**
   * Notify all listeners of locale change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentLocale);
      } catch (error) {
        console.error('[i18n] Error in locale change listener:', error);
      }
    });
  }

  /**
   * Get the text direction for the current locale
   * @returns The text direction ('ltr' or 'rtl')
   */
  getTextDirection(): TextDirection {
    return this.getLocaleInfo(this.currentLocale).direction;
  }

  /**
   * Get the text direction for a specific locale
   * @param locale - The locale code
   * @returns The text direction ('ltr' or 'rtl')
   */
  getTextDirectionForLocale(locale: string): TextDirection {
    return this.getLocaleInfo(locale).direction;
  }

  /**
   * Reset to default locale
   */
  async resetToDefault(): Promise<void> {
    await this.setLocale(this.fallbackLocale);
  }
}

