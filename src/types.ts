/**
 * Core type definitions for the i18n/l10n system
 */

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Interpolation configuration options
 */
export interface InterpolationConfig {
  /** Prefix for interpolation variables. Default: '{{' */
  prefix?: string;
  /** Suffix for interpolation variables. Default: '}}' */
  suffix?: string;
  /** Whether to escape HTML in interpolated values. Default: true */
  escapeValue?: boolean;
}

/**
 * Pluralization configuration options
 */
export interface PluralizationConfig {
  /** Simplify plural suffix handling. Default: true */
  simplifyPluralSuffix?: boolean;
}

/**
 * Main i18n system configuration
 */
export interface I18nConfig {
  /** Default locale to use when no locale is specified */
  defaultLocale: string;
  /** List of supported locale codes */
  supportedLocales: string[];
  /** Fallback locale for missing translations */
  fallbackLocale?: string;
  /** List of translation namespaces */
  namespaces?: string[];
  /** Default namespace to use */
  defaultNamespace?: string;
  /** Path template for loading translation files */
  loadPath?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Interpolation configuration */
  interpolation?: InterpolationConfig;
  /** Pluralization configuration */
  pluralization?: PluralizationConfig;
}

// ============================================================================
// Translation Types
// ============================================================================

/**
 * Translation key type (will be extended with generated types)
 */
export type TranslationKey = string;

/**
 * Options for translation function
 * @template K - The translation key type (for type safety)
 */
export interface TranslationOptions<K extends TranslationKey = TranslationKey> {
  /** Count for pluralization */
  count?: number;
  /** Use ordinal pluralization (1st, 2nd, 3rd, etc.) */
  ordinal?: boolean;
  /** Context for contextual translations (gender, formality, etc.) */
  context?: string;
  /** Default value if translation is missing */
  defaultValue?: string;
  /** Namespace to use for this translation */
  ns?: string;
  /** Variables for interpolation */
  interpolation?: Record<string, any>;
  /** Internal: Type-safe key reference (not used at runtime) */
  _key?: K;
  /** Allow any additional properties for interpolation variables */
  [key: string]: any;
}

/**
 * Translation function signature
 */
export type TranslateFn = <K extends TranslationKey>(
  key: K,
  options?: TranslationOptions<K>
) => string;

/**
 * Translation namespace structure (nested object of translations)
 */
export interface TranslationNamespace {
  [key: string]: string | TranslationNamespace;
}

// ============================================================================
// Locale Types
// ============================================================================

/**
 * Text direction for locale
 */
export type TextDirection = 'ltr' | 'rtl';

/**
 * Locale information
 */
export interface LocaleInfo {
  /** Locale code (e.g., 'en', 'es', 'fr') */
  code: string;
  /** English name of the locale */
  name: string;
  /** Native name of the locale */
  nativeName: string;
  /** Text direction */
  direction: TextDirection;
}

// ============================================================================
// Pluralization Types
// ============================================================================

/**
 * CLDR plural forms
 */
export type PluralForm = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/**
 * Plural rule function that determines the plural form for a given count
 */
export type PluralRuleFn = (count: number, ordinal: boolean) => PluralForm;

/**
 * Plural translations object
 */
export interface PluralTranslations {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

// ============================================================================
// Formatting Types
// ============================================================================

/**
 * Date format options
 */
export type DateFormat = 'short' | 'medium' | 'long' | 'full' | Intl.DateTimeFormatOptions;

/**
 * Time format options
 */
export type TimeFormat = 'short' | 'medium' | 'long' | 'full' | Intl.DateTimeFormatOptions;

/**
 * DateTime format options
 */
export type DateTimeFormat = 'short' | 'medium' | 'long' | 'full' | Intl.DateTimeFormatOptions;

/**
 * List format type
 */
export type ListFormatType = 'conjunction' | 'disjunction' | 'unit';

/**
 * Unit type for formatting
 */
export type UnitType = 
  // Distance
  | 'meter' | 'kilometer' | 'centimeter' | 'millimeter'
  | 'mile' | 'yard' | 'foot' | 'inch'
  // Weight/Mass
  | 'kilogram' | 'gram' | 'milligram'
  | 'pound' | 'ounce'
  // Temperature
  | 'celsius' | 'fahrenheit' | 'kelvin'
  // Volume
  | 'liter' | 'milliliter'
  | 'gallon' | 'quart' | 'pint' | 'cup' | 'fluid-ounce';

/**
 * Unit system preference
 */
export type UnitSystem = 'metric' | 'imperial';

/**
 * Range format style
 */
export type RangeFormatStyle = 'short' | 'medium' | 'long' | 'full';

/**
 * Timezone information
 */
export interface TimezoneInfo {
  /** IANA timezone identifier (e.g., 'America/New_York') */
  id: string;
  /** Localized timezone name */
  name: string;
  /** Short timezone name (e.g., 'EST') */
  shortName: string;
  /** UTC offset in minutes */
  offset: number;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Base i18n error class
 */
export class I18nError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'I18nError';
    Object.setPrototypeOf(this, I18nError.prototype);
  }
}

/**
 * Error thrown when translation loading fails
 */
export class TranslationLoadError extends I18nError {
  constructor(
    public locale: string,
    public namespace: string,
    public cause?: Error
  ) {
    super(
      `Failed to load translation: ${locale}/${namespace}`,
      'TRANSLATION_LOAD_ERROR'
    );
    this.name = 'TranslationLoadError';
    Object.setPrototypeOf(this, TranslationLoadError.prototype);
  }
}

/**
 * Error thrown when an invalid locale is used
 */
export class InvalidLocaleError extends I18nError {
  constructor(
    public locale: string,
    public supportedLocales: string[]
  ) {
    super(
      `Invalid locale: ${locale}. Supported locales: ${supportedLocales.join(', ')}`,
      'INVALID_LOCALE'
    );
    this.name = 'InvalidLocaleError';
    Object.setPrototypeOf(this, InvalidLocaleError.prototype);
  }
}

/**
 * Error thrown when a translation key is missing
 */
export class MissingTranslationError extends I18nError {
  constructor(
    public key: string,
    public locale: string
  ) {
    super(
      `Missing translation for key: ${key} in locale: ${locale}`,
      'MISSING_TRANSLATION'
    );
    this.name = 'MissingTranslationError';
    Object.setPrototypeOf(this, MissingTranslationError.prototype);
  }
}

/**
 * Error thrown when interpolation fails
 */
export class InterpolationError extends I18nError {
  constructor(
    public key: string,
    public missingVariables: string[]
  ) {
    super(
      `Interpolation failed for key: ${key}. Missing variables: ${missingVariables.join(', ')}`,
      'INTERPOLATION_ERROR'
    );
    this.name = 'InterpolationError';
    Object.setPrototypeOf(this, InterpolationError.prototype);
  }
}

// ============================================================================
// Hook and Provider Types
// ============================================================================

/**
 * Result returned by useTranslation hook
 */
export interface UseTranslationResult {
  /** Translation function */
  t: TranslateFn;
  /** Current locale code */
  locale: string;
  /** List of available locales */
  locales: LocaleInfo[];
  /** Function to change the current locale */
  changeLocale: (locale: string) => Promise<void>;
  /** Whether translations are currently loading */
  isLoading: boolean;
  /** Whether the i18n system is ready to use */
  isReady: boolean;
  /** Format service for dates, numbers, currencies, etc. */
  format: FormatService;
  /** Collation service for locale-aware string sorting and comparison */
  collation: CollationService;
  /** Display names service for localized names */
  displayNames: DisplayNamesService;
  /** Segmentation service for text segmentation */
  segmentation: SegmentationService;
  /** Document service for document-level language attributes */
  document: DocumentService;
}

/**
 * Format service interface
 */
export interface FormatService {
  /** Format a date according to the current locale */
  date(date: Date, format?: DateFormat): string;
  /** Format a time according to the current locale */
  time(date: Date, format?: TimeFormat): string;
  /** Format a date and time according to the current locale */
  dateTime(date: Date, format?: DateTimeFormat): string;
  /** Format relative time (e.g., "2 hours ago") */
  relativeTime(date: Date, baseDate?: Date): string;
  /** Format a number according to the current locale */
  number(value: number, options?: Intl.NumberFormatOptions): string;
  /** Format a currency value according to the current locale */
  currency(value: number, currency: string, options?: Intl.NumberFormatOptions): string;
  /** Format a list according to the current locale */
  list(items: string[], type?: ListFormatType): string;
  /** Format a unit value according to the current locale */
  unit(value: number, unit: UnitType, options?: Intl.NumberFormatOptions): string;
  /** Format a percentage according to the current locale */
  percentage(value: number, options?: { decimals?: number; signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero' }): string;
  /** Format a date range according to the current locale */
  dateRange(startDate: Date, endDate: Date, format?: RangeFormatStyle): string;
  /** Format a time range according to the current locale */
  timeRange(startDate: Date, endDate: Date, format?: RangeFormatStyle): string;
  /** Format a date with timezone information */
  dateTimeWithTimezone(date: Date, timezone: string, format?: DateTimeFormat): string;
  /** Get timezone name */
  timezoneName(timezone: string, style?: 'short' | 'long'): string;
  /** Detect user's timezone */
  detectTimezone(): string;
  /** Get list of common timezones with localized names */
  getCommonTimezones(): TimezoneInfo[];
}

/**
 * Collation service interface for locale-aware string sorting and comparison
 */
export interface CollationService {
  /** Sort an array of strings according to locale-specific collation rules */
  sort(items: string[], options?: Intl.CollatorOptions): string[];
  /** Compare two strings according to locale-specific collation rules */
  compare(a: string, b: string, options?: Intl.CollatorOptions): number;
  /** Sort an array of objects by a string property */
  sortBy<T>(items: T[], key: (item: T) => string, options?: Intl.CollatorOptions): T[];
}

/**
 * Display names service interface for localized names
 */
export interface DisplayNamesService {
  /** Get the localized name of a language */
  language(code: string): string;
  /** Get the localized name of a region/country */
  region(code: string): string;
  /** Get the localized name of a currency */
  currency(code: string): string;
  /** Get the localized name of a script */
  script(code: string): string;
  /** Get the localized name of a calendar */
  calendar(code: string): string;
  /** Get the localized name of a date/time field */
  dateTimeField(field: Intl.DateTimeFormatPartTypes): string;
}

/**
 * Segmentation service interface for text segmentation
 */
export interface SegmentationService {
  /** Segment text into words according to locale rules */
  words(text: string): string[];
  /** Segment text into sentences according to locale rules */
  sentences(text: string): string[];
  /** Segment text into grapheme clusters */
  graphemes(text: string): string[];
  /** Count words in text according to locale rules */
  wordCount(text: string): number;
  /** Truncate text to a maximum number of words */
  truncateWords(text: string, maxWords: number, ellipsis?: string): string;
  /** Truncate text to a maximum number of graphemes */
  truncateGraphemes(text: string, maxGraphemes: number, ellipsis?: string): string;
  /** Get the length of text in grapheme clusters */
  graphemeLength(text: string): number;
}

/**
 * Document service interface for document-level language attributes
 */
export interface DocumentService {
  /** Update the document's language attribute */
  updateDocumentLanguage(locale: string): void;
  /** Update the document's text direction attribute */
  updateDocumentDirection(direction: 'ltr' | 'rtl'): void;
  /** Get the current document language attribute */
  getDocumentLanguage(): string | null;
  /** Get the current document text direction attribute */
  getDocumentDirection(): string | null;
  /** Update both language and direction attributes */
  updateDocumentLocale(locale: string): void;
}

/**
 * I18n context value
 */
export interface I18nContextValue extends UseTranslationResult {
  /** Internal config (for advanced usage) */
  config: I18nConfig;
}
