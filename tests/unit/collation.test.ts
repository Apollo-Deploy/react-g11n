/**
 * CollationService Tests
 * 
 * Tests for locale-aware string sorting and comparison
 */

import { describe, it, expect } from 'vitest';
import { CollationService } from '../../src/core/collation-service';

describe('CollationService', () => {
  describe('sort', () => {
    it('should sort strings according to locale rules', () => {
      const collation = new CollationService('en');
      const items = ['Zoe', 'Ángel', 'Bob', 'alice'];
      const sorted = collation.sort(items);
      
      // English sorting should handle accented characters
      expect(sorted).toEqual(['alice', 'Ángel', 'Bob', 'Zoe']);
    });

    it('should support case-insensitive sorting', () => {
      const collation = new CollationService('en');
      const items = ['apple', 'Banana', 'cherry', 'Apple'];
      const sorted = collation.sort(items, { sensitivity: 'base' });
      
      // Case-insensitive: apple/Apple should be together
      expect(sorted[0].toLowerCase()).toBe('apple');
      expect(sorted[1].toLowerCase()).toBe('apple');
    });

    it('should support numeric sorting', () => {
      const collation = new CollationService('en');
      const items = ['item10', 'item2', 'item1', 'item20'];
      const sorted = collation.sort(items, { numeric: true });
      
      // Numeric sorting: item1, item2, item10, item20
      expect(sorted).toEqual(['item1', 'item2', 'item10', 'item20']);
    });

    it('should handle special characters correctly', () => {
      const collation = new CollationService('en');
      const items = ['café', 'cafe', 'caff'];
      const sorted = collation.sort(items);
      
      // Should sort with proper handling of accents
      expect(sorted).toContain('café');
      expect(sorted).toContain('cafe');
      expect(sorted).toContain('caff');
    });

    it('should not mutate the original array', () => {
      const collation = new CollationService('en');
      const items = ['c', 'a', 'b'];
      const original = [...items];
      
      collation.sort(items);
      
      expect(items).toEqual(original);
    });
  });

  describe('compare', () => {
    it('should compare two strings according to locale rules', () => {
      const collation = new CollationService('en');
      
      expect(collation.compare('a', 'b')).toBeLessThan(0);
      expect(collation.compare('b', 'a')).toBeGreaterThan(0);
      expect(collation.compare('a', 'a')).toBe(0);
    });

    it('should handle case-sensitive comparison', () => {
      const collation = new CollationService('en');
      
      const result = collation.compare('A', 'a', { sensitivity: 'case' });
      expect(result).not.toBe(0);
    });

    it('should handle case-insensitive comparison', () => {
      const collation = new CollationService('en');
      
      const result = collation.compare('A', 'a', { sensitivity: 'base' });
      expect(result).toBe(0);
    });

    it('should handle accented characters', () => {
      const collation = new CollationService('en');
      
      // With base sensitivity, é and e should be equal
      const result = collation.compare('café', 'cafe', { sensitivity: 'base' });
      expect(result).toBe(0);
    });
  });

  describe('sortBy', () => {
    it('should sort objects by string property', () => {
      const collation = new CollationService('en');
      const users = [
        { name: 'Zoe', age: 25 },
        { name: 'Ángel', age: 30 },
        { name: 'Bob', age: 28 },
      ];
      
      const sorted = collation.sortBy(users, (user) => user.name);
      
      expect(sorted[0].name).toBe('Ángel');
      expect(sorted[1].name).toBe('Bob');
      expect(sorted[2].name).toBe('Zoe');
    });

    it('should support custom collation options', () => {
      const collation = new CollationService('en');
      const items = [
        { id: 'item10' },
        { id: 'item2' },
        { id: 'item1' },
      ];
      
      const sorted = collation.sortBy(items, (item) => item.id, { numeric: true });
      
      expect(sorted[0].id).toBe('item1');
      expect(sorted[1].id).toBe('item2');
      expect(sorted[2].id).toBe('item10');
    });

    it('should not mutate the original array', () => {
      const collation = new CollationService('en');
      const items = [{ name: 'c' }, { name: 'a' }, { name: 'b' }];
      const original = [...items];
      
      collation.sortBy(items, (item) => item.name);
      
      expect(items).toEqual(original);
    });
  });

  describe('locale handling', () => {
    it('should respect different locale sorting rules', () => {
      const enCollation = new CollationService('en');
      const esCollation = new CollationService('es');
      
      const items = ['ñ', 'n', 'o'];
      
      const enSorted = enCollation.sort(items);
      const esSorted = esCollation.sort(items);
      
      // Both should handle ñ correctly
      expect(enSorted).toContain('ñ');
      expect(esSorted).toContain('ñ');
    });

    it('should update locale when setLocale is called', () => {
      const collation = new CollationService('en');
      
      const items = ['a', 'b', 'c'];
      const sorted1 = collation.sort(items);
      
      collation.setLocale('es');
      const sorted2 = collation.sort(items);
      
      // Should still work after locale change
      expect(sorted1).toEqual(sorted2);
    });
  });

  describe('caching', () => {
    it('should cache collator instances', () => {
      const collation = new CollationService('en');
      
      // Multiple sorts with same options should use cached collator
      const items1 = ['c', 'a', 'b'];
      const items2 = ['z', 'x', 'y'];
      
      const sorted1 = collation.sort(items1);
      const sorted2 = collation.sort(items2);
      
      expect(sorted1).toEqual(['a', 'b', 'c']);
      expect(sorted2).toEqual(['x', 'y', 'z']);
    });

    it('should clear cache when locale changes', () => {
      const collation = new CollationService('en');
      
      collation.sort(['a', 'b', 'c']);
      
      // Change locale should clear cache
      collation.setLocale('es');
      
      // Should still work correctly
      const sorted = collation.sort(['c', 'a', 'b']);
      expect(sorted).toEqual(['a', 'b', 'c']);
    });
  });
});
