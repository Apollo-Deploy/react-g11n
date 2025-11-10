/**
 * DocumentService Tests
 * 
 * Tests for document-level language attribute management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DocumentService } from '../../src/core/document-service';

describe('DocumentService', () => {
  let service: DocumentService;
  let originalLang: string | null;
  let originalDir: string | null;

  beforeEach(() => {
    service = new DocumentService();
    // Save original attributes
    originalLang = document.documentElement.getAttribute('lang');
    originalDir = document.documentElement.getAttribute('dir');
  });

  afterEach(() => {
    // Restore original attributes
    if (originalLang !== null) {
      document.documentElement.setAttribute('lang', originalLang);
    } else {
      document.documentElement.removeAttribute('lang');
    }
    
    if (originalDir !== null) {
      document.documentElement.setAttribute('dir', originalDir);
    } else {
      document.documentElement.removeAttribute('dir');
    }
  });

  describe('updateDocumentLanguage', () => {
    it('should update the HTML lang attribute', () => {
      service.updateDocumentLanguage('en');
      expect(document.documentElement.getAttribute('lang')).toBe('en');
    });

    it('should handle locale codes with subtags', () => {
      service.updateDocumentLanguage('en-US');
      expect(document.documentElement.getAttribute('lang')).toBe('en-US');
    });

    it('should handle locale codes with script subtags', () => {
      service.updateDocumentLanguage('zh-Hans');
      expect(document.documentElement.getAttribute('lang')).toBe('zh-Hans');
    });

    it('should handle full locale codes with language, script, and region', () => {
      service.updateDocumentLanguage('zh-Hans-CN');
      expect(document.documentElement.getAttribute('lang')).toBe('zh-Hans-CN');
    });
  });

  describe('updateDocumentDirection', () => {
    it('should update the HTML dir attribute to ltr', () => {
      service.updateDocumentDirection('ltr');
      expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    });

    it('should update the HTML dir attribute to rtl', () => {
      service.updateDocumentDirection('rtl');
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    });
  });

  describe('getDocumentLanguage', () => {
    it('should return the current lang attribute', () => {
      document.documentElement.setAttribute('lang', 'fr');
      expect(service.getDocumentLanguage()).toBe('fr');
    });

    it('should return null if lang attribute is not set', () => {
      document.documentElement.removeAttribute('lang');
      expect(service.getDocumentLanguage()).toBeNull();
    });
  });

  describe('getDocumentDirection', () => {
    it('should return the current dir attribute', () => {
      document.documentElement.setAttribute('dir', 'rtl');
      expect(service.getDocumentDirection()).toBe('rtl');
    });

    it('should return null if dir attribute is not set', () => {
      document.documentElement.removeAttribute('dir');
      expect(service.getDocumentDirection()).toBeNull();
    });
  });

  describe('updateDocumentLocale', () => {
    it('should update both lang and dir for LTR languages', () => {
      service.updateDocumentLocale('en');
      expect(document.documentElement.getAttribute('lang')).toBe('en');
      expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    });

    it('should update both lang and dir for RTL languages', () => {
      service.updateDocumentLocale('ar');
      expect(document.documentElement.getAttribute('lang')).toBe('ar');
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    });

    it('should handle Arabic with region subtag', () => {
      service.updateDocumentLocale('ar-SA');
      expect(document.documentElement.getAttribute('lang')).toBe('ar-SA');
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    });

    it('should handle Hebrew', () => {
      service.updateDocumentLocale('he');
      expect(document.documentElement.getAttribute('lang')).toBe('he');
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    });

    it('should handle Persian/Farsi', () => {
      service.updateDocumentLocale('fa');
      expect(document.documentElement.getAttribute('lang')).toBe('fa');
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    });

    it('should handle Urdu', () => {
      service.updateDocumentLocale('ur');
      expect(document.documentElement.getAttribute('lang')).toBe('ur');
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    });
  });

  describe('parseLocale', () => {
    it('should parse simple language code', () => {
      const result = service.parseLocale('en');
      expect(result).toEqual({
        language: 'en',
        full: 'en',
      });
    });

    it('should parse language with region', () => {
      const result = service.parseLocale('en-US');
      expect(result).toEqual({
        language: 'en',
        region: 'US',
        full: 'en-US',
      });
    });

    it('should parse language with script', () => {
      const result = service.parseLocale('zh-Hans');
      expect(result).toEqual({
        language: 'zh',
        script: 'Hans',
        full: 'zh-Hans',
      });
    });

    it('should parse language with script and region', () => {
      const result = service.parseLocale('zh-Hans-CN');
      expect(result).toEqual({
        language: 'zh',
        script: 'Hans',
        region: 'CN',
        full: 'zh-Hans-CN',
      });
    });

    it('should handle lowercase region codes', () => {
      const result = service.parseLocale('en-us');
      expect(result).toEqual({
        language: 'en',
        region: 'US',
        full: 'en-us',
      });
    });
  });

  describe('isValidLocaleFormat', () => {
    it('should validate simple language codes', () => {
      expect(service.isValidLocaleFormat('en')).toBe(true);
      expect(service.isValidLocaleFormat('fr')).toBe(true);
      expect(service.isValidLocaleFormat('zh')).toBe(true);
    });

    it('should validate language with region', () => {
      expect(service.isValidLocaleFormat('en-US')).toBe(true);
      expect(service.isValidLocaleFormat('fr-FR')).toBe(true);
      expect(service.isValidLocaleFormat('es-MX')).toBe(true);
    });

    it('should validate language with script', () => {
      expect(service.isValidLocaleFormat('zh-Hans')).toBe(true);
      expect(service.isValidLocaleFormat('sr-Cyrl')).toBe(true);
    });

    it('should validate language with script and region', () => {
      expect(service.isValidLocaleFormat('zh-Hans-CN')).toBe(true);
      expect(service.isValidLocaleFormat('sr-Cyrl-RS')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(service.isValidLocaleFormat('')).toBe(false);
      expect(service.isValidLocaleFormat('e')).toBe(false);
      expect(service.isValidLocaleFormat('en-')).toBe(false);
      expect(service.isValidLocaleFormat('en-USA')).toBe(false);
      expect(service.isValidLocaleFormat('123')).toBe(false);
    });
  });

  describe('RTL language detection', () => {
    it('should detect Arabic as RTL', () => {
      service.updateDocumentLocale('ar');
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    });

    it('should detect Hebrew as RTL', () => {
      service.updateDocumentLocale('he');
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    });

    it('should detect Persian as RTL', () => {
      service.updateDocumentLocale('fa');
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    });

    it('should detect Urdu as RTL', () => {
      service.updateDocumentLocale('ur');
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    });

    it('should detect English as LTR', () => {
      service.updateDocumentLocale('en');
      expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    });

    it('should detect French as LTR', () => {
      service.updateDocumentLocale('fr');
      expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    });

    it('should detect Spanish as LTR', () => {
      service.updateDocumentLocale('es');
      expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    });

    it('should detect Chinese as LTR', () => {
      service.updateDocumentLocale('zh');
      expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    });
  });
});
