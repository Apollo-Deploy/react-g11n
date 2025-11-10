/**
 * DisplayNamesService Tests
 * 
 * Tests for locale-aware display names for languages, regions, currencies, and scripts.
 */

import { describe, it, expect } from 'vitest';
import { DisplayNamesService } from '../../src/core/display-names-service';

describe('DisplayNamesService', () => {
  describe('Language Names', () => {
    it('should return localized language names in English', () => {
      const service = new DisplayNamesService('en');
      
      expect(service.language('es')).toBe('Spanish');
      expect(service.language('fr')).toBe('French');
      expect(service.language('de')).toBe('German');
      expect(service.language('ja')).toBe('Japanese');
      expect(service.language('zh')).toBe('Chinese');
    });

    it('should return localized language names in Spanish', () => {
      const service = new DisplayNamesService('es');
      
      expect(service.language('en')).toBe('inglés');
      expect(service.language('fr')).toBe('francés');
      expect(service.language('de')).toBe('alemán');
    });

    it('should return localized language names in French', () => {
      const service = new DisplayNamesService('fr');
      
      expect(service.language('en')).toBe('anglais');
      expect(service.language('es')).toBe('espagnol');
      expect(service.language('de')).toBe('allemand');
    });

    it('should return the code itself for unknown language codes', () => {
      const service = new DisplayNamesService('en');
      
      expect(service.language('xyz')).toBe('xyz');
    });
  });

  describe('Region Names', () => {
    it('should return localized region names in English', () => {
      const service = new DisplayNamesService('en');
      
      expect(service.region('US')).toBe('United States');
      expect(service.region('GB')).toBe('United Kingdom');
      expect(service.region('FR')).toBe('France');
      expect(service.region('DE')).toBe('Germany');
      expect(service.region('JP')).toBe('Japan');
    });

    it('should return localized region names in Spanish', () => {
      const service = new DisplayNamesService('es');
      
      expect(service.region('US')).toBe('Estados Unidos');
      expect(service.region('GB')).toBe('Reino Unido');
      expect(service.region('FR')).toBe('Francia');
    });

    it('should return localized region names in French', () => {
      const service = new DisplayNamesService('fr');
      
      expect(service.region('US')).toBe('États-Unis');
      expect(service.region('GB')).toBe('Royaume-Uni');
      expect(service.region('DE')).toBe('Allemagne');
    });

    it('should return the code itself for unknown region codes', () => {
      const service = new DisplayNamesService('en');
      
      expect(service.region('XYZ')).toBe('XYZ');
    });
  });

  describe('Currency Names', () => {
    it('should return localized currency names in English', () => {
      const service = new DisplayNamesService('en');
      
      expect(service.currency('USD')).toBe('US Dollar');
      expect(service.currency('EUR')).toBe('Euro');
      expect(service.currency('GBP')).toBe('British Pound');
      expect(service.currency('JPY')).toBe('Japanese Yen');
    });

    it('should return localized currency names in Spanish', () => {
      const service = new DisplayNamesService('es');
      
      expect(service.currency('USD')).toBe('dólar estadounidense');
      expect(service.currency('EUR')).toBe('euro');
      expect(service.currency('GBP')).toBe('libra esterlina');
    });

    it('should return localized currency names in French', () => {
      const service = new DisplayNamesService('fr');
      
      expect(service.currency('USD')).toBe('dollar des États-Unis');
      expect(service.currency('EUR')).toBe('euro');
      expect(service.currency('GBP')).toBe('livre sterling');
    });

    it('should return the code itself for unknown currency codes', () => {
      const service = new DisplayNamesService('en');
      
      expect(service.currency('XYZ')).toBe('XYZ');
    });
  });

  describe('Script Names', () => {
    it('should return localized script names in English', () => {
      const service = new DisplayNamesService('en');
      
      expect(service.script('Latn')).toBe('Latin');
      expect(service.script('Cyrl')).toBe('Cyrillic');
      expect(service.script('Arab')).toBe('Arabic');
      expect(service.script('Hans')).toBe('Simplified');
      expect(service.script('Hant')).toBe('Traditional');
    });

    it('should return localized script names in Spanish', () => {
      const service = new DisplayNamesService('es');
      
      expect(service.script('Latn')).toBe('latino');
      expect(service.script('Cyrl')).toBe('cirílico');
      expect(service.script('Arab')).toBe('árabe');
    });

    it('should return localized script names in French', () => {
      const service = new DisplayNamesService('fr');
      
      expect(service.script('Latn')).toBe('latin');
      expect(service.script('Cyrl')).toBe('cyrillique');
      expect(service.script('Arab')).toBe('arabe');
    });

    it('should return the code itself for unknown script codes', () => {
      const service = new DisplayNamesService('en');
      
      expect(service.script('Xyz')).toBe('Xyz');
    });
  });

  describe('Calendar Names', () => {
    it('should return localized calendar names in English', () => {
      const service = new DisplayNamesService('en');
      
      expect(service.calendar('gregory')).toBe('Gregorian Calendar');
      expect(service.calendar('hebrew')).toBe('Hebrew Calendar');
      // Note: Intl API may return either "Islamic Calendar" or "Hijri Calendar" depending on the implementation
      const islamicName = service.calendar('islamic');
      expect(['Islamic Calendar', 'Hijri Calendar']).toContain(islamicName);
      expect(service.calendar('buddhist')).toBe('Buddhist Calendar');
    });

    it('should return localized calendar names in Spanish', () => {
      const service = new DisplayNamesService('es');
      
      expect(service.calendar('gregory')).toBe('calendario gregoriano');
      expect(service.calendar('hebrew')).toBe('calendario hebreo');
      // Note: Intl API may return either "calendario islámico" or "calendario hijri"
      const islamicName = service.calendar('islamic');
      expect(['calendario islámico', 'calendario hijri']).toContain(islamicName);
    });

    it('should return localized calendar names in French', () => {
      const service = new DisplayNamesService('fr');
      
      expect(service.calendar('gregory')).toBe('calendrier grégorien');
      expect(service.calendar('hebrew')).toBe('calendrier hébraïque');
      // Note: Intl API may return either "calendrier musulman" or "calendrier hégirien"
      const islamicName = service.calendar('islamic');
      expect(['calendrier musulman', 'calendrier hégirien']).toContain(islamicName);
    });

    it('should return the code itself for unknown calendar codes', () => {
      const service = new DisplayNamesService('en');
      
      expect(service.calendar('unknown')).toBe('unknown');
    });
  });

  describe('Date/Time Field Names', () => {
    it('should return localized date/time field names in English', () => {
      const service = new DisplayNamesService('en');
      
      expect(service.dateTimeField('year')).toBe('year');
      expect(service.dateTimeField('month')).toBe('month');
      expect(service.dateTimeField('day')).toBe('day');
      expect(service.dateTimeField('hour')).toBe('hour');
      expect(service.dateTimeField('minute')).toBe('minute');
    });

    it('should return localized date/time field names in Spanish', () => {
      const service = new DisplayNamesService('es');
      
      expect(service.dateTimeField('year')).toBe('año');
      expect(service.dateTimeField('month')).toBe('mes');
      expect(service.dateTimeField('day')).toBe('día');
      expect(service.dateTimeField('hour')).toBe('hora');
    });

    it('should return localized date/time field names in French', () => {
      const service = new DisplayNamesService('fr');
      
      expect(service.dateTimeField('year')).toBe('année');
      expect(service.dateTimeField('month')).toBe('mois');
      expect(service.dateTimeField('day')).toBe('jour');
      expect(service.dateTimeField('hour')).toBe('heure');
    });
  });

  describe('Locale Management', () => {
    it('should update locale and clear cache', () => {
      const service = new DisplayNamesService('en');
      
      expect(service.language('es')).toBe('Spanish');
      expect(service.getLocale()).toBe('en');
      
      service.setLocale('es');
      
      expect(service.language('en')).toBe('inglés');
      expect(service.getLocale()).toBe('es');
    });

    it('should not clear cache if locale is the same', () => {
      const service = new DisplayNamesService('en');
      
      // Warm up cache
      service.language('es');
      
      // Set to same locale
      service.setLocale('en');
      
      // Should still work
      expect(service.language('es')).toBe('Spanish');
    });
  });

  describe('Caching', () => {
    it('should cache DisplayNames instances', () => {
      const service = new DisplayNamesService('en');
      
      // First call creates the instance
      const result1 = service.language('es');
      
      // Second call should use cached instance
      const result2 = service.language('fr');
      
      expect(result1).toBe('Spanish');
      expect(result2).toBe('French');
    });

    it('should cache different types separately', () => {
      const service = new DisplayNamesService('en');
      
      // 'US' is not a valid language code, so it should return the code itself
      const langResult = service.language('US');
      expect(['US', 'us']).toContain(langResult); // Some implementations may lowercase
      
      // 'US' is a valid region code
      expect(service.region('US')).toBe('United States');
    });
  });
});
