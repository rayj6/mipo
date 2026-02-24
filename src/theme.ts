/**
 * Mipo – light theme
 */
export const theme = {
  colors: {
    background: '#F5F5F7',
    surface: '#FFFFFF',
    surfaceElevated: '#FAFAFA',
    primary: '#E85D4C',
    primaryDim: 'rgba(232, 93, 76, 0.12)',
    text: '#1D1D1F',
    textSecondary: '#6E6E73',
    textMuted: '#86868B',
    border: '#E5E5EA',
    error: '#FF3B30',
    success: '#34C759',
  },
  radii: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    full: 9999,
  },
  spacing: {
    xs: 6,
    sm: 12,
    md: 18,
    lg: 24,
    xl: 32,
  },
  typography: {
    hero: { fontSize: 40, fontWeight: '800' as const },
    title: { fontSize: 28, fontWeight: '700' as const },
    titleSmall: { fontSize: 20, fontWeight: '700' as const },
    body: { fontSize: 16 },
    bodySmall: { fontSize: 14 },
    caption: { fontSize: 12 },
    button: { fontSize: 17, fontWeight: '600' as const },
  },
};
