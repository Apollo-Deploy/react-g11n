/**
 * TypeScript definitions for Intl.Segmenter API
 * This is a Stage 4 proposal that may not be available in all TypeScript versions
 */

declare namespace Intl {
  type SegmenterGranularity = 'grapheme' | 'word' | 'sentence';

  interface SegmenterOptions {
    granularity?: SegmenterGranularity;
    localeMatcher?: 'lookup' | 'best fit';
  }

  interface Segment {
    segment: string;
    index: number;
    input: string;
    isWordLike?: boolean;
  }

  interface Segments {
    containing(index: number): Segment;
    [Symbol.iterator](): IterableIterator<Segment>;
  }

  class Segmenter {
    constructor(locales?: string | string[], options?: SegmenterOptions);
    segment(input: string): Segments;
    resolvedOptions(): {
      locale: string;
      granularity: SegmenterGranularity;
    };
  }
}
