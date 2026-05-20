import { States } from '@lib/constant';
import { ENUM_THEME_TYPES, TThemeType } from '@lib/enums/theme.enum';
import { useEffect, useMemo, useState } from 'react';
import useIndexedDBState from './useIndexedDBState';

const useTheme = () => {
  const [isClient, setClient] = useState(false);
  const [theme, setTheme] = useIndexedDBState<TThemeType>(States.theme);
  const [systemTheme, setSystemTheme] = useState<Exclude<TThemeType, ENUM_THEME_TYPES.SYSTEM>>(ENUM_THEME_TYPES.LIGHT);

  const resolvedTheme: TThemeType = useMemo(() => {
    return theme === ENUM_THEME_TYPES.SYSTEM ? systemTheme : theme;
  }, [theme, systemTheme]);

  const handleToggleThemeFn = () => {
    const nextTheme = resolvedTheme === ENUM_THEME_TYPES.DARK ? ENUM_THEME_TYPES.LIGHT : ENUM_THEME_TYPES.DARK;
    setTheme(nextTheme);
  };

  const handleApplyThemeFn = (theme: TThemeType, systemThemeValue?: Exclude<TThemeType, ENUM_THEME_TYPES.SYSTEM>) => {
    if (!isClient) return;

    const sanitizedTheme = theme === ENUM_THEME_TYPES.SYSTEM ? systemThemeValue || systemTheme : theme;

    document.documentElement.setAttribute('data-theme', sanitizedTheme.toLowerCase());
    document.documentElement.classList.toggle('dark', sanitizedTheme === ENUM_THEME_TYPES.DARK);
  };

  const handleChangeSystemThemeFn = () => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const newTheme = media.matches ? ENUM_THEME_TYPES.DARK : ENUM_THEME_TYPES.LIGHT;

    setSystemTheme(newTheme);

    if (theme === ENUM_THEME_TYPES.SYSTEM) handleApplyThemeFn(ENUM_THEME_TYPES.SYSTEM, newTheme);
  };

  useEffect(() => {
    setClient(true);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const currentSystemTheme = media.matches ? ENUM_THEME_TYPES.DARK : ENUM_THEME_TYPES.LIGHT;

    setSystemTheme(currentSystemTheme);

    media.addEventListener('change', handleChangeSystemThemeFn);
    return () => media.removeEventListener('change', handleChangeSystemThemeFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  useEffect(() => {
    if (isClient) handleApplyThemeFn(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, isClient]);

  return {
    isLight: resolvedTheme !== ENUM_THEME_TYPES.DARK,
    isDark: resolvedTheme === ENUM_THEME_TYPES.DARK,
    theme,
    setTheme,
    handleToggleThemeFn,
  };
};

export default useTheme;
