/**
 * Pluralizer Tests
 * 
 * Tests for CLDR-compliant pluralization
 */

import { describe, it, expect } from 'vitest';
import { Pluralizer } from '../../../src/core/pluralizer';

describe('Pluralizer', () => {
  const pluralizer = new Pluralizer();

  describe('cardinal pluralization - English', () => {
    it('should return one form for count 1', () => {
      const translations = { one: 'one item', other: '{{count}} items' };
      const result = pluralizer.pluralize('en', 1, translations);
      expect(result).toBe('one item');
    });

    it('should return other form for count 0', () => {
      const translations = { one: 'one item', other: '{{count}} items' };
      const result = pluralizer.pluralize('en', 0, translations);
      expect(result).toBe('{{count}} items');
    });

    it('should return other form for count > 1', () => {
      const translations = { one: 'one item', other: '{{count}} items' };
      const result = pluralizer.pluralize('en', 5, translations);
      expect(result).toBe('{{count}} items');
    });
  });

  describe('cardinal pluralization - Spanish', () => {
    it('should return one form for count 1', () => {
      const translations = { one: 'un artículo', other: '{{count}} artículos' };
      const result = pluralizer.pluralize('es', 1, translations);
      expect(result).toBe('un artículo');
    });

    it('should return other form for other counts', () => {
      const translations = { one: 'un artículo', other: '{{count}} artículos' };
      const result = pluralizer.pluralize('es', 5, translations);
      expect(result).toBe('{{count}} artículos');
    });
  });

  describe('cardinal pluralization - French', () => {
    it('should return one form for count 0', () => {
      const translations = { one: 'aucun article', other: '{{count}} articles' };
      const result = pluralizer.pluralize('fr', 0, translations);
      expect(result).toBe('aucun article');
    });

    it('should return one form for count 1', () => {
      const translations = { one: 'un article', other: '{{count}} articles' };
      const result = pluralizer.pluralize('fr', 1, translations);
      expect(result).toBe('un article');
    });

    it('should return other form for count > 1', () => {
      const translations = { one: 'un article', other: '{{count}} articles' };
      const result = pluralizer.pluralize('fr', 5, translations);
      expect(result).toBe('{{count}} articles');
    });
  });

  describe('cardinal pluralization - Arabic', () => {
    it('should handle zero form', () => {
      const translations = {
        zero: 'لا عناصر',
        one: 'عنصر واحد',
        two: 'عنصران',
        few: '{{count}} عناصر',
        many: '{{count}} عنصرًا',
        other: '{{count}} عنصر',
      };
      const result = pluralizer.pluralize('ar', 0, translations);
      expect(result).toBe('لا عناصر');
    });

    it('should handle one form', () => {
      const translations = {
        zero: 'لا عناصر',
        one: 'عنصر واحد',
        two: 'عنصران',
        few: '{{count}} عناصر',
        many: '{{count}} عنصرًا',
        other: '{{count}} عنصر',
      };
      const result = pluralizer.pluralize('ar', 1, translations);
      expect(result).toBe('عنصر واحد');
    });

    it('should handle two form', () => {
      const translations = {
        zero: 'لا عناصر',
        one: 'عنصر واحد',
        two: 'عنصران',
        few: '{{count}} عناصر',
        many: '{{count}} عنصرًا',
        other: '{{count}} عنصر',
      };
      const result = pluralizer.pluralize('ar', 2, translations);
      expect(result).toBe('عنصران');
    });

    it('should handle few form', () => {
      const translations = {
        zero: 'لا عناصر',
        one: 'عنصر واحد',
        two: 'عنصران',
        few: '{{count}} عناصر',
        many: '{{count}} عنصرًا',
        other: '{{count}} عنصر',
      };
      const result = pluralizer.pluralize('ar', 5, translations);
      expect(result).toBe('{{count}} عناصر');
    });

    it('should handle many form', () => {
      const translations = {
        zero: 'لا عناصر',
        one: 'عنصر واحد',
        two: 'عنصران',
        few: '{{count}} عناصر',
        many: '{{count}} عنصرًا',
        other: '{{count}} عنصر',
      };
      const result = pluralizer.pluralize('ar', 15, translations);
      expect(result).toBe('{{count}} عنصرًا');
    });
  });

  describe('ordinal pluralization', () => {
    it('should return one form for 1st', () => {
      const translations = { one: '{{count}}st', two: '{{count}}nd', few: '{{count}}rd', other: '{{count}}th' };
      const result = pluralizer.pluralize('en', 1, translations, true);
      expect(result).toBe('{{count}}st');
    });

    it('should return two form for 2nd', () => {
      const translations = { one: '{{count}}st', two: '{{count}}nd', few: '{{count}}rd', other: '{{count}}th' };
      const result = pluralizer.pluralize('en', 2, translations, true);
      expect(result).toBe('{{count}}nd');
    });

    it('should return few form for 3rd', () => {
      const translations = { one: '{{count}}st', two: '{{count}}nd', few: '{{count}}rd', other: '{{count}}th' };
      const result = pluralizer.pluralize('en', 3, translations, true);
      expect(result).toBe('{{count}}rd');
    });

    it('should return other form for 4th', () => {
      const translations = { one: '{{count}}st', two: '{{count}}nd', few: '{{count}}rd', other: '{{count}}th' };
      const result = pluralizer.pluralize('en', 4, translations, true);
      expect(result).toBe('{{count}}th');
    });

    it('should handle 11th, 12th, 13th correctly', () => {
      const translations = { one: '{{count}}st', two: '{{count}}nd', few: '{{count}}rd', other: '{{count}}th' };
      expect(pluralizer.pluralize('en', 11, translations, true)).toBe('{{count}}th');
      expect(pluralizer.pluralize('en', 12, translations, true)).toBe('{{count}}th');
      expect(pluralizer.pluralize('en', 13, translations, true)).toBe('{{count}}th');
    });

    it('should handle 21st, 22nd, 23rd correctly', () => {
      const translations = { one: '{{count}}st', two: '{{count}}nd', few: '{{count}}rd', other: '{{count}}th' };
      expect(pluralizer.pluralize('en', 21, translations, true)).toBe('{{count}}st');
      expect(pluralizer.pluralize('en', 22, translations, true)).toBe('{{count}}nd');
      expect(pluralizer.pluralize('en', 23, translations, true)).toBe('{{count}}rd');
    });
  });

  describe('interval-based pluralization', () => {
    it('should match exact count', () => {
      const translations = { '0': 'no items', '1': 'one item', other: '{{count}} items' };
      expect(pluralizer.pluralize('en', 0, translations)).toBe('no items');
      expect(pluralizer.pluralize('en', 1, translations)).toBe('one item');
    });

    it('should match range intervals', () => {
      const translations = {
        '0': 'no items',
        '1': 'one item',
        '2-5': 'a few items',
        '6-10': 'several items',
        other: 'many items',
      };
      expect(pluralizer.pluralize('en', 3, translations)).toBe('a few items');
      expect(pluralizer.pluralize('en', 5, translations)).toBe('a few items');
      expect(pluralizer.pluralize('en', 7, translations)).toBe('several items');
    });

    it('should match open-ended intervals', () => {
      const translations = {
        '0': 'no items',
        '1': 'one item',
        '2-10': 'a few items',
        '11+': 'many items',
      };
      expect(pluralizer.pluralize('en', 11, translations)).toBe('many items');
      expect(pluralizer.pluralize('en', 100, translations)).toBe('many items');
    });
  });

  describe('contextual pluralization', () => {
    it('should use contextual translations when provided', () => {
      const translations = {
        male: { one: 'one male friend', other: '{{count}} male friends' },
        female: { one: 'one female friend', other: '{{count}} female friends' },
      };
      const result = pluralizer.pluralize('en', 1, translations, false, 'male');
      expect(result).toBe('one male friend');
    });

    it('should handle different contexts', () => {
      const translations = {
        male: { one: 'one male friend', other: '{{count}} male friends' },
        female: { one: 'one female friend', other: '{{count}} female friends' },
      };
      const result = pluralizer.pluralize('en', 3, translations, false, 'female');
      expect(result).toBe('{{count}} female friends');
    });
  });

  describe('fallback to other form', () => {
    it('should fall back to other when specific form is missing', () => {
      const translations = { other: '{{count}} items' };
      const result = pluralizer.pluralize('en', 1, translations);
      expect(result).toBe('{{count}} items');
    });

    it('should return count as string when no translation found', () => {
      const translations = {};
      const result = pluralizer.pluralize('en', 5, translations);
      expect(result).toBe('5');
    });
  });

  describe('getPluralForm', () => {
    it('should return correct plural form for English', () => {
      expect(pluralizer.getPluralForm('en', 1)).toBe('one');
      expect(pluralizer.getPluralForm('en', 0)).toBe('other');
      expect(pluralizer.getPluralForm('en', 5)).toBe('other');
    });

    it('should return correct ordinal form for English', () => {
      expect(pluralizer.getPluralForm('en', 1, true)).toBe('one');
      expect(pluralizer.getPluralForm('en', 2, true)).toBe('two');
      expect(pluralizer.getPluralForm('en', 3, true)).toBe('few');
      expect(pluralizer.getPluralForm('en', 4, true)).toBe('other');
    });
  });

  describe('edge cases', () => {
    it('should handle zero', () => {
      const translations = { zero: 'no items', other: '{{count}} items' };
      const result = pluralizer.pluralize('ar', 0, translations);
      expect(result).toBe('no items');
    });

    it('should handle negative numbers', () => {
      const translations = { one: 'one item', other: '{{count}} items' };
      const result = pluralizer.pluralize('en', -1, translations);
      expect(result).toBe('{{count}} items');
    });

    it('should handle decimal numbers', () => {
      const translations = { one: 'one item', other: '{{count}} items' };
      const result = pluralizer.pluralize('en', 1.5, translations);
      expect(result).toBe('{{count}} items');
    });
  });
});
