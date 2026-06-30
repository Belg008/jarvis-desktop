export interface AccentPreset {
  key: string;
  label: string;
  hex: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { key: 'bla', label: 'BLÅ', hex: '#38e0ff' },
  { key: 'oransje', label: 'ORANSJE', hex: '#ff9d2e' },
  { key: 'rod', label: 'RØD', hex: '#ff4d4d' },
  { key: 'gull', label: 'GULL', hex: '#ffc24a' },
  { key: 'lilla', label: 'LILLA', hex: '#b56aff' },
  { key: 'gronn', label: 'GRØNN', hex: '#4ade80' },
];

export const DEFAULT_ACCENT = ACCENT_PRESETS[0].hex;
export const DEFAULT_CUSTOM = '#9b6cff';
