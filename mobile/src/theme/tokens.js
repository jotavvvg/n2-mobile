export const colors = {
  primary: '#EA1D2C',
  primaryDark: '#C81421',
  primaryLight: '#FEE2E2',
  secondary: '#F59E0B',
  success: '#10B981',
  background: '#F7F7F8',
  surface: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  error: '#EF4444',
  errorBg: '#FEF2F2',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400', color: '#374151', lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  caption: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  price: { fontSize: 16, fontWeight: '700', color: colors.success },
};

export const shadows = {
  card: {
    elevation: 2,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  floating: {
    elevation: 8,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
  },
};
