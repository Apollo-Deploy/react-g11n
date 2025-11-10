import { useTranslation } from 'react-g11n';

export default function TranslationDemo() {
  const { t } = useTranslation('common');

  return (
    <div className="section">
      <h2>{t('translation.title')}</h2>

      <h3>Simple Translation</h3>
      <div className="demo-item">
        <strong>Key:</strong> <code>translation.simple</code>
        <div className="result">{t('translation.simple')}</div>
      </div>

      <h3>Interpolation</h3>
      <div className="demo-item">
        <strong>Key:</strong> <code>translation.interpolation</code>
        <div className="result">{t('translation.interpolation', { name: 'Developer' })}</div>
      </div>

      <h3>Nested Keys</h3>
      <div className="demo-item">
        <strong>Key:</strong> <code>translation.nested.level1.level2</code>
        <div className="result">{t('translation.nested.level1.level2')}</div>
      </div>

      <h3>Pluralization</h3>
      <div className="demo-item">
        <strong>0 items:</strong>
        <div className="result">{t('translation.pluralization.items', { count: 0 })}</div>
      </div>
      <div className="demo-item">
        <strong>1 item:</strong>
        <div className="result">{t('translation.pluralization.items', { count: 1 })}</div>
      </div>
      <div className="demo-item">
        <strong>5 items:</strong>
        <div className="result">{t('translation.pluralization.items', { count: 5 })}</div>
      </div>

      <h3>Pluralization with Interpolation</h3>
      <div className="demo-item">
        <strong>0 messages:</strong>
        <div className="result">{t('translation.pluralization.messages', { count: 0 })}</div>
      </div>
      <div className="demo-item">
        <strong>1 message:</strong>
        <div className="result">{t('translation.pluralization.messages', { count: 1 })}</div>
      </div>
      <div className="demo-item">
        <strong>42 messages:</strong>
        <div className="result">{t('translation.pluralization.messages', { count: 42 })}</div>
      </div>
    </div>
  );
}
