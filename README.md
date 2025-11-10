# React G11n

A modern, type-safe globalization library for React

[![npm version](https://img.shields.io/npm/v/@apollo-deploy/react-g11n.svg)](https://www.npmjs.com/package/@apollo-deploy/react-g11n)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Apollo-Deploy/react-g11n/ci.yml?branch=main)](https://github.com/Apollo-Deploy/react-g11n/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

## Features

- **Comprehensive Globalization** - Translation, formatting, collation, segmentation, and more
- **React-First Design** - Built for React with hooks and context, plus standalone API for non-React code
- **Zero Dependencies** - No runtime dependencies except React peer dependencies
- **Type-Safe** - Full TypeScript support with strict typing for translation keys
- **Tree-Shakeable** - Modular architecture allows bundlers to eliminate unused code
- **Performance Optimized** - Efficient caching and memoization strategies
- **Dynamic Locale Switching** - Change languages on the fly without page reloads
- **Pluralization** - CLDR-compliant plural rules for all languages
- **Interpolation** - Variable substitution with HTML escaping for security
- **Advanced Formatting** - Dates, numbers, currencies, lists, units, and ranges
- **Collation** - Locale-aware string sorting and comparison
- **Segmentation** - Word, sentence, and grapheme segmentation
- **Display Names** - Localized names for languages, regions, currencies, and more
- **Document Service** - Automatic lang and dir attribute management
- **Framework Agnostic Core** - Core services can be used in any JavaScript environment

## Installation

```bash
# npm
npm install @apollo-deploy/react-g11n

# yarn
yarn add @apollo-deploy/react-g11n

# pnpm
pnpm add @apollo-deploy/react-g11n
```

## Quick Start

```tsx
import { I18nProvider, useTranslation } from '@apollo-deploy/react-g11n';

// 1. Wrap your app with I18nProvider
function App() {
  return (
    <I18nProvider
      config={{
        defaultLocale: 'en',
        supportedLocales: ['en', 'es', 'fr'],
        loadPath: '/locales/{{locale}}/{{namespace}}.json',
      }}
    >
      <MyComponent />
    </I18nProvider>
  );
}

// 2. Use translations in your components
function MyComponent() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <p>{t('welcome.message', { name: 'World' })}</p>
      <button onClick={() => setLocale('es')}>
        Switch to Spanish
      </button>
    </div>
  );
}
```

## React Usage

### Setting Up the Provider

The `I18nProvider` component initializes the globalization system and makes it available to all child components:

```tsx
import { I18nProvider } from '@apollo-deploy/react-g11n';

function App() {
  return (
    <I18nProvider
      config={{
        defaultLocale: 'en',
        supportedLocales: ['en', 'es', 'fr', 'de', 'ja'],
        fallbackLocale: 'en',
        namespaces: ['common', 'auth', 'dashboard'],
        defaultNamespace: 'common',
        loadPath: '/locales/{{locale}}/{{namespace}}.json',
        debug: process.env.NODE_ENV === 'development',
      }}
    >
      <YourApp />
    </I18nProvider>
  );
}
```

### Using the Translation Hook

The `useTranslation` hook provides access to all globalization features:

```tsx
import { useTranslation } from '@apollo-deploy/react-g11n';

function MyComponent() {
  const {
    t,                    // Translation function
    locale,               // Current locale
    setLocale,            // Change locale
    locales,              // Available locales
    isLoading,            // Loading state
    formatDate,           // Date formatting
    formatNumber,         // Number formatting
    formatCurrency,       // Currency formatting
    formatList,           // List formatting
    // ... and more
  } = useTranslation('common'); // Optional namespace

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('greeting', { name: 'Alice' })}</p>
      <p>{t('items', { count: 5 })}</p>
      <p>{formatDate(new Date(), 'long')}</p>
      <p>{formatCurrency(99.99, 'USD')}</p>
    </div>
  );
}
```

## Standalone API Usage

For use outside of React components (utilities, services, middleware):

```typescript
import { i18n } from '@apollo-deploy/react-g11n/standalone';

// Initialize the standalone instance
await i18n.init({
  defaultLocale: 'en',
  supportedLocales: ['en', 'es', 'fr'],
  loadPath: '/locales/{{locale}}/{{namespace}}.json',
});

// Use translations
const message = i18n.t('welcome.message', { name: 'World' });

// Change locale
await i18n.setLocale('es');

// Format dates and numbers
const formattedDate = i18n.formatDate(new Date(), 'long');
const formattedNumber = i18n.formatNumber(1234.56);

// Listen to locale changes
i18n.onLocaleChange((newLocale) => {
  console.log('Locale changed to:', newLocale);
});
```

## Configuration

The `I18nConfig` interface defines all available configuration options:

```typescript
interface I18nConfig {
  // Required: Default locale for the application
  defaultLocale: string;

  // Required: List of supported locales
  supportedLocales: string[];

  // Optional: Fallback locale when translations are missing (defaults to defaultLocale)
  fallbackLocale?: string;

  // Optional: Translation namespaces (defaults to ['common'])
  namespaces?: string[];

  // Optional: Default namespace (defaults to 'common')
  defaultNamespace?: string;

  // Optional: Path template for loading translation files
  // Placeholders: {{locale}}, {{namespace}}
  // Default: '/locales/{{locale}}/{{namespace}}.json'
  loadPath?: string;

  // Optional: Enable debug logging (defaults to false)
  debug?: boolean;

  // Optional: Interpolation configuration
  interpolation?: {
    prefix?: string;        // Default: '{{'
    suffix?: string;        // Default: '}}'
    escapeValue?: boolean;  // Default: true (escape HTML)
  };

  // Optional: Pluralization configuration
  pluralization?: {
    simplifyPluralSuffix?: boolean;  // Default: true
  };
}
```

## Translation Files

Translation files are JSON files organized by locale and namespace:

```
public/
└── locales/
    ├── en/
    │   ├── common.json
    │   ├── auth.json
    │   └── dashboard.json
    ├── es/
    │   ├── common.json
    │   ├── auth.json
    │   └── dashboard.json
    └── fr/
        ├── common.json
        ├── auth.json
        └── dashboard.json
```

### Translation File Structure

```json
{
  "welcome": {
    "title": "Welcome",
    "message": "Hello, {{name}}!",
    "description": "This is a <strong>rich</strong> text example"
  },
  "items": {
    "zero": "No items",
    "one": "One item",
    "other": "{{count}} items"
  },
  "nested": {
    "deeply": {
      "key": "Nested value"
    }
  }
}
```

Access nested keys with dot notation:
```typescript
t('welcome.title')           // "Welcome"
t('nested.deeply.key')       // "Nested value"
```

## Advanced Features

### Pluralization

React G11n uses CLDR plural rules for accurate pluralization across all languages:

```json
{
  "items": {
    "zero": "No items",
    "one": "One item",
    "two": "Two items",
    "few": "A few items",
    "many": "Many items",
    "other": "{{count}} items"
  }
}
```

```tsx
t('items', { count: 0 })   // "No items"
t('items', { count: 1 })   // "One item"
t('items', { count: 5 })   // "5 items"
```

### Interpolation

Insert variables into translations with automatic HTML escaping:

```json
{
  "greeting": "Hello, {{name}}!",
  "welcome": "Welcome back, {{firstName}} {{lastName}}",
  "balance": "Your balance is {{amount}}"
}
```

```tsx
t('greeting', { name: 'Alice' })
// "Hello, Alice!"

t('welcome', { firstName: 'John', lastName: 'Doe' })
// "Welcome back, John Doe"

t('balance', { amount: '$100.00' })
// "Your balance is $100.00"
```

### Date and Time Formatting

```tsx
const { formatDate, formatTime, formatDateTime, formatRelativeTime } = useTranslation();

// Date formatting
formatDate(new Date(), 'short')    // "1/15/24"
formatDate(new Date(), 'medium')   // "Jan 15, 2024"
formatDate(new Date(), 'long')     // "January 15, 2024"
formatDate(new Date(), 'full')     // "Monday, January 15, 2024"

// Time formatting
formatTime(new Date(), 'short')    // "3:30 PM"
formatTime(new Date(), 'medium')   // "3:30:00 PM"

// Date and time
formatDateTime(new Date(), 'medium', 'short')  // "Jan 15, 2024, 3:30 PM"

// Relative time
formatRelativeTime(-1, 'day')      // "yesterday"
formatRelativeTime(2, 'hour')      // "in 2 hours"
```

### Number and Currency Formatting

```tsx
const { formatNumber, formatCurrency, formatPercent } = useTranslation();

// Number formatting
formatNumber(1234.56)              // "1,234.56"
formatNumber(1234.56, { minimumFractionDigits: 0 })  // "1,235"

// Currency formatting
formatCurrency(99.99, 'USD')       // "$99.99"
formatCurrency(99.99, 'EUR')       // "€99.99"
formatCurrency(99.99, 'JPY')       // "¥100"

// Percentage formatting
formatPercent(0.75)                // "75%"
formatPercent(0.1234, { minimumFractionDigits: 2 })  // "12.34%"
```

### List Formatting

```tsx
const { formatList } = useTranslation();

const items = ['apples', 'oranges', 'bananas'];

formatList(items, 'conjunction')   // "apples, oranges, and bananas"
formatList(items, 'disjunction')   // "apples, oranges, or bananas"
formatList(items, 'unit')          // "apples, oranges, bananas"
```

### Unit Formatting

```tsx
const { formatUnit } = useTranslation();

formatUnit(5, 'kilometer')         // "5 kilometers"
formatUnit(100, 'megabyte')        // "100 megabytes"
formatUnit(2.5, 'hour')            // "2.5 hours"
```

### Range Formatting

```tsx
const { formatDateRange, formatNumberRange } = useTranslation();

const start = new Date('2024-01-15');
const end = new Date('2024-01-20');

formatDateRange(start, end)        // "Jan 15 – 20, 2024"

formatNumberRange(100, 200)        // "100–200"
```

### Collation (Sorting)

```tsx
const { compare, sort } = useTranslation();

const names = ['Zoe', 'Ángel', 'Álvaro', 'Zebra'];

// Locale-aware comparison
compare('Ángel', 'Álvaro')         // -1 (Ángel comes before Álvaro)

// Locale-aware sorting
const sorted = sort(names);        // ['Álvaro', 'Ángel', 'Zebra', 'Zoe']

// Case-insensitive sorting
const sortedIgnoreCase = sort(names, { sensitivity: 'base' });
```

### Segmentation

```tsx
const { segmentWords, segmentSentences, segmentGraphemes } = useTranslation();

const text = "Hello world! How are you?";

// Word segmentation
const words = segmentWords(text);
// ['Hello', ' ', 'world', '!', ' ', 'How', ' ', 'are', ' ', 'you', '?']

// Sentence segmentation
const sentences = segmentSentences(text);
// ['Hello world! ', 'How are you?']

// Grapheme segmentation (useful for emoji and complex scripts)
const graphemes = segmentGraphemes('👨‍👩‍👧‍👦');
// ['👨‍👩‍👧‍👦']
```

### Display Names

```tsx
const { getLanguageName, getRegionName, getCurrencyName } = useTranslation();

// Language names
getLanguageName('en')              // "English"
getLanguageName('es')              // "Spanish"
getLanguageName('ja')              // "Japanese"

// Region names
getRegionName('US')                // "United States"
getRegionName('GB')                // "United Kingdom"

// Currency names
getCurrencyName('USD')             // "US Dollar"
getCurrencyName('EUR')             // "Euro"
```

### Document Service

Automatically manage document language attributes:

```tsx
const { updateDocumentLanguage } = useTranslation();

// Updates <html lang="es" dir="ltr">
updateDocumentLanguage('es');

// Automatically sets dir="rtl" for RTL languages
updateDocumentLanguage('ar');  // <html lang="ar" dir="rtl">
```

## TypeScript

React G11n is built with TypeScript and provides comprehensive type definitions:

```typescript
import type {
  I18nConfig,
  TranslationKey,
  TranslateFn,
  LocaleInfo,
  UseTranslationResult,
  DateFormat,
  TimeFormat,
  ListFormatType,
} from '@apollo-deploy/react-g11n';

// Type-safe translation function
const t: TranslateFn = useTranslation().t;

// Type-safe configuration
const config: I18nConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'es'],
};

// Type-safe locale information
const localeInfo: LocaleInfo = {
  code: 'en',
  name: 'English',
  nativeName: 'English',
  direction: 'ltr',
};
```

### Error Classes

```typescript
import {
  I18nError,
  TranslationLoadError,
  InvalidLocaleError,
  MissingTranslationError,
  InterpolationError,
} from '@apollo-deploy/react-g11n';

try {
  await i18n.setLocale('invalid');
} catch (error) {
  if (error instanceof InvalidLocaleError) {
    console.error('Invalid locale:', error.message);
  }
}
```

## Troubleshooting

### Translations Not Loading

**Problem**: Translations don't appear or show as keys

**Solutions**:
- Verify `loadPath` is correct and matches your file structure
- Check that translation files are in the `public` directory (or accessible via HTTP)
- Enable `debug: true` in config to see loading errors
- Check browser network tab for 404 errors

### Locale Not Changing

**Problem**: `setLocale()` doesn't update the UI

**Solutions**:
- Ensure components using `useTranslation()` are inside `I18nProvider`
- Check that the locale is in `supportedLocales` array
- Verify translation files exist for the target locale

### TypeScript Errors

**Problem**: Type errors when using the library

**Solutions**:
- Ensure `react` and `react-dom` are installed as peer dependencies
- Check that TypeScript version is 4.5 or higher
- Verify `moduleResolution` is set to `"node"` or `"bundler"` in tsconfig.json

### Performance Issues

**Problem**: Slow locale switching or rendering

**Solutions**:
- Use namespace splitting to load only needed translations
- Implement lazy loading for large translation files
- Memoize components that don't need to re-render on locale change
- Use the standalone API for non-React code to avoid unnecessary re-renders

### Missing Pluralization Forms

**Problem**: Plural translations not working correctly

**Solutions**:
- Ensure you're using the correct plural forms for the language (check CLDR rules)
- Always include at least `one` and `other` forms
- Pass `count` parameter to `t()` function

## Examples

Check out the [examples directory](./examples) for complete working examples:

- [Basic React App](./examples/basic-react-app) - Complete React application demonstrating all features

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Development setup
- Coding standards
- Pull request process
- Testing requirements

## License

MIT © [Your Organization](./LICENSE)