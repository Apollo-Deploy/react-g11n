# React G11n Basic Example

This is a comprehensive example application demonstrating all features of the `react-g11n` library.

## Features Demonstrated

- **Translation System**: Simple translations, interpolation, nested keys, and pluralization
- **Formatting Services**: Date, time, number, currency, percentage, and list formatting
- **Collation**: Locale-aware string sorting and comparison
- **Segmentation**: Text segmentation into words, sentences, and graphemes
- **Standalone API**: Using the g11n system outside of React components
- **Locale Switching**: Dynamic language switching with persistence

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm, yarn, or pnpm

### Installation

1. Navigate to the example directory:

```bash
cd examples/basic-react-app
```

2. Install dependencies:

```bash
npm install
```

### Running the Example

Start the development server:

```bash
npm run dev
```

The application will open automatically in your browser at `http://localhost:3000`.

### Building for Production

Build the example application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
basic-react-app/
├── public/
│   └── locales/           # Translation files
│       ├── en/
│       │   └── common.json
│       ├── es/
│       │   └── common.json
│       └── fr/
│           └── common.json
├── src/
│   ├── components/        # Demo components
│   │   ├── LanguageSwitcher.tsx
│   │   ├── TranslationDemo.tsx
│   │   ├── FormattingDemo.tsx
│   │   ├── CollationDemo.tsx
│   │   ├── SegmentationDemo.tsx
│   │   └── StandaloneDemo.tsx
│   ├── App.tsx           # Main app with I18nProvider
│   ├── main.tsx          # Entry point
│   └── index.css         # Styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Key Concepts

### I18nProvider Setup

The `I18nProvider` wraps the entire application and provides the g11n context:

```tsx
import { I18nProvider } from 'react-g11n';

<I18nProvider
  config={{
    defaultLocale: 'en',
    supportedLocales: ['en', 'es', 'fr'],
    fallbackLocale: 'en',
    loadPath: '/locales/{{locale}}/{{namespace}}.json',
    debug: true,
  }}
>
  <App />
</I18nProvider>
```

### Using the useTranslation Hook

Access translation and formatting functions in any component:

```tsx
import { useTranslation } from 'react-g11n';

function MyComponent() {
  const { t, locale, changeLocale, formatDate, formatNumber } = useTranslation('common');

  return (
    <div>
      <p>{t('welcome.message', { name: 'User' })}</p>
      <p>{formatDate(new Date(), 'long')}</p>
    </div>
  );
}
```

### Translation Files

Translation files are organized by locale and namespace:

```json
{
  "welcome": {
    "message": "Hello, {{name}}!"
  },
  "items": {
    "zero": "No items",
    "one": "One item",
    "other": "{{count}} items"
  }
}
```

### Standalone API

Use the standalone API in utilities, services, or non-React contexts:

```tsx
import { i18n } from 'react-g11n';

// In a utility function
export function formatPrice(amount: number) {
  return i18n.formatCurrency(amount, 'USD');
}

// In a service
export class NotificationService {
  sendNotification(key: string) {
    const message = i18n.t(key);
    // Send notification...
  }
}
```

## Supported Locales

This example includes translations for:

- **English (en)**: Default locale
- **Spanish (es)**: Full translation coverage
- **French (fr)**: Full translation coverage

## Learn More

- [React G11n Documentation](https://github.com/your-org/react-g11n#readme)
- [API Reference](https://github.com/your-org/react-g11n#api-reference)
- [Contributing Guide](https://github.com/your-org/react-g11n/blob/main/CONTRIBUTING.md)

## License

This example is part of the react-g11n project and is licensed under the MIT License.
