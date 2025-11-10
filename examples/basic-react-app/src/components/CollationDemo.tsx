import { useTranslation } from '@apollo-deploy/react-g11n';
import { CollationService } from '@apollo-deploy/react-g11n';
import { useMemo } from 'react';

export default function CollationDemo() {
  const { t, locale } = useTranslation('common');

  const unsortedStrings = ['zebra', 'apple', 'Banana', 'cherry', 'APPLE', 'Zebra'];
  
  const collationService = useMemo(() => new CollationService(locale), [locale]);
  
  const sortedStrings = useMemo(() => {
    return collationService.sort([...unsortedStrings]);
  }, [collationService, unsortedStrings]);

  return (
    <div className="section">
      <h2>{t('collation.title')}</h2>
      <p>{t('collation.description')}</p>

      <h3>{t('collation.unsorted')}</h3>
      <div className="demo-item">
        <ul>
          {unsortedStrings.map((str, idx) => (
            <li key={idx}>{str}</li>
          ))}
        </ul>
      </div>

      <h3>{t('collation.sorted')}</h3>
      <div className="demo-item">
        <ul>
          {sortedStrings.map((str, idx) => (
            <li key={idx}>{str}</li>
          ))}
        </ul>
      </div>

      <h3>Case-Sensitive Sort</h3>
      <div className="demo-item">
        <ul>
          {collationService.sort([...unsortedStrings], { sensitivity: 'case' }).map((str, idx) => (
            <li key={idx}>{str}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
