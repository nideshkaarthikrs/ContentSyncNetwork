export const lightColors = {
  astrologyPrimary: '#7C3AED',
  matrimonyPrimary: '#E11D48',
  weddingPrimary: '#EA580C',
  primary: '#7C3AED',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  success: '#16A34A',
  danger: '#DC2626'
};

export const darkColors: typeof lightColors = {
  astrologyPrimary: '#A78BFA',
  matrimonyPrimary: '#FB7185',
  weddingPrimary: '#FB923C',
  primary: '#A78BFA',
  background: '#0F172A',
  surface: '#1E293B',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  border: '#334155',
  success: '#4ADE80',
  danger: '#F87171'
};

export type Theme = {
  colors: typeof lightColors;
  roundness: number;
  dark: boolean;
};

export const lightTheme: Theme = {
  colors: lightColors,
  roundness: 18,
  dark: false
};

export const darkTheme: Theme = {
  colors: darkColors,
  roundness: 18,
  dark: true
};
