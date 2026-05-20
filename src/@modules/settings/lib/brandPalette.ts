import { generate } from '@ant-design/colors';
import type { CSSProperties } from 'react';

const PRIMARY_STEPS = ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;

/** Maps 11 named steps to 10 generated palette entries (Ant Design palette layout). */
const PRIMARY_STEP_TO_PALETTE_INDEX: Record<(typeof PRIMARY_STEPS)[number], number> = {
  '25': 0,
  '50': 1,
  '100': 2,
  '200': 3,
  '300': 4,
  '400': 4,
  '500': 5,
  '600': 6,
  '700': 7,
  '800': 8,
  '900': 9,
};

function paletteToCssVars(prefix: '--color-primary' | '--color-secondary', hex: string): Record<string, string> {
  const palette = generate(hex);
  const vars: Record<string, string> = {};

  for (const step of PRIMARY_STEPS) {
    const i = PRIMARY_STEP_TO_PALETTE_INDEX[step];
    vars[`${prefix}-${step}`] = palette[i];
  }

  vars[prefix] = vars[`${prefix}-500`];
  return vars;
}

/** Inline style for `<html>` so Tailwind / `var(--color-primary-*)` match global identity colors. */
export function buildBrandThemeInlineStyle(primaryHex: string, secondaryHex?: string): CSSProperties | undefined {
  try {
    return {
      ...paletteToCssVars('--color-primary', primaryHex),
      ...(secondaryHex?.trim() ? paletteToCssVars('--color-secondary', secondaryHex.trim()) : {}),
    } as CSSProperties;
  } catch {
    return undefined;
  }
}
