// Design tokens for the New Horizon mobile app.
// Mirrors the web app's gold / charcoal / ivory brand so the two feel like
// one product. Import from here — never hardcode colors in screens.

export const colors = {
  gold: '#B8975A',
  goldLight: '#D4B07A',
  cream: '#F5F0E8',
  ivory: '#FAF8F4',
  charcoal: '#1C1C1E',
  charcoalSoft: '#26262C',
  slate: '#4A4A52',
  mist: '#E8E4DC',
  white: '#FFFFFF',
  success: '#3D7A5F',
  rose: '#8B4A5A',
  info: '#2C6FAC',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  full: 999,
} as const;

export const type = {
  // Cormorant/serif isn't bundled by default in Expo; system serif keeps the
  // editorial feel without shipping a font file. Swap to a loaded font later.
  display: undefined as undefined | string,
} as const;

export const shadow = {
  card: {
    shadowColor: '#1C1C1E',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
} as const;

/**
 * Apply opacity to a 6-digit hex color, returning an `rgba()` string. Safer
 * than concatenating hex alpha suffixes, which break if a token ever changes
 * format (shorthand hex, rgb, named color, etc.).
 */
export function addAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
