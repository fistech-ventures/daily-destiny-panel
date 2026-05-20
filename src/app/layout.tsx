import { Providers } from '@lib/context';
import { buildBrandThemeInlineStyle } from '@modules/settings/lib/brandPalette';
import { getCachedQuickSettingsFn } from '@modules/settings/lib/metadata';
import '@styles/index.scss';
import type { Metadata } from 'next';
import { NextFontWithVariable } from 'next/dist/compiled/@next/font';
import { Roboto } from 'next/font/google';
import brandIcon from './brand_icon.png';
import './globals.css';

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-roboto',
});

const defaultMetadataTitle = 'Entrepreneur News';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedQuickSettingsFn();
  const identity = settings?.identity;
  const title = identity?.name?.trim() || defaultMetadataTitle;
  const description = identity?.description?.trim() || undefined;
  const iconUrl = identity?.icon?.trim();

  return {
    title,
    description,
    icons: iconUrl ? { shortcut: iconUrl, icon: iconUrl } : { shortcut: brandIcon.src },
  };
}

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const fontWithMorePropsCreateFn = (fontDefinition: NextFontWithVariable, originalVariableName: string) => {
    return { ...fontDefinition, originalVariableName };
  };

  const robotoFont = fontWithMorePropsCreateFn(roboto, '--font-roboto');

  const settings = await getCachedQuickSettingsFn();
  const primary = settings?.identity?.themePrimaryColor?.trim();
  const secondary = settings?.identity?.themeSecondayColor?.trim();
  const brandHtmlStyle = primary ? buildBrandThemeInlineStyle(primary, secondary) : undefined;

  return (
    <html lang="en" style={brandHtmlStyle}>
      <body className="bg-[var(--color-gray-50)] dark:bg-[var(--color-dark-gray)] designed_scrollbar">
        <Providers brandPrimaryHex={primary} nextFont={[robotoFont]}>
          {children}
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
