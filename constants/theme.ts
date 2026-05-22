/**
 * Centralized theme values. Keep them small and opinionated so screens
 * stay visually consistent without each component reinventing the palette.
 */
export const colors = {
  // Brand
  primary: '#FF6B6B',
  primaryDark: '#E85555',
  accent: '#FFD93D',

  // Swipe affordances
  like: '#4ECDC4',
  nope: '#FF6B6B',

  // Neutrals
  background: '#FFFFFF',
  surface: '#F8F8FA',
  border: '#ECECF0',
  text: '#1F1F23',
  textMuted: '#6B6B73',
  textInverse: '#FFFFFF',

  // Overlay
  scrim: 'rgba(0, 0, 0, 0.55)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
} as const;

export const typography = {
  display: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontSize: 24, fontWeight: '700' as const },
  heading: { fontSize: 20, fontWeight: '700' as const },
  subheading: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '500' as const },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
};
