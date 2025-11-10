/**
 * SegmentationService
 * 
 * Provides locale-aware text segmentation for words, sentences, and grapheme clusters.
 * Uses the Intl.Segmenter API for proper handling of all languages including CJK.
 * 
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5
 */

export class SegmentationService {
  private locale: string;
  private wordSegmenter: Intl.Segmenter | null = null;
  private sentenceSegmenter: Intl.Segmenter | null = null;
  private graphemeSegmenter: Intl.Segmenter | null = null;

  constructor(locale: string) {
    this.locale = locale;
  }

  /**
   * Update the locale for all segmenters
   * Requirement 15.1, 15.2, 15.3
   */
  setLocale(locale: string): void {
    this.locale = locale;
    // Clear cached segmenters to force recreation with new locale
    this.wordSegmenter = null;
    this.sentenceSegmenter = null;
    this.graphemeSegmenter = null;
  }

  /**
   * Segment text into words according to locale rules
   * Handles languages without spaces (CJK) correctly
   * Requirement 15.1, 15.4
   */
  words(text: string): string[] {
    if (!text) return [];
    
    const segmenter = this.getWordSegmenter();
    const segments = segmenter.segment(text);
    const words: string[] = [];

    for (const segment of segments) {
      // Only include word-like segments, skip spaces and punctuation
      if (segment.isWordLike) {
        words.push(segment.segment);
      }
    }

    return words;
  }

  /**
   * Segment text into sentences according to locale rules
   * Requirement 15.2
   */
  sentences(text: string): string[] {
    if (!text) return [];
    
    const segmenter = this.getSentenceSegmenter();
    const segments = segmenter.segment(text);
    const sentences: string[] = [];

    for (const segment of segments) {
      const trimmed = segment.segment.trim();
      if (trimmed) {
        sentences.push(trimmed);
      }
    }

    return sentences;
  }

  /**
   * Segment text into grapheme clusters for proper character handling
   * Important for emojis, combining characters, and complex scripts
   * Requirement 15.3
   */
  graphemes(text: string): string[] {
    if (!text) return [];
    
    const segmenter = this.getGraphemeSegmenter();
    const segments = segmenter.segment(text);
    const graphemes: string[] = [];

    for (const segment of segments) {
      graphemes.push(segment.segment);
    }

    return graphemes;
  }

  /**
   * Count words in text according to locale rules
   * Handles CJK languages correctly
   * Requirement 15.4
   */
  wordCount(text: string): number {
    return this.words(text).length;
  }

  /**
   * Truncate text to a maximum number of words with optional ellipsis
   * Uses word boundaries to avoid cutting words in half
   * Handles CJK languages correctly
   * Requirement 15.5
   */
  truncateWords(text: string, maxWords: number, ellipsis: string = '...'): string {
    if (!text || maxWords <= 0) return '';
    
    const segmenter = this.getWordSegmenter();
    const segments = Array.from(segmenter.segment(text));
    
    let wordCount = 0;
    let result = '';
    let needsEllipsis = false;

    for (const segment of segments) {
      const seg = segment as Intl.Segment;
      if (seg.isWordLike) {
        if (wordCount >= maxWords) {
          needsEllipsis = true;
          break;
        }
        wordCount++;
      }
      result += seg.segment;
    }

    // Check if there are more segments after truncation
    if (needsEllipsis || wordCount < this.wordCount(text)) {
      result = result.trimEnd() + ellipsis;
    }

    return result;
  }

  /**
   * Truncate text to a maximum number of characters at grapheme boundaries
   * Ensures emojis and combining characters are not split
   * Requirement 15.3, 15.5
   */
  truncateGraphemes(text: string, maxGraphemes: number, ellipsis: string = '...'): string {
    if (!text || maxGraphemes <= 0) return '';
    
    const graphemes = this.graphemes(text);
    
    if (graphemes.length <= maxGraphemes) {
      return text;
    }

    return graphemes.slice(0, maxGraphemes).join('') + ellipsis;
  }

  /**
   * Get the length of text in grapheme clusters
   * More accurate than string.length for complex scripts and emojis
   * Requirement 15.3
   */
  graphemeLength(text: string): number {
    return this.graphemes(text).length;
  }

  /**
   * Get or create word segmenter for current locale
   * Requirement 15.1
   */
  private getWordSegmenter(): Intl.Segmenter {
    if (!this.wordSegmenter) {
      this.wordSegmenter = new Intl.Segmenter(this.locale, { granularity: 'word' });
    }
    return this.wordSegmenter;
  }

  /**
   * Get or create sentence segmenter for current locale
   * Requirement 15.2
   */
  private getSentenceSegmenter(): Intl.Segmenter {
    if (!this.sentenceSegmenter) {
      this.sentenceSegmenter = new Intl.Segmenter(this.locale, { granularity: 'sentence' });
    }
    return this.sentenceSegmenter;
  }

  /**
   * Get or create grapheme segmenter for current locale
   * Requirement 15.3
   */
  private getGraphemeSegmenter(): Intl.Segmenter {
    if (!this.graphemeSegmenter) {
      this.graphemeSegmenter = new Intl.Segmenter(this.locale, { granularity: 'grapheme' });
    }
    return this.graphemeSegmenter;
  }
}
