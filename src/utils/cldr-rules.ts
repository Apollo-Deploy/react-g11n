/**
 * CLDR pluralization rules for different locales
 * Implements Unicode CLDR plural rules for cardinal and ordinal forms
 * Reference: https://cldr.unicode.org/index/cldr-spec/plural-rules
 */

import type { PluralForm, PluralRuleFn } from '../types';

/**
 * English plural rules (en)
 * Cardinal: one (1), other (0, 2-999, ...)
 * Ordinal: one (1st, 21st, 31st, ...), two (2nd, 22nd, 32nd, ...), 
 *          few (3rd, 23rd, 33rd, ...), other (4th, 5th, ...)
 */
const englishPluralRules: PluralRuleFn = (count: number, ordinal: boolean): PluralForm => {
  if (ordinal) {
    const mod10 = count % 10;
    const mod100 = count % 100;
    
    if (mod10 === 1 && mod100 !== 11) {
      return 'one';
    }
    if (mod10 === 2 && mod100 !== 12) {
      return 'two';
    }
    if (mod10 === 3 && mod100 !== 13) {
      return 'few';
    }
    return 'other';
  }
  
  // Cardinal
  return count === 1 ? 'one' : 'other';
};

/**
 * Spanish plural rules (es)
 * Cardinal: one (1), other (0, 2-999, ...)
 * Ordinal: other (all)
 */
const spanishPluralRules: PluralRuleFn = (count: number, ordinal: boolean): PluralForm => {
  if (ordinal) {
    return 'other';
  }
  
  // Cardinal
  return count === 1 ? 'one' : 'other';
};

/**
 * French plural rules (fr)
 * Cardinal: one (0, 1), other (2-999, ...)
 * Ordinal: one (1st), other (2nd, 3rd, ...)
 */
const frenchPluralRules: PluralRuleFn = (count: number, ordinal: boolean): PluralForm => {
  if (ordinal) {
    return count === 1 ? 'one' : 'other';
  }
  
  // Cardinal: 0 and 1 are singular in French
  return count === 0 || count === 1 ? 'one' : 'other';
};

/**
 * Arabic plural rules (ar)
 * Cardinal: zero (0), one (1), two (2), few (3-10), many (11-99), other (100-999, ...)
 * Ordinal: other (all)
 */
const arabicPluralRules: PluralRuleFn = (count: number, ordinal: boolean): PluralForm => {
  if (ordinal) {
    return 'other';
  }
  
  // Cardinal
  if (count === 0) {
    return 'zero';
  }
  if (count === 1) {
    return 'one';
  }
  if (count === 2) {
    return 'two';
  }
  
  const mod100 = count % 100;
  if (mod100 >= 3 && mod100 <= 10) {
    return 'few';
  }
  if (mod100 >= 11 && mod100 <= 99) {
    return 'many';
  }
  
  return 'other';
};

/**
 * Map of locale codes to their plural rule functions
 */
const pluralRulesMap: Map<string, PluralRuleFn> = new Map([
  ['en', englishPluralRules],
  ['es', spanishPluralRules],
  ['fr', frenchPluralRules],
  ['ar', arabicPluralRules],
]);

/**
 * Get the plural rule function for a given locale
 * Falls back to English rules if locale is not found
 * @param locale - The locale code
 * @returns The plural rule function for the locale
 */
export function getPluralRule(locale: string): PluralRuleFn {
  const normalizedLocale = locale.toLowerCase().split(/[-_]/)[0] || 'en';
  return pluralRulesMap.get(normalizedLocale) || englishPluralRules;
}

/**
 * Get the plural form for a given count and locale
 * @param locale - The locale code
 * @param count - The count to determine plural form for
 * @param ordinal - Whether to use ordinal rules (default: false)
 * @returns The plural form (zero, one, two, few, many, other)
 */
export function getPluralForm(
  locale: string,
  count: number,
  ordinal: boolean = false
): PluralForm {
  const pluralRule = getPluralRule(locale);
  return pluralRule(count, ordinal);
}

/**
 * Check if a locale has a specific plural form
 * @param locale - The locale code
 * @param form - The plural form to check
 * @param ordinal - Whether to check ordinal rules (default: false)
 * @returns true if the locale uses the specified plural form
 */
export function hasPluralForm(
  locale: string,
  form: PluralForm,
  ordinal: boolean = false
): boolean {
  const pluralRule = getPluralRule(locale);
  
  // Test with various counts to see if the form is ever used
  const testCounts = [0, 1, 2, 3, 4, 5, 10, 11, 20, 21, 100, 101];
  
  for (const count of testCounts) {
    if (pluralRule(count, ordinal) === form) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get all possible plural forms for a locale
 * @param locale - The locale code
 * @param ordinal - Whether to get ordinal forms (default: false)
 * @returns Array of plural forms used by the locale
 */
export function getPluralForms(
  locale: string,
  ordinal: boolean = false
): PluralForm[] {
  const forms: Set<PluralForm> = new Set();
  const pluralRule = getPluralRule(locale);
  
  // Test with various counts to find all forms
  const testCounts = [0, 1, 2, 3, 4, 5, 10, 11, 20, 21, 22, 23, 100, 101, 102, 103];
  
  for (const count of testCounts) {
    forms.add(pluralRule(count, ordinal));
  }
  
  return Array.from(forms);
}
