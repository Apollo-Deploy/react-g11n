import { useTranslation } from 'react-g11n';

export default function FormattingDemo() {
  const { t, formatDate, formatNumber, formatCurrency, formatList, formatRelativeTime } = useTranslation('common');

  const now = new Date();
  const sampleNumber = 1234567.89;
  const items = ['Apple', 'Banana', 'Orange'];

  return (
    <div className="section">
      <h2>{t('formatting.title')}</h2>

      <h3>{t('formatting.date')}</h3>
      <div className="demo-item">
        <strong>Short:</strong>
        <div className="result">{formatDate(now, 'short')}</div>
      </div>
      <div className="demo-item">
        <strong>Medium:</strong>
        <div className="result">{formatDate(now, 'medium')}</div>
      </div>
      <div className="demo-item">
        <strong>Long:</strong>
        <div className="result">{formatDate(now, 'long')}</div>
      </div>
      <div className="demo-item">
        <strong>Full:</strong>
        <div className="result">{formatDate(now, 'full')}</div>
      </div>

      <h3>{t('formatting.time')}</h3>
      <div className="demo-item">
        <strong>Short:</strong>
        <div className="result">{formatDate(now, undefined, 'short')}</div>
      </div>
      <div className="demo-item">
        <strong>Medium:</strong>
        <div className="result">{formatDate(now, undefined, 'medium')}</div>
      </div>

      <h3>{t('formatting.number')}</h3>
      <div className="demo-item">
        <strong>Default:</strong>
        <div className="result">{formatNumber(sampleNumber)}</div>
      </div>
      <div className="demo-item">
        <strong>2 decimals:</strong>
        <div className="result">{formatNumber(sampleNumber, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>

      <h3>{t('formatting.currency')}</h3>
      <div className="demo-item">
        <strong>USD:</strong>
        <div className="result">{formatCurrency(sampleNumber, 'USD')}</div>
      </div>
      <div className="demo-item">
        <strong>EUR:</strong>
        <div className="result">{formatCurrency(sampleNumber, 'EUR')}</div>
      </div>

      <h3>{t('formatting.percent')}</h3>
      <div className="demo-item">
        <strong>75%:</strong>
        <div className="result">{formatNumber(0.75, { style: 'percent' })}</div>
      </div>

      <h3>{t('formatting.list')}</h3>
      <div className="demo-item">
        <strong>Conjunction:</strong>
        <div className="result">{formatList(items, 'conjunction')}</div>
      </div>
      <div className="demo-item">
        <strong>Disjunction:</strong>
        <div className="result">{formatList(items, 'disjunction')}</div>
      </div>

      <h3>{t('formatting.relativeTime')}</h3>
      <div className="demo-item">
        <strong>-1 day:</strong>
        <div className="result">{formatRelativeTime(-1, 'day')}</div>
      </div>
      <div className="demo-item">
        <strong>2 hours:</strong>
        <div className="result">{formatRelativeTime(2, 'hour')}</div>
      </div>
      <div className="demo-item">
        <strong>-30 minutes:</strong>
        <div className="result">{formatRelativeTime(-30, 'minute')}</div>
      </div>
    </div>
  );
}
