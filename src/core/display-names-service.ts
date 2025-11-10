/**
 * DisplayNamesService
 * 
 * Provides localized names for languages, regions, currencies, scripts, and calendars
 * using the native Intl.DisplayNames API.
 * 
 * @example
 * const service = new DisplayNamesService('en');
 * service.language('es'); // "Spanish"
 * service.region('US'); // "United States"
 * service.currency('USD'); // "US Dollar"
 */
export class DisplayNamesService {
  private locale: string;
  private displayNamesCache: Map<string, Intl.DisplayNames>;

  constructor(locale: string) {
    this.locale = locale;
    this.displayNamesCache = new Map();
  }

  /**
   * Get the localized name of a language
   * @param code - ISO 639 language code (e.g., 'en', 'es', 'fr')
   * @returns Localized language name
   * 
   * @example
   * service.language('es'); // "Spanish" (in English)
   * service.language('fr'); // "French" (in English)
   */
  language(code: string): string {
    try {
      const displayNames = this.getDisplayNames('language');
      return displayNames.of(code) || code;
    } catch {
      return code;
    }
  }

  /**
   * Get the localized name of a region/country
   * @param code - ISO 3166 region code (e.g., 'US', 'GB', 'FR')
   * @returns Localized region name
   * 
   * @example
   * service.region('US'); // "United States" (in English)
   * service.region('GB'); // "United Kingdom" (in English)
   */
  region(code: string): string {
    try {
      const displayNames = this.getDisplayNames('region');
      return displayNames.of(code) || code;
    } catch {
      return code;
    }
  }

  /**
   * Get the localized name of a currency
   * @param code - ISO 4217 currency code (e.g., 'USD', 'EUR', 'GBP')
   * @returns Localized currency name
   * 
   * @example
   * service.currency('USD'); // "US Dollar" (in English)
   * service.currency('EUR'); // "Euro" (in English)
   */
  currency(code: string): string {
    try {
      const displayNames = this.getDisplayNames('currency');
      return displayNames.of(code) || code;
    } catch {
      return code;
    }
  }

  /**
   * Get the localized name of a script
   * @param code - ISO 15924 script code (e.g., 'Latn', 'Cyrl', 'Arab')
   * @returns Localized script name
   * 
   * @example
   * service.script('Latn'); // "Latin" (in English)
   * service.script('Cyrl'); // "Cyrillic" (in English)
   */
  script(code: string): string {
    try {
      const displayNames = this.getDisplayNames('script');
      return displayNames.of(code) || code;
    } catch {
      return code;
    }
  }

  /**
   * Get the localized name of a calendar
   * @param code - Calendar type (e.g., 'gregory', 'hebrew', 'islamic')
   * @returns Localized calendar name
   * 
   * @example
   * service.calendar('gregory'); // "Gregorian Calendar" (in English)
   * service.calendar('islamic'); // "Islamic Calendar" (in English)
   */
  calendar(code: string): string {
    try {
      const displayNames = this.getDisplayNames('calendar');
      return displayNames.of(code) || code;
    } catch {
      return code;
    }
  }

  /**
   * Get the localized name of a date/time field
   * @param field - Date/time field type (e.g., 'year', 'month', 'day')
   * @returns Localized field name
   * 
   * @example
   * service.dateTimeField('year'); // "year" (in English)
   * service.dateTimeField('month'); // "month" (in English)
   */
  dateTimeField(field: Intl.DateTimeFormatPartTypes): string {
    try {
      const displayNames = this.getDisplayNames('dateTimeField');
      return displayNames.of(field) || field;
    } catch {
      return field;
    }
  }

  /**
   * Update the locale for this service
   * @param locale - New locale code
   */
  setLocale(locale: string): void {
    if (this.locale !== locale) {
      this.locale = locale;
      this.displayNamesCache.clear();
    }
  }

  /**
   * Get the current locale
   * @returns Current locale code
   */
  getLocale(): string {
    return this.locale;
  }

  /**
   * Get or create an Intl.DisplayNames instance for the specified type
   * @param type - Type of display names to retrieve
   * @returns Intl.DisplayNames instance
   * @private
   */
  private getDisplayNames(type: Intl.DisplayNamesType): Intl.DisplayNames {
    const cacheKey = `${this.locale}-${type}`;
    
    if (!this.displayNamesCache.has(cacheKey)) {
      const displayNames = new Intl.DisplayNames(this.locale, { type });
      this.displayNamesCache.set(cacheKey, displayNames);
    }

    return this.displayNamesCache.get(cacheKey)!;
  }
}
