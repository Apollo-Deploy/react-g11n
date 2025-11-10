/**
 * FormatService - Locale-aware formatting for dates, numbers, and currencies
 * 
 * This service provides formatting utilities using the native Intl API,
 * ensuring proper locale-specific formatting without external dependencies.
 */

import { IFormatService } from "..";
import { DateFormat, TimeFormat, DateTimeFormat, ListFormatType, RangeFormatStyle } from "../types";

/**
 * Preset date/time format configurations
 */
const DATE_FORMATS: Record<string, Intl.DateTimeFormatOptions> = {
  short: { year: 'numeric', month: 'numeric', day: 'numeric' },
  medium: { year: 'numeric', month: 'short', day: 'numeric' },
  long: { year: 'numeric', month: 'long', day: 'numeric' },
  full: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
};

const TIME_FORMATS: Record<string, Intl.DateTimeFormatOptions> = {
  short: { hour: 'numeric', minute: 'numeric' },
  medium: { hour: 'numeric', minute: 'numeric', second: 'numeric' },
  long: { hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' },
  full: { hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'long' },
};

const DATETIME_FORMATS: Record<string, Intl.DateTimeFormatOptions> = {
  short: { 
    year: 'numeric', 
    month: 'numeric', 
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  },
  medium: { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  },
  long: { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short',
  },
  full: { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'long',
  },
};

/**
 * FormatService implementation using Intl API
 */
export class FormatService implements IFormatService {
  private locale: string;

  constructor(locale: string) {
    this.locale = locale;
  }

  /**
   * Update the locale for all formatting operations
   */
  setLocale(locale: string): void {
    this.locale = locale;
  }

  /**
   * Get the current locale
   */
  getLocale(): string {
    return this.locale;
  }

  /**
   * Format a date according to the current locale
   */
  date(date: Date, format: DateFormat = 'medium'): string {
    try {
      const options = this.getDateTimeFormatOptions(format, DATE_FORMATS);
      return new Intl.DateTimeFormat(this.locale, options).format(date);
    } catch (error) {
      // Handle invalid dates gracefully
      return 'Invalid Date';
    }
  }

  /**
   * Format a time according to the current locale
   */
  time(date: Date, format: TimeFormat = 'medium'): string {
    const options = this.getDateTimeFormatOptions(format, TIME_FORMATS);
    return new Intl.DateTimeFormat(this.locale, options).format(date);
  }

  /**
   * Format a date and time according to the current locale
   */
  dateTime(date: Date, format: DateTimeFormat = 'medium'): string {
    const options = this.getDateTimeFormatOptions(format, DATETIME_FORMATS);
    return new Intl.DateTimeFormat(this.locale, options).format(date);
  }

  /**
   * Format relative time (e.g., "2 hours ago", "in 3 days")
   */
  relativeTime(date: Date, baseDate: Date = new Date()): string {
    const diffMs = date.getTime() - baseDate.getTime();
    const { value, unit } = this.getRelativeTimeUnit(diffMs);

    const rtf = new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' });
    return rtf.format(value, unit);
  }

  /**
   * Format a number according to the current locale
   */
  number(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale, options).format(value);
  }

  /**
   * Format a currency value according to the current locale
   */
  currency(
    value: number,
    currency: string,
    options?: Intl.NumberFormatOptions
  ): string {
    const currencyOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency,
      ...options,
    };
    return new Intl.NumberFormat(this.locale, currencyOptions).format(value);
  }

  /**
   * Format a list according to the current locale
   */
  list(items: string[], type: ListFormatType = 'conjunction'): string {
    // Check if ListFormat is available
    if (typeof (Intl as any).ListFormat !== 'undefined') {
      const listFormat = new (Intl as any).ListFormat(this.locale, { 
        style: 'long', 
        type 
      });
      return listFormat.format(items);
    }
    // Fallback for environments without ListFormat
    if (items.length === 0) return '';
    if (items.length === 1) return items[0] || '';
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
  }

  /**
   * Format a unit value according to the current locale
   */
  unit(value: number, unit: string, options?: Intl.NumberFormatOptions): string {
    const unitOptions: Intl.NumberFormatOptions = {
      style: 'unit',
      unit,
      ...options,
    };
    return new Intl.NumberFormat(this.locale, unitOptions).format(value);
  }

  /**
   * Format a percentage according to the current locale
   */
  percentage(
    value: number, 
    options?: { decimals?: number; signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero' }
  ): string {
    const percentOptions: Intl.NumberFormatOptions = {
      style: 'percent',
      minimumFractionDigits: options?.decimals,
      maximumFractionDigits: options?.decimals,
      signDisplay: options?.signDisplay,
    };
    return new Intl.NumberFormat(this.locale, percentOptions).format(value);
  }

  /**
   * Format a date range according to the current locale
   */
  dateRange(startDate: Date, endDate: Date, format: RangeFormatStyle = 'medium'): string {
    const options = this.getRangeFormatOptions(format);
    const formatter = new Intl.DateTimeFormat(this.locale, options) as any;
    
    // Use formatRange if available
    if (typeof formatter.formatRange === 'function') {
      return formatter.formatRange(startDate, endDate);
    }
    
    // Fallback for older browsers
    return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
  }

  /**
   * Format a time range according to the current locale
   */
  timeRange(startDate: Date, endDate: Date, format: RangeFormatStyle = 'medium'): string {
    const options = this.getTimeRangeFormatOptions(format);
    const formatter = new Intl.DateTimeFormat(this.locale, options) as any;
    
    // Use formatRange if available
    if (typeof formatter.formatRange === 'function') {
      return formatter.formatRange(startDate, endDate);
    }
    
    // Fallback for older browsers
    return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
  }

  /**
   * Format a date with timezone information
   */
  dateTimeWithTimezone(date: Date, timezone: string, format: DateTimeFormat = 'medium'): string {
    const options = this.getDateTimeFormatOptions(format, DATETIME_FORMATS);
    const timezoneOptions: Intl.DateTimeFormatOptions = {
      ...options,
      timeZone: timezone,
    };
    return new Intl.DateTimeFormat(this.locale, timezoneOptions).format(date);
  }

  /**
   * Get timezone name
   */
  timezoneName(timezone: string, style: 'short' | 'long' = 'long'): string {
    try {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        timeZoneName: style,
      };
      
      const formatter = new Intl.DateTimeFormat(this.locale, options);
      const parts = formatter.formatToParts(new Date());
      const timezonePart = parts.find(part => part.type === 'timeZoneName');
      
      return timezonePart?.value || timezone;
    } catch (error) {
      // Handle invalid timezone gracefully
      return timezone;
    }
  }

  /**
   * Detect user's timezone
   */
  detectTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /**
   * Get list of common timezones with localized names
   */
  getCommonTimezones(): Array<{ id: string; name: string; shortName: string; offset: number }> {
    const commonTimezones = [
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Anchorage',
      'Pacific/Honolulu',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Moscow',
      'Asia/Dubai',
      'Asia/Kolkata',
      'Asia/Shanghai',
      'Asia/Tokyo',
      'Asia/Seoul',
      'Australia/Sydney',
      'Pacific/Auckland',
    ];

    return commonTimezones.map(tz => {
      const now = new Date();
      const longName = this.timezoneName(tz, 'long');
      const shortName = this.timezoneName(tz, 'short');
      
      // Calculate offset
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'shortOffset',
      });
      
      const parts = formatter.formatToParts(now);
      const offsetPart = parts.find(part => part.type === 'timeZoneName');
      let offset = 0;
      
      if (offsetPart?.value) {
        const match = offsetPart.value.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);
        if (match && match[1] && match[2]) {
          const sign = match[1] === '+' ? 1 : -1;
          const hours = parseInt(match[2], 10);
          const minutes = parseInt(match[3] || '0', 10);
          offset = sign * (hours * 60 + minutes);
        }
      }

      return {
        id: tz,
        name: longName,
        shortName: shortName,
        offset,
      };
    });
  }

  /**
   * Get DateTimeFormat options from format parameter
   */
  private getDateTimeFormatOptions(
    format: DateFormat | TimeFormat | DateTimeFormat,
    presets: Record<string, Intl.DateTimeFormatOptions>
  ): Intl.DateTimeFormatOptions {
    if (typeof format === 'string') {
      return presets[format] ?? presets.medium ?? {};
    }
    return format;
  }

  /**
   * Calculate the appropriate unit and value for relative time formatting
   */
  private getRelativeTimeUnit(diffMs: number): { 
    value: number; 
    unit: Intl.RelativeTimeFormatUnit 
  } {
    const absDiff = Math.abs(diffMs);
    const sign = diffMs < 0 ? -1 : 1;

    // Seconds
    if (absDiff < 60 * 1000) {
      return { value: sign * Math.round(absDiff / 1000), unit: 'second' };
    }

    // Minutes
    if (absDiff < 60 * 60 * 1000) {
      return { value: sign * Math.round(absDiff / (60 * 1000)), unit: 'minute' };
    }

    // Hours
    if (absDiff < 24 * 60 * 60 * 1000) {
      return { value: sign * Math.round(absDiff / (60 * 60 * 1000)), unit: 'hour' };
    }

    // Days
    if (absDiff < 7 * 24 * 60 * 60 * 1000) {
      return { value: sign * Math.round(absDiff / (24 * 60 * 60 * 1000)), unit: 'day' };
    }

    // Weeks
    if (absDiff < 30 * 24 * 60 * 60 * 1000) {
      return { value: sign * Math.round(absDiff / (7 * 24 * 60 * 60 * 1000)), unit: 'week' };
    }

    // Months
    if (absDiff < 365 * 24 * 60 * 60 * 1000) {
      return { value: sign * Math.round(absDiff / (30 * 24 * 60 * 60 * 1000)), unit: 'month' };
    }

    // Years
    return { value: sign * Math.round(absDiff / (365 * 24 * 60 * 60 * 1000)), unit: 'year' };
  }

  /**
   * Get format options for date range formatting
   */
  private getRangeFormatOptions(format: RangeFormatStyle): Intl.DateTimeFormatOptions {
    const presets: Record<RangeFormatStyle, Intl.DateTimeFormatOptions> = {
      short: { year: 'numeric', month: 'numeric', day: 'numeric' },
      medium: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      full: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    };
    return presets[format] || presets.medium;
  }

  /**
   * Get format options for time range formatting
   */
  private getTimeRangeFormatOptions(format: RangeFormatStyle): Intl.DateTimeFormatOptions {
    const presets: Record<RangeFormatStyle, Intl.DateTimeFormatOptions> = {
      short: { hour: 'numeric', minute: 'numeric' },
      medium: { hour: 'numeric', minute: 'numeric', second: 'numeric' },
      long: { hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' },
      full: { hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'long' },
    };
    return presets[format] || presets.medium;
  }
}
