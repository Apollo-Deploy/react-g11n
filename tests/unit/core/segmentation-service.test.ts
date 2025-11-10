/**
 * SegmentationService Tests
 * 
 * Tests for locale-aware text segmentation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SegmentationService } from '../../../src/core/segmentation-service';

describe('SegmentationService', () => {
  let service: SegmentationService;

  beforeEach(() => {
    service = new SegmentationService('en');
  });

  describe('word segmentation - space-separated languages', () => {
    it('should segment English text into words', () => {
      const words = service.words('Hello world from JavaScript');
      expect(words).toEqual(['Hello', 'world', 'from', 'JavaScript']);
    });

    it('should handle punctuation correctly', () => {
      const words = service.words('Hello, world! How are you?');
      expect(words).toEqual(['Hello', 'world', 'How', 'are', 'you']);
    });

    it('should handle contractions', () => {
      const words = service.words("Don't worry, it's fine");
      expect(words).toContain("Don't");
      expect(words).toContain("it's");
    });

    it('should handle Spanish text', () => {
      const esService = new SegmentationService('es');
      const words = esService.words('Hola mundo desde JavaScript');
      expect(words).toEqual(['Hola', 'mundo', 'desde', 'JavaScript']);
    });
  });

  describe('word segmentation - CJK languages', () => {
    it('should segment Chinese text', () => {
      const zhService = new SegmentationService('zh');
      const words = zhService.words('你好世界');
      expect(words.length).toBeGreaterThan(0);
      expect(words.join('')).toBe('你好世界');
    });

    it('should segment Japanese text', () => {
      const jaService = new SegmentationService('ja');
      const words = jaService.words('こんにちは世界');
      expect(words.length).toBeGreaterThan(0);
    });
  });

  describe('sentence segmentation', () => {
    it('should segment text into sentences', () => {
      const sentences = service.sentences('Hello world. How are you? I am fine.');
      expect(sentences).toEqual(['Hello world.', 'How are you?', 'I am fine.']);
    });

    it('should handle different punctuation', () => {
      const sentences = service.sentences('First sentence! Second sentence? Third sentence.');
      expect(sentences).toHaveLength(3);
    });

    it('should handle abbreviations', () => {
      const sentences = service.sentences('Dr. Smith went to the U.S. yesterday.');
      expect(sentences.length).toBeGreaterThan(0);
    });

    it('should trim whitespace from sentences', () => {
      const sentences = service.sentences('First.  Second.   Third.');
      sentences.forEach(sentence => {
        expect(sentence).toBe(sentence.trim());
      });
    });
  });

  describe('grapheme cluster segmentation', () => {
    it('should segment basic text into graphemes', () => {
      const graphemes = service.graphemes('hello');
      expect(graphemes).toEqual(['h', 'e', 'l', 'l', 'o']);
    });

    it('should handle emojis as single graphemes', () => {
      const graphemes = service.graphemes('Hello 👋 World 🌍');
      expect(graphemes).toContain('👋');
      expect(graphemes).toContain('🌍');
    });

    it('should handle complex emojis', () => {
      const graphemes = service.graphemes('👨‍👩‍👧‍👦');
      expect(graphemes).toContain('👨‍👩‍👧‍👦');
      expect(graphemes.length).toBe(1);
    });

    it('should handle combining characters', () => {
      const graphemes = service.graphemes('é'); // e + combining acute
      expect(graphemes.length).toBeLessThanOrEqual(2);
    });

    it('should handle flag emojis', () => {
      const graphemes = service.graphemes('🇺🇸');
      expect(graphemes).toContain('🇺🇸');
    });
  });

  describe('word counting', () => {
    it('should count words in English text', () => {
      const count = service.wordCount('Hello world from JavaScript');
      expect(count).toBe(4);
    });

    it('should count words with punctuation', () => {
      const count = service.wordCount('Hello, world! How are you?');
      expect(count).toBe(5);
    });

    it('should count words in CJK text', () => {
      const zhService = new SegmentationService('zh');
      const count = zhService.wordCount('你好世界');
      expect(count).toBeGreaterThan(0);
    });

    it('should return 0 for empty string', () => {
      const count = service.wordCount('');
      expect(count).toBe(0);
    });
  });

  describe('text truncation at word boundaries', () => {
    it('should truncate to specified number of words', () => {
      const result = service.truncateWords('Hello world from JavaScript', 2);
      expect(result).toBe('Hello world...');
    });

    it('should not add ellipsis if text is shorter', () => {
      const result = service.truncateWords('Hello world', 5);
      expect(result).toBe('Hello world');
    });

    it('should handle custom ellipsis', () => {
      const result = service.truncateWords('Hello world from JavaScript', 2, '…');
      expect(result).toBe('Hello world…');
    });

    it('should return empty string for maxWords 0', () => {
      const result = service.truncateWords('Hello world', 0);
      expect(result).toBe('');
    });

    it('should preserve punctuation', () => {
      const result = service.truncateWords('Hello, world! How are you?', 2);
      expect(result).toContain('Hello');
      expect(result).toContain('world');
    });
  });

  describe('text truncation at grapheme boundaries', () => {
    it('should truncate to specified number of graphemes', () => {
      const result = service.truncateGraphemes('Hello', 3);
      expect(result).toBe('Hel...');
    });

    it('should not add ellipsis if text is shorter', () => {
      const result = service.truncateGraphemes('Hi', 5);
      expect(result).toBe('Hi');
    });

    it('should handle emojis correctly', () => {
      const result = service.truncateGraphemes('Hello 👋 World', 7);
      expect(result).not.toContain('�'); // Should not have broken emoji
    });

    it('should handle custom ellipsis', () => {
      const result = service.truncateGraphemes('Hello', 3, '…');
      expect(result).toBe('Hel…');
    });

    it('should return empty string for maxGraphemes 0', () => {
      const result = service.truncateGraphemes('Hello', 0);
      expect(result).toBe('');
    });
  });

  describe('grapheme length', () => {
    it('should return correct length for basic text', () => {
      const length = service.graphemeLength('hello');
      expect(length).toBe(5);
    });

    it('should count emojis as single graphemes', () => {
      const length = service.graphemeLength('Hi 👋');
      expect(length).toBe(4); // H, i, space, emoji
    });

    it('should handle complex emojis', () => {
      const length = service.graphemeLength('👨‍👩‍👧‍👦');
      expect(length).toBe(1);
    });
  });

  describe('locale changes and cache invalidation', () => {
    it('should update locale', () => {
      service.setLocale('es');
      const words = service.words('Hola mundo');
      expect(words).toContain('Hola');
      expect(words).toContain('mundo');
    });

    it('should work correctly after locale change', () => {
      const words1 = service.words('Hello world');
      expect(words1).toEqual(['Hello', 'world']);

      service.setLocale('es');
      const words2 = service.words('Hola mundo');
      expect(words2).toEqual(['Hola', 'mundo']);
    });
  });

  describe('empty string and null handling', () => {
    it('should return empty array for empty string in words', () => {
      const words = service.words('');
      expect(words).toEqual([]);
    });

    it('should return empty array for empty string in sentences', () => {
      const sentences = service.sentences('');
      expect(sentences).toEqual([]);
    });

    it('should return empty array for empty string in graphemes', () => {
      const graphemes = service.graphemes('');
      expect(graphemes).toEqual([]);
    });

    it('should return 0 for empty string in wordCount', () => {
      const count = service.wordCount('');
      expect(count).toBe(0);
    });

    it('should return empty string for empty input in truncateWords', () => {
      const result = service.truncateWords('', 5);
      expect(result).toBe('');
    });

    it('should return empty string for empty input in truncateGraphemes', () => {
      const result = service.truncateGraphemes('', 5);
      expect(result).toBe('');
    });
  });
});
