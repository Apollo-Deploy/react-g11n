/**
 * Storage utility for persisting and retrieving locale preferences
 * Handles localStorage operations with error handling for quota and availability
 */

const LOCALE_STORAGE_KEY = 'i18n_locale';

/**
 * Check if localStorage is available
 */
function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Persist locale preference to localStorage
 * @param locale - The locale code to persist
 * @returns true if successful, false otherwise
 */
export function persistLocale(locale: string): boolean {
  if (!isStorageAvailable()) {
    console.warn('[i18n] localStorage is not available. Locale preference will not be persisted.');
    return false;
  }

  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('[i18n] localStorage quota exceeded. Unable to persist locale preference.');
    } else {
      console.error('[i18n] Failed to persist locale preference:', error);
    }
    return false;
  }
}

/**
 * Retrieve persisted locale preference from localStorage
 * @returns The persisted locale code, or null if not found or unavailable
 */
export function getPersistedLocale(): string | null {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    return localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch (error) {
    console.error('[i18n] Failed to retrieve persisted locale:', error);
    return null;
  }
}

/**
 * Remove persisted locale preference from localStorage
 * @returns true if successful, false otherwise
 */
export function clearPersistedLocale(): boolean {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(LOCALE_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('[i18n] Failed to clear persisted locale:', error);
    return false;
  }
}
