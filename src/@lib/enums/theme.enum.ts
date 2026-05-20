export enum ENUM_THEME_TYPES {
  SYSTEM = 'SYSTEM',
  LIGHT = 'LIGHT',
  DARK = 'DARK',
}

export type TThemeType = `${ENUM_THEME_TYPES}`;

export const themeTypes: TThemeType[] = Object.values(ENUM_THEME_TYPES);
