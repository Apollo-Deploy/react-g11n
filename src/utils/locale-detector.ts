/**
 * Locale detector utility for detecting browser language preferences
 * Handles locale detection, normalization, and fallback logic
 */

/**
 * Normalize locale code to base language code
 * Examples: "en-US" -> "en", "es-MX" -> "es", "fr-CA" -> "fr"
 * @param locale - The locale code to normalize
 * @returns The normalized locale code
 */
export function normalizeLocale(locale: string): string {
  if (!locale) {
    return '';
  }

  // Convert to lowercase and extract base language code
  const normalized = locale.toLowerCase().split(/[-_]/)[0] || '';
  return normalized;
}

/**
 * Get browser language preferences
 * @returns Array of locale codes from browser preferences
 */
export function getBrowserLocales(): string[] {
  const locales: string[] = [];

  // Check navigator.languages (modern browsers)
  if (typeof navigator !== 'undefined' && navigator.languages) {
    locales.push(...navigator.languages);
  }
  // Fallback to navigator.language
  else if (typeof navigator !== 'undefined' && navigator.language) {
    locales.push(navigator.language);
  }

  return locales;
}

/**
 * Detect the best matching locale from browser preferences
 * @param supportedLocales - Array of supported locale codes
 * @param fallbackLocale - Fallback locale if no match is found
 * @returns The detected locale code
 */
export function detectBrowserLocale(
  supportedLocales: string[],
  fallbackLocale: string
): string {
  const browserLocales = getBrowserLocales();

  // Try exact match first
  for (const browserLocale of browserLocales) {
    const normalized = normalizeLocale(browserLocale);
    if (supportedLocales.includes(normalized)) {
      return normalized;
    }
  }

  // Try matching with full locale codes (e.g., "en-US" matches "en")
  for (const browserLocale of browserLocales) {
    const parts = browserLocale.toLowerCase().split(/[-_]/);
    for (const part of parts) {
      if (supportedLocales.includes(part)) {
        return part;
      }
    }
  }

  // No match found, return fallback
  return fallbackLocale;
}

/**
 * Validate if a locale is supported
 * @param locale - The locale code to validate
 * @param supportedLocales - Array of supported locale codes
 * @returns true if the locale is supported, false otherwise
 */
export function isLocaleSupported(
  locale: string,
  supportedLocales: string[]
): boolean {
  const normalized = normalizeLocale(locale);
  return supportedLocales.includes(normalized);
}

/**
 * Find the best matching locale from a list of candidates
 * @param candidates - Array of candidate locale codes
 * @param supportedLocales - Array of supported locale codes
 * @param fallbackLocale - Fallback locale if no match is found
 * @returns The best matching locale code
 */
export function findBestMatchingLocale(
  candidates: string[],
  supportedLocales: string[],
  fallbackLocale: string
): string {
  // Try exact match first
  for (const candidate of candidates) {
    const normalized = normalizeLocale(candidate);
    if (supportedLocales.includes(normalized)) {
      return normalized;
    }
  }

  // Try partial match
  for (const candidate of candidates) {
    const parts = candidate.toLowerCase().split(/[-_]/);
    for (const part of parts) {
      if (supportedLocales.includes(part)) {
        return part;
      }
    }
  }

  // No match found, return fallback
  return fallbackLocale;
}
