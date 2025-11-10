import { useTranslation } from 'react-g11n';
import { SegmentationService } from 'react-g11n';
import { useMemo } from 'react';

export default function SegmentationDemo() {
  const { t, locale } = useTranslation('common');

  const sampleText = t('segmentation.sampleText');
  
  const segmentationService = useMemo(() => new SegmentationService(locale), [locale]);

  const words = useMemo(() => {
    return segmentationService.segmentWords(sampleText);
  }, [segmentationService, sampleText]);

  const sentences = useMemo(() => {
    return segmentationService.segmentSentences(sampleText);
  }, [segmentationService, sampleText]);

  const graphemes = useMemo(() => {
    const firstWord = words[0] || '';
    return segmentationService.segmentGraphemes(firstWord);
  }, [segmentationService, words]);

  return (
    <div className="section">
      <h2>{t('segmentation.title')}</h2>
      <p>{t('segmentation.description')}</p>

      <h3>Sample Text</h3>
      <div className="demo-item">
        <div className="result">{sampleText}</div>
      </div>

      <h3>{t('segmentation.words')} ({words.length})</h3>
      <div className="demo-item">
        <ul>
          {words.map((word, idx) => (
            <li key={idx}>{word}</li>
          ))}
        </ul>
      </div>

      <h3>{t('segmentation.sentences')} ({sentences.length})</h3>
      <div className="demo-item">
        <ul>
          {sentences.map((sentence, idx) => (
            <li key={idx}>{sentence}</li>
          ))}
        </ul>
      </div>

      <h3>{t('segmentation.graphemes')} (First word: "{words[0] || ''}")</h3>
      <div className="demo-item">
        <div className="result">{graphemes.join(' | ')}</div>
      </div>
    </div>
  );
}
