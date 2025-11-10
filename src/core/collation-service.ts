/**
 * CollationService
 * 
 * Provides locale-aware string sorting and comparison using the Intl.Collator API.
 * Supports case-sensitive/insensitive sorting, numeric sorting, and custom collation options.
 */

export interface CollationOptions extends Intl.CollatorOptions {
  // Extends Intl.CollatorOptions with any custom options if needed
}

export class CollationService {
  private locale: string;
  private collatorCache: Map<string, Intl.Collator>;

  constructor(locale: string) {
    this.locale = locale;
    this.collatorCache = new Map();
  }

  /**
   * Sort an array of strings according to locale-specific collation rules
   * 
   * @param items - Array of strings to sort
   * @param options - Collation options (sensitivity, numeric, etc.)
   * @returns Sorted array of strings
   */
  sort(items: string[], options?: CollationOptions): string[] {
    const collator = this.getCollator(options);
    return [...items].sort((a, b) => collator.compare(a, b));
  }

  /**
   * Compare two strings according to locale-specific collation rules
   * 
   * @param a - First string
   * @param b - Second string
   * @param options - Collation options
   * @returns Negative if a < b, positive if a > b, 0 if equal
   */
  compare(a: string, b: string, options?: CollationOptions): number {
    const collator = this.getCollator(options);
    return collator.compare(a, b);
  }

  /**
   * Sort an array of objects by a string property
   * 
   * @param items - Array of objects to sort
   * @param key - Function to extract the string value to sort by
   * @param options - Collation options
   * @returns Sorted array of objects
   */
  sortBy<T>(
    items: T[],
    key: (item: T) => string,
    options?: CollationOptions
  ): T[] {
    const collator = this.getCollator(options);
    return [...items].sort((a, b) => {
      const aValue = key(a);
      const bValue = key(b);
      return collator.compare(aValue, bValue);
    });
  }

  /**
   * Update the locale for this service
   * 
   * @param locale - New locale code
   */
  setLocale(locale: string): void {
    this.locale = locale;
    this.collatorCache.clear();
  }

  /**
   * Get or create a cached Intl.Collator instance
   * 
   * @param options - Collation options
   * @returns Intl.Collator instance
   */
  private getCollator(options?: CollationOptions): Intl.Collator {
    const cacheKey = this.getCacheKey(options);
    
    let collator = this.collatorCache.get(cacheKey);
    if (!collator) {
      collator = new Intl.Collator(this.locale, options);
      this.collatorCache.set(cacheKey, collator);
    }
    
    return collator;
  }

  /**
   * Generate a cache key from collation options
   * 
   * @param options - Collation options
   * @returns Cache key string
   */
  private getCacheKey(options?: CollationOptions): string {
    if (!options) {
      return 'default';
    }
    
    const parts: string[] = [];
    
    if (options.sensitivity) parts.push(`s:${options.sensitivity}`);
    if (options.numeric !== undefined) parts.push(`n:${options.numeric}`);
    if (options.caseFirst) parts.push(`c:${options.caseFirst}`);
    if (options.ignorePunctuation !== undefined) parts.push(`p:${options.ignorePunctuation}`);
    if (options.usage) parts.push(`u:${options.usage}`);
    
    return parts.length > 0 ? parts.join('|') : 'default';
  }
}
