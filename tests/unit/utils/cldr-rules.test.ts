/**
 * CLDR Rules Tests
 * 
 * Tests for CLDR pluralization rules
 */

import { describe, it, expect } from 'vitest';
import {
  getPluralForm,
  hasPluralForm,
  getPluralForms,
} from '../../../src/utils/cldr-rules';

describe('CLDR Rules', () => {
  describe('English cardinal rules', () => {
    it('should return "one" for count 1', () => {
      const result = getPluralForm('en', 1);
      expect(result).toBe('one');
    });

    it('should return "other" for count 0', () => {
      const result = getPluralForm('en', 0);
      expect(result).toBe('other');
    });

    it('should return "other" for count 2', () => {
      const result = getPluralForm('en', 2);
      expect(result).toBe('other');
    });

    it('should return "other" for large numbers', () => {
      expect(getPluralForm('en', 100)).toBe('other');
      expect(getPluralForm('en', 999)).toBe('other');
    });
  });

  describe('English ordinal rules', () => {
    it('should return "one" for 1st, 21st, 31st', () => {
      expect(getPluralForm('en', 1, true)).toBe('one');
      expect(getPluralForm('en', 21, true)).toBe('one');
      expect(getPluralForm('en', 31, true)).toBe('one');
      expect(getPluralForm('en', 101, true)).toBe('one');
    });

    it('should return "two" for 2nd, 22nd, 32nd', () => {
      expect(getPluralForm('en', 2, true)).toBe('two');
      expect(getPluralForm('en', 22, true)).toBe('two');
      expect(getPluralForm('en', 32, true)).toBe('two');
      expect(getPluralForm('en', 102, true)).toBe('two');
    });

    it('should return "few" for 3rd, 23rd, 33rd', () => {
      expect(getPluralForm('en', 3, true)).toBe('few');
      expect(getPluralForm('en', 23, true)).toBe('few');
      expect(getPluralForm('en', 33, true)).toBe('few');
      expect(getPluralForm('en', 103, true)).toBe('few');
    });

    it('should return "other" for 4th, 5th, 11th, 12th, 13th', () => {
      expect(getPluralForm('en', 4, true)).toBe('other');
      expect(getPluralForm('en', 5, true)).toBe('other');
      expect(getPluralForm('en', 11, true)).toBe('other');
      expect(getPluralForm('en', 12, true)).toBe('other');
      expect(getPluralForm('en', 13, true)).toBe('other');
    });
  });

  describe('Spanish cardinal rules', () => {
    it('should return "one" for count 1', () => {
      const result = getPluralForm('es', 1);
      expect(result).toBe('one');
    });

    it('should return "other" for count 0', () => {
      const result = getPluralForm('es', 0);
      expect(result).toBe('other');
    });

    it('should return "other" for count 2 and above', () => {
      expect(getPluralForm('es', 2)).toBe('other');
      expect(getPluralForm('es', 5)).toBe('other');
      expect(getPluralForm('es', 100)).toBe('other');
    });
  });

  describe('French cardinal rules', () => {
    it('should return "one" for count 0', () => {
      const result = getPluralForm('fr', 0);
      expect(result).toBe('one');
    });

    it('should return "one" for count 1', () => {
      const result = getPluralForm('fr', 1);
      expect(result).toBe('one');
    });

    it('should return "other" for count 2 and above', () => {
      expect(getPluralForm('fr', 2)).toBe('other');
      expect(getPluralForm('fr', 5)).toBe('other');
      expect(getPluralForm('fr', 100)).toBe('other');
    });
  });

  describe('Arabic cardinal rules', () => {
    it('should return "zero" for count 0', () => {
      const result = getPluralForm('ar', 0);
      expect(result).toBe('zero');
    });

    it('should return "one" for count 1', () => {
      const result = getPluralForm('ar', 1);
      expect(result).toBe('one');
    });

    it('should return "two" for count 2', () => {
      const result = getPluralForm('ar', 2);
      expect(result).toBe('two');
    });

    it('should return "few" for counts 3-10', () => {
      expect(getPluralForm('ar', 3)).toBe('few');
      expect(getPluralForm('ar', 5)).toBe('few');
      expect(getPluralForm('ar', 10)).toBe('few');
    });

    it('should return "many" for counts 11-99', () => {
      expect(getPluralForm('ar', 11)).toBe('many');
      expect(getPluralForm('ar', 50)).toBe('many');
      expect(getPluralForm('ar', 99)).toBe('many');
    });

    it('should return "other" for counts 100+', () => {
      expect(getPluralForm('ar', 100)).toBe('other');
      expect(getPluralForm('ar', 200)).toBe('other');
      expect(getPluralForm('ar', 1000)).toBe('other');
    });
  });

  describe('plural form detection', () => {
    it('should detect that English has "one" form', () => {
      const result = hasPluralForm('en', 'one');
      expect(result).toBe(true);
    });

    it('should detect that English has "other" form', () => {
      const result = hasPluralForm('en', 'other');
      expect(result).toBe(true);
    });

    it('should detect that English does not have "zero" form', () => {
      const result = hasPluralForm('en', 'zero');
      expect(result).toBe(false);
    });

    it('should detect that Arabic has "zero" form', () => {
      const result = hasPluralForm('ar', 'zero');
      expect(result).toBe(true);
    });
  });

  describe('available plural forms enumeration', () => {
    it('should return all forms for English cardinal', () => {
      const forms = getPluralForms('en');
      expect(forms).toContain('one');
      expect(forms).toContain('other');
      expect(forms.length).toBe(2);
    });

    it('should return all forms for English ordinal', () => {
      const forms = getPluralForms('en', true);
      expect(forms).toContain('one');
      expect(forms).toContain('two');
      expect(forms).toContain('few');
      expect(forms).toContain('other');
      expect(forms.length).toBe(4);
    });

    it('should return all forms for Arabic cardinal', () => {
      const forms = getPluralForms('ar');
      expect(forms).toContain('zero');
      expect(forms).toContain('one');
      expect(forms).toContain('two');
      expect(forms).toContain('few');
      expect(forms).toContain('many');
      expect(forms).toContain('other');
      expect(forms.length).toBe(6);
    });
  });

  describe('fallback to English rules', () => {
    it('should use English rules for unknown locale', () => {
      const result = getPluralForm('unknown', 1);
      expect(result).toBe('one');
    });

    it('should use English rules for empty locale', () => {
      const result = getPluralForm('', 1);
      expect(result).toBe('one');
    });

    it('should normalize locale and find rules', () => {
      const result = getPluralForm('en-US', 1);
      expect(result).toBe('one');
    });
  });

  describe('edge cases', () => {
    it('should handle boundary value 0', () => {
      expect(getPluralForm('en', 0)).toBe('other');
      expect(getPluralForm('fr', 0)).toBe('one');
      expect(getPluralForm('ar', 0)).toBe('zero');
    });

    it('should handle boundary value 1', () => {
      expect(getPluralForm('en', 1)).toBe('one');
      expect(getPluralForm('es', 1)).toBe('one');
      expect(getPluralForm('fr', 1)).toBe('one');
    });

    it('should handle boundary value 2', () => {
      expect(getPluralForm('en', 2)).toBe('other');
      expect(getPluralForm('ar', 2)).toBe('two');
    });

    it('should handle boundary values for Arabic few/many', () => {
      expect(getPluralForm('ar', 3)).toBe('few');
      expect(getPluralForm('ar', 10)).toBe('few');
      expect(getPluralForm('ar', 11)).toBe('many');
      expect(getPluralForm('ar', 99)).toBe('many');
      expect(getPluralForm('ar', 100)).toBe('other');
    });
  });
});
