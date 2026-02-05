import { Platform } from 'react-native';

export const COLORS = {
  // Backgrounds
  bg: '#000000',
  bgCard: '#0d1117',
  bgCardBorder: '#1a2332',
  bgElevated: '#161b22',

  // Primary accent (cyan/blue AI feel)
  accent: '#00D4FF',
  accentDim: '#007AFF',
  accentGlow: 'rgba(0, 212, 255, 0.15)',

  // Gradients
  gradientStart: '#00D4FF',
  gradientEnd: '#007AFF',

  // Status colors
  success: '#34C759',
  error: '#FF453A',
  warning: '#FFD60A',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8B949E',
  textMuted: '#484F58',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FONT = {
  mono: Platform.select({ ios: 'Menlo', default: 'monospace' }),
};
