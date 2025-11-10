import { useTranslation } from 'react-g11n';
import { i18n } from 'react-g11n';
import { useState } from 'react';

export default function StandaloneDemo() {
  const { t } = useTranslation('common');
  const [translationResult, setTranslationResult] = useState('');
  const [formatResult, setFormatResult] = useState('');

  const handleTranslate = () => {
    // Using standalone API outside of React component context
    const result = i18n.t('translation.simple');
    setTranslationResult(result);
  };

  const handleFormat = () => {
    // Using standalone API for formatting
    const now = new Date();
    const result = i18n.formatDate(now, 'long');
    setFormatResult(result);
  };

  return (
    <div className="section">
      <h2>{t('standalone.title')}</h2>
      <p>{t('standalone.description')}</p>

      <h3>{t('standalone.translate')}</h3>
      <div className="demo-item">
        <button onClick={handleTranslate}>
          Translate using i18n.t('translation.simple')
        </button>
        {translationResult && (
          <div className="result">{translationResult}</div>
        )}
      </div>

      <h3>{t('standalone.format')}</h3>
      <div className="demo-item">
        <button onClick={handleFormat}>
          Format date using i18n.formatDate(new Date(), 'long')
        </button>
        {formatResult && (
          <div className="result">{formatResult}</div>
        )}
      </div>

      <h3>Standalone API Usage in Utilities</h3>
      <div className="demo-item">
        <p>The standalone API can be used in:</p>
        <ul>
          <li>Utility functions</li>
          <li>Service classes</li>
          <li>Middleware</li>
          <li>Non-React contexts</li>
          <li>Server-side code</li>
        </ul>
        <code>
          import &#123; i18n &#125; from 'react-g11n';<br />
          const text = i18n.t('key');<br />
          const formatted = i18n.formatNumber(1234);
        </code>
      </div>
    </div>
  );
}
