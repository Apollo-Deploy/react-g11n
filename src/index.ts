/**
 * React G11n - A modern, type-safe globalization library for React
 * 
 * @packageDocumentation
 * 
 * React G11n provides comprehensive internationalization (i18n) and localization (l10n)
 * capabilities for React applications, with both React and standalone APIs.
 * 
 * ## Features
 * 
 * - **Type-safe translations** with TypeScript support
 * - **React hooks and provider** for seamless integration
 * - **Standalone API** for non-React contexts (utilities, services, middleware)
 * - **Pluralization** with CLDR plural rules
 * - **Interpolation** with variable substitution
 * - **Formatting** for dates, numbers, currencies, lists, and units
 * - **Collation** for locale-aware string sorting
 * - **Display names** for localized language, region, and currency names
 * - **Text segmentation** for words, sentences, and graphemes
 * - **Document management** for lang and dir attributes
 * - **Zero dependencies** (except React peer dependencies)
 * - **Tree-shakeable** modular exports
 * 
 * ## Quick Start
 * 
 * ### React Usage
 * 
 * ```tsx
 * import { I18nProvider, useTranslation } from 'react-g11n';
 * 
 * // Wrap your app with I18nProvider
 * function App() {
 *   return (
 *     <I18nProvider config={{
 *       defaultLocale: 'en',
 *       supportedLocales: ['en', 'es', 'fr'],
 *       loadPath: '/locales/{{locale}}/{{namespace}}.json',
 *     }}>
 *       <MyComponent />
 *     </I18nProvider>
 *   );
 * }
 * 
 * // Use translations in components
 * function MyComponent() {
 *   const { t, locale, changeLocale, format } = useTranslation();
 *   
 *   return (
 *     <div>
 *       <h1>{t('common.greeting', { name: 'World' })}</h1>
 *       <p>{format.date(new Date(), 'long')}</p>
 *       <button onClick={() => changeLocale('es')}>Español</button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * ### Standalone Usage
 * 
 * ```typescript
 * import { i18n } from 'react-g11n/standalone';
 * 
 * // Initialize once
 * await i18n.init({
 *   defaultLocale: 'en',
 *   supportedLocales: ['en', 'es', 'fr'],
 * });
 * 
 * // Use anywhere in your code
 * const greeting = i18n.t('common.greeting', { name: 'John' });
 * const formattedDate = i18n.format.date(new Date());
 * 
 * // Change locale
 * await i18n.changeLocale('es');
 * ```
 * 
 * @module react-g11n
 */

// ============================================================================
// React API - Components, Hooks, and Context
// ============================================================================

/**
 * I18nProvider component - Wraps your application to provide i18n functionality
 * 
 * This is the main provider component that initializes the i18n system and makes
 * translation functionality available to all child components via React context.
 * 
 * @example
 * ```tsx
 * import { I18nProvider } from 'react-g11n';
 * 
 * function App() {
 *   return (
 *     <I18nProvider
 *       config={{
 *         defaultLocale: 'en',
 *         supportedLocales: ['en', 'es', 'fr'],
 *         namespaces: ['common', 'auth'],
 *         loadPath: '/locales/{{locale}}/{{namespace}}.json',
 *       }}
 *       onLocaleChange={(locale) => console.log('Locale changed to:', locale)}
 *     >
 *       <YourApp />
 *     </I18nProvider>
 *   );
 * }
 * ```
 * 
 * @see {@link I18nProviderProps} for configuration options
 */
export { I18nProvider } from './react/provider';

/**
 * Props for the I18nProvider component
 * 
 * @property config - i18n configuration object
 * @property children - React children to render
 * @property initialLocale - Optional initial locale (overrides auto-detection)
 * @property onLocaleChange - Callback when locale changes
 * @property onError - Error handler callback
 */
export type { I18nProviderProps } from './react/provider';

/**
 * useTranslation hook - Primary hook for accessing i18n functionality in components
 * 
 * This hook provides access to the translation function, locale state, formatting
 * services, and other i18n utilities. Must be used within an I18nProvider.
 * 
 * @returns Translation utilities and state
 * @throws Error if used outside I18nProvider
 * 
 * @example
 * ```tsx
 * import { useTranslation } from 'react-g11n';
 * 
 * function MyComponent() {
 *   const { t, locale, changeLocale, format, isReady } = useTranslation();
 *   
 *   if (!isReady) {
 *     return <div>Loading translations...</div>;
 *   }
 *   
 *   return (
 *     <div>
 *       <h1>{t('common.greeting', { name: 'World' })}</h1>
 *       <p>Current locale: {locale}</p>
 *       <p>{format.date(new Date(), 'long')}</p>
 *       <p>{format.currency(99.99, 'USD')}</p>
 *       <button onClick={() => changeLocale('es')}>
 *         Switch to Spanish
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @see {@link UseTranslationResult} for return type details
 */
export { useTranslation } from './react/use-translation';

/**
 * I18nContext - React context for i18n (advanced usage)
 * 
 * Direct access to the i18n context. Most applications should use the
 * useTranslation hook instead. This is provided for advanced use cases
 * where you need direct context access.
 * 
 * @example
 * ```tsx
 * import { I18nContext } from 'react-g11n';
 * import { useContext } from 'react';
 * 
 * function MyComponent() {
 *   const i18nContext = useContext(I18nContext);
 *   
 *   if (!i18nContext) {
 *     throw new Error('Must be used within I18nProvider');
 *   }
 *   
 *   return <div>{i18nContext.t('common.greeting')}</div>;
 * }
 * ```
 * 
 * @see {@link I18nContextValue} for context value type
 */
export { I18nContext } from './react/context';

// ============================================================================
// Standalone API - Non-React Usage
// ============================================================================

/**
 * i18n - Standalone i18n instance for non-React usage
 * 
 * This singleton instance can be used outside of React components, such as
 * in utility functions, services, middleware, or other non-React code.
 * 
 * The standalone API automatically synchronizes with the React context when
 * both are used in the same application.
 * 
 * @example
 * ```typescript
 * import { i18n } from 'react-g11n/standalone';
 * 
 * // Initialize once at app startup
 * await i18n.init({
 *   defaultLocale: 'en',
 *   supportedLocales: ['en', 'es', 'fr'],
 *   loadPath: '/locales/{{locale}}/{{namespace}}.json',
 * });
 * 
 * // Use in utility functions
 * export function formatUserGreeting(name: string): string {
 *   return i18n.t('common.greeting', { name });
 * }
 * 
 * // Use in services
 * export class NotificationService {
 *   sendNotification(messageKey: string) {
 *     const message = i18n.t(messageKey);
 *     // Send notification...
 *   }
 * }
 * 
 * // Subscribe to locale changes
 * const unsubscribe = i18n.subscribe((newLocale) => {
 *   console.log('Locale changed to:', newLocale);
 * });
 * ```
 * 
 * @see {@link StandaloneI18n} for API details
 */
export { i18n } from './standalone';

/**
 * StandaloneI18n interface - Type definition for the standalone i18n instance
 * 
 * Describes the API surface of the standalone i18n singleton.
 */
export type { StandaloneI18n, StandaloneLocaleChangeListener } from './standalone';

// ============================================================================
// Service Classes - Can be instantiated directly for advanced usage
// ============================================================================

/**
 * FormatService - Locale-aware formatting for dates, numbers, currencies, and more
 * 
 * Provides comprehensive formatting capabilities using the Intl API.
 * Typically accessed via useTranslation().format or i18n.format, but can
 * be instantiated directly for advanced use cases.
 * 
 * @example
 * ```typescript
 * import { FormatService } from 'react-g11n';
 * 
 * const formatter = new FormatService('en-US');
 * 
 * formatter.date(new Date(), 'long');           // "January 1, 2024"
 * formatter.number(1234.56);                    // "1,234.56"
 * formatter.currency(99.99, 'USD');             // "$99.99"
 * formatter.percentage(0.75);                   // "75%"
 * formatter.list(['apples', 'oranges']);        // "apples and oranges"
 * formatter.relativeTime(new Date());           // "just now"
 * ```
 */
export { FormatService } from './core/format-service';

/**
 * CollationService - Locale-aware string sorting and comparison
 * 
 * Provides locale-specific string collation (sorting) using the Intl.Collator API.
 * Handles language-specific sorting rules, case sensitivity, and accent handling.
 * 
 * @example
 * ```typescript
 * import { CollationService } from 'react-g11n';
 * 
 * const collator = new CollationService('de-DE');
 * 
 * const names = ['Müller', 'Mueller', 'Möller'];
 * const sorted = collator.sort(names);
 * 
 * const users = [{ name: 'Zoë' }, { name: 'Zoe' }];
 * const sortedUsers = collator.sortBy(users, (u) => u.name);
 * ```
 */
export { CollationService } from './core/collation-service';

/**
 * DisplayNamesService - Localized names for languages, regions, currencies, etc.
 * 
 * Provides localized display names using the Intl.DisplayNames API.
 * Useful for displaying language selectors, country lists, and currency names.
 * 
 * @example
 * ```typescript
 * import { DisplayNamesService } from 'react-g11n';
 * 
 * const displayNames = new DisplayNamesService('es');
 * 
 * displayNames.language('en');      // "inglés"
 * displayNames.region('US');        // "Estados Unidos"
 * displayNames.currency('USD');     // "dólar estadounidense"
 * ```
 */
export { DisplayNamesService } from './core/display-names-service';

/**
 * SegmentationService - Text segmentation for words, sentences, and graphemes
 * 
 * Provides locale-aware text segmentation using the Intl.Segmenter API.
 * Useful for word counting, text truncation, and text analysis.
 * 
 * @example
 * ```typescript
 * import { SegmentationService } from 'react-g11n';
 * 
 * const segmenter = new SegmentationService('en');
 * 
 * const words = segmenter.words('Hello, world!');        // ['Hello', 'world']
 * const count = segmenter.wordCount('Hello, world!');    // 2
 * const truncated = segmenter.truncateWords(text, 10);   // First 10 words
 * ```
 */
export { SegmentationService } from './core/segmentation-service';

/**
 * DocumentService - Manage document-level language attributes
 * 
 * Manages the document's lang and dir attributes for proper accessibility
 * and text rendering. Automatically updates when locale changes.
 * 
 * @example
 * ```typescript
 * import { DocumentService } from 'react-g11n';
 * 
 * const docService = new DocumentService();
 * 
 * docService.updateDocumentLocale('ar');  // Sets lang="ar" and dir="rtl"
 * docService.getDocumentLanguage();       // "ar"
 * docService.getDocumentDirection();      // "rtl"
 * ```
 */
export { DocumentService } from './core/document-service';

/**
 * LocaleManager - Manages locale state and detection
 * 
 * Handles locale detection, validation, persistence, and change notifications.
 * Typically used internally, but can be instantiated for advanced use cases.
 * 
 * @example
 * ```typescript
 * import { LocaleManager } from 'react-g11n';
 * 
 * const localeManager = new LocaleManager({
 *   defaultLocale: 'en',
 *   supportedLocales: ['en', 'es', 'fr'],
 * });
 * 
 * const current = localeManager.getCurrentLocale();
 * const locales = localeManager.getSupportedLocales();
 * 
 * localeManager.subscribe((newLocale) => {
 *   console.log('Locale changed to:', newLocale);
 * });
 * ```
 */
export { LocaleManager } from './core/locale-manager';

/**
 * TranslationStore - Manages translation caching and loading
 * 
 * Handles in-memory caching of translations and coordinates with the
 * TranslationLoader for dynamic loading. Typically used internally.
 */
export { TranslationStore } from './core/translation-store';

/**
 * TranslationLoader - Loads translation files
 * 
 * Handles fetching translation files from the server or other sources.
 * Typically used internally by TranslationStore.
 */
export { TranslationLoader } from './core/translation-loader';

/**
 * Translator - Core translation resolution engine
 * 
 * Handles translation key resolution, interpolation, and pluralization.
 * Typically used internally by the provider and standalone API.
 */
export { Translator } from './core/translator';

/**
 * Interpolator - Variable interpolation in translations
 * 
 * Handles variable substitution in translation strings.
 * Typically used internally by Translator.
 */
export { Interpolator } from './core/interpolator';

/**
 * Pluralizer - CLDR-based pluralization
 * 
 * Implements CLDR plural rules for all locales.
 * Typically used internally by Translator.
 */
export { Pluralizer } from './core/pluralizer';

// ============================================================================
// Type Exports - Configuration, Translation, Locale, and Service Types
// ============================================================================

/**
 * I18nConfig - Main configuration interface for the i18n system
 * 
 * Defines all configuration options for initializing the i18n system.
 * 
 * @property defaultLocale - Default locale to use
 * @property supportedLocales - Array of supported locale codes
 * @property fallbackLocale - Fallback locale for missing translations
 * @property namespaces - Array of translation namespaces
 * @property defaultNamespace - Default namespace to use
 * @property loadPath - Path template for loading translation files
 * @property debug - Enable debug logging
 * @property interpolation - Interpolation configuration
 * @property pluralization - Pluralization configuration
 */
export type { I18nConfig } from './types';

/**
 * InterpolationConfig - Configuration for variable interpolation
 * 
 * @property prefix - Prefix for interpolation variables (default: '{{')
 * @property suffix - Suffix for interpolation variables (default: '}}')
 * @property escapeValue - Whether to escape HTML in values (default: true)
 */
export type { InterpolationConfig } from './types';

/**
 * PluralizationConfig - Configuration for pluralization
 * 
 * @property simplifyPluralSuffix - Simplify plural suffix handling (default: true)
 */
export type { PluralizationConfig } from './types';

/**
 * TranslationKey - Type for translation keys
 * 
 * Can be extended with generated types from translation files for
 * full type safety.
 */
export type { TranslationKey } from './types';

/**
 * TranslationOptions - Options for the translation function
 * 
 * @property count - Count for pluralization
 * @property ordinal - Use ordinal pluralization (1st, 2nd, 3rd)
 * @property context - Context for contextual translations
 * @property defaultValue - Default value if translation is missing
 * @property ns - Namespace to use for this translation
 * @property interpolation - Variables for interpolation
 */
export type { TranslationOptions } from './types';

/**
 * TranslateFn - Type signature for the translation function
 * 
 * The main translation function type used throughout the library.
 */
export type { TranslateFn } from './types';

/**
 * TranslationNamespace - Structure of a translation namespace
 * 
 * Represents the nested object structure of translation files.
 */
export type { TranslationNamespace } from './types';

/**
 * LocaleInfo - Information about a locale
 * 
 * @property code - Locale code (e.g., 'en', 'es')
 * @property name - English name of the locale
 * @property nativeName - Native name of the locale
 * @property direction - Text direction ('ltr' or 'rtl')
 */
export type { LocaleInfo } from './types';

/**
 * TextDirection - Text direction for a locale
 * 
 * Either 'ltr' (left-to-right) or 'rtl' (right-to-left).
 */
export type { TextDirection } from './types';

/**
 * PluralForm - CLDR plural forms
 * 
 * One of: 'zero', 'one', 'two', 'few', 'many', 'other'
 */
export type { PluralForm } from './types';

/**
 * PluralRuleFn - Function that determines plural form for a count
 */
export type { PluralRuleFn } from './types';

/**
 * PluralTranslations - Object containing plural translations
 * 
 * @property zero - Translation for zero items (optional)
 * @property one - Translation for one item (optional)
 * @property two - Translation for two items (optional)
 * @property few - Translation for few items (optional)
 * @property many - Translation for many items (optional)
 * @property other - Translation for other counts (required)
 */
export type { PluralTranslations } from './types';

/**
 * DateFormat - Date formatting options
 * 
 * Can be a preset ('short', 'medium', 'long', 'full') or Intl.DateTimeFormatOptions
 */
export type { DateFormat } from './types';

/**
 * TimeFormat - Time formatting options
 * 
 * Can be a preset ('short', 'medium', 'long', 'full') or Intl.DateTimeFormatOptions
 */
export type { TimeFormat } from './types';

/**
 * DateTimeFormat - DateTime formatting options
 * 
 * Can be a preset ('short', 'medium', 'long', 'full') or Intl.DateTimeFormatOptions
 */
export type { DateTimeFormat } from './types';

/**
 * ListFormatType - Type of list formatting
 * 
 * - 'conjunction': "A, B, and C"
 * - 'disjunction': "A, B, or C"
 * - 'unit': "A, B, C"
 */
export type { ListFormatType } from './types';

/**
 * UnitType - Unit types for formatting
 * 
 * Includes distance, weight, temperature, and volume units.
 */
export type { UnitType } from './types';

/**
 * UnitSystem - Unit system preference
 * 
 * Either 'metric' or 'imperial'.
 */
export type { UnitSystem } from './types';

/**
 * RangeFormatStyle - Style for range formatting
 * 
 * One of: 'short', 'medium', 'long', 'full'
 */
export type { RangeFormatStyle } from './types';

/**
 * TimezoneInfo - Information about a timezone
 * 
 * @property id - IANA timezone identifier
 * @property name - Localized timezone name
 * @property shortName - Short timezone name
 * @property offset - UTC offset in minutes
 */
export type { TimezoneInfo } from './types';

/**
 * UseTranslationResult - Return type of useTranslation hook
 * 
 * Contains all translation utilities and state returned by the hook.
 */
export type { UseTranslationResult } from './types';

/**
 * I18nContextValue - Value provided by I18nContext
 * 
 * Extends UseTranslationResult with additional internal properties.
 */
export type { I18nContextValue } from './types';

/**
 * FormatService interface - Type definition for format service
 */
export type { FormatService as IFormatService } from './types';

/**
 * CollationService interface - Type definition for collation service
 */
export type { CollationService as ICollationService } from './types';

/**
 * DisplayNamesService interface - Type definition for display names service
 */
export type { DisplayNamesService as IDisplayNamesService } from './types';

/**
 * SegmentationService interface - Type definition for segmentation service
 */
export type { SegmentationService as ISegmentationService } from './types';

/**
 * DocumentService interface - Type definition for document service
 */
export type { DocumentService as IDocumentService } from './types';

// ============================================================================
// Error Classes - Custom error types for i18n operations
// ============================================================================

/**
 * I18nError - Base error class for all i18n errors
 * 
 * All i18n-specific errors extend this base class.
 * 
 * @example
 * ```typescript
 * import { I18nError } from 'react-g11n';
 * 
 * try {
 *   // i18n operation
 * } catch (error) {
 *   if (error instanceof I18nError) {
 *     console.error('i18n error:', error.code, error.message);
 *   }
 * }
 * ```
 */
export { I18nError } from './types';

/**
 * TranslationLoadError - Error thrown when translation loading fails
 * 
 * Thrown when a translation file cannot be loaded from the server.
 * 
 * @property locale - The locale that failed to load
 * @property namespace - The namespace that failed to load
 * @property cause - The underlying error that caused the failure
 */
export { TranslationLoadError } from './types';

/**
 * InvalidLocaleError - Error thrown when an invalid locale is used
 * 
 * Thrown when attempting to use a locale that is not in the supported locales list.
 * 
 * @property locale - The invalid locale code
 * @property supportedLocales - Array of supported locale codes
 */
export { InvalidLocaleError } from './types';

/**
 * MissingTranslationError - Error thrown when a translation key is missing
 * 
 * Thrown when a translation key cannot be found in the current locale.
 * 
 * @property key - The missing translation key
 * @property locale - The locale where the key is missing
 */
export { MissingTranslationError } from './types';

/**
 * InterpolationError - Error thrown when interpolation fails
 * 
 * Thrown when required variables are missing from interpolation.
 * 
 * @property key - The translation key
 * @property missingVariables - Array of missing variable names
 */
export { InterpolationError } from './types';
