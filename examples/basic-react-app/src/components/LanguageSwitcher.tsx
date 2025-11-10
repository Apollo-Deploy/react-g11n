import { useTranslation } from '@apollo-deploy/react-g11n';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
];

export default function LanguageSwitcher() {
  const { t, locale, changeLocale } = useTranslation('common');

  return (
    <div className="section">
      <h2>{t('languageSwitcher.title')}</h2>
      <div className="language-switcher">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLocale(lang.code)}
            className={locale === lang.code ? 'active' : ''}
          >
            {lang.name}
          </button>
        ))}
      </div>
      <p>{t('languageSwitcher.currentLanguage', { language: LANGUAGES.find(l => l.code === locale)?.name })}</p>
    </div>
  );
}
