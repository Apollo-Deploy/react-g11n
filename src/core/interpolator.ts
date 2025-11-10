/**
 * Interpolator class for variable replacement in translation strings
 * 
 * Handles:
 * - Variable replacement with configurable delimiters
 * - Nested object access using dot notation
 * - HTML escaping for security
 * - Missing variable warnings in development mode
 */

import type { InterpolationConfig } from '../types';

export class Interpolator {
  private readonly prefix: string;
  private readonly suffix: string;
  private readonly escapeValue: boolean;

  constructor(config: InterpolationConfig = {}) {
    this.prefix = config.prefix ?? '{{';
    this.suffix = config.suffix ?? '}}';
    this.escapeValue = config.escapeValue ?? true;
  }

  /**
   * Interpolate variables into a translation template
   * 
   * @param template - The translation string with placeholders
   * @param values - Object containing values to interpolate
   * @returns The interpolated string
   */
  interpolate(template: string, values: Record<string, any> = {}): string {
    if (!template) {
      return template;
    }

    return this.replaceVariables(template, values);
  }

  /**
   * Replace all variable placeholders in the template
   * 
   * @param template - The translation string with placeholders
   * @param values - Object containing values to interpolate
   * @returns The string with variables replaced
   */
  private replaceVariables(template: string, values: Record<string, any>): string {
    const regex = new RegExp(
      `${this.escapeRegex(this.prefix)}\\s*([^${this.escapeRegex(this.suffix)}]+?)\\s*${this.escapeRegex(this.suffix)}`,
      'g'
    );

    const missingVariables: string[] = [];

    const result = template.replace(regex, (match, variablePath: string) => {
      const trimmedPath = variablePath.trim();
      const value = this.resolveNestedValue(values, trimmedPath);

      if (value === undefined || value === null) {
        missingVariables.push(trimmedPath);
        // Return the original placeholder if value is missing
        return match;
      }

      const stringValue = String(value);
      return this.escapeValue ? this.escapeHtml(stringValue) : stringValue;
    });

    // Log warnings in development mode for missing variables
    if (missingVariables.length > 0 && process.env.NODE_ENV !== 'production') {
      console.warn(
        `[i18n] Missing interpolation values: ${missingVariables.join(', ')}`
      );
    }

    return result;
  }

  /**
   * Resolve a nested value from an object using dot notation
   * 
   * @param obj - The object to traverse
   * @param path - The dot-notation path (e.g., 'user.name')
   * @returns The resolved value or undefined if not found
   */
  private resolveNestedValue(obj: Record<string, any>, path: string): any {
    if (!path) {
      return undefined;
    }

    const keys = path.split('.');
    let current: any = obj;

    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }

      if (typeof current !== 'object') {
        return undefined;
      }

      current = current[key];
    }

    return current;
  }

  /**
   * Escape HTML special characters to prevent XSS attacks
   * 
   * @param value - The string to escape
   * @returns The escaped string
   */
  private escapeHtml(value: string): string {
    const htmlEscapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
    };

    return value.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
  }

  /**
   * Escape special regex characters in a string
   * 
   * @param str - The string to escape
   * @returns The escaped string safe for use in regex
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
