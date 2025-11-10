"use client";

/**
 * React context for i18n system
 * 
 * Provides translation functionality and locale management to React components
 */

import { createContext } from 'react';
import type { I18nContextValue } from '../types';

/**
 * I18n context
 * 
 * This context provides access to:
 * - Translation function (t)
 * - Current locale
 * - Available locales
 * - Locale change function
 * - Loading states
 * - Format service
 * - Configuration
 */
export const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Display name for debugging
 */
I18nContext.displayName = 'I18nContext';
