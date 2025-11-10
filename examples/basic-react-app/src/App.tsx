import { I18nProvider, useTranslation } from '@apollo-deploy/react-g11n';
import LanguageSwitcher from './components/LanguageSwitcher';
import TranslationDemo from './components/TranslationDemo';
import FormattingDemo from './components/FormattingDemo';
import CollationDemo from './components/CollationDemo';
import SegmentationDemo from './components/SegmentationDemo';
import StandaloneDemo from './components/StandaloneDemo';

function AppContent() {
  const { t, isReady, isLoading } = useTranslation('common');

  if (isLoading || !isReady) {
    return <div>Loading translations...</div>;
  }

  return (
    <>
      <header>
        <h1>{t('app.title')}</h1>
        <p>{t('app.subtitle')}</p>
      </header>

      <LanguageSwitcher />
      <TranslationDemo />
      <FormattingDemo />
      <CollationDemo />
      <SegmentationDemo />
      <StandaloneDemo />

      <footer className="section">
        <p>
          <a href="https://github.com/your-org/react-g11n" target="_blank" rel="noopener noreferrer">
            {t('footer.github')}
          </a>
          {' | '}
          <a href="https://www.npmjs.com/package/react-g11n" target="_blank" rel="noopener noreferrer">
            {t('footer.npm')}
          </a>
          {' | '}
          <a href="https://github.com/your-org/react-g11n#readme" target="_blank" rel="noopener noreferrer">
            {t('footer.documentation')}
          </a>
        </p>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <I18nProvider
      config={{
        defaultLocale: 'en',
        supportedLocales: ['en', 'es', 'fr'],
        fallbackLocale: 'en',
        namespaces: ['common'],
        defaultNamespace: 'common',
        loadPath: '/locales/{{locale}}/{{namespace}}.json',
        debug: true,
      }}
    >
      <AppContent />
    </I18nProvider>
  );
}
