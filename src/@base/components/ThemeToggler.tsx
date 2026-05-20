import { ENUM_THEME_TYPES, themeTypes } from '@lib/enums/theme.enum';
import useTheme from '@lib/hooks/useTheme';
import { cn, Toolbox } from '@lib/utils';
import { FaDesktop, FaMoon, FaSun } from 'react-icons/fa';

const themeIcons = {
  [ENUM_THEME_TYPES.SYSTEM]: <FaDesktop className="w-3 h-3" />,
  [ENUM_THEME_TYPES.LIGHT]: <FaSun className="w-3 h-3" />,
  [ENUM_THEME_TYPES.DARK]: <FaMoon className="w-3 h-3" />,
};

interface IProps {
  className?: string;
}

const ThemeToggler: React.FC<IProps> = ({ className }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      className={cn('flex items-center border border-gray-300 rounded-full p-1 w-fit gap-1', className)}
    >
      {themeTypes.map((themeType) => {
        const isActive = theme === themeType;
        const label = Toolbox.toPrettyText(themeType);

        return (
          <button
            key={themeType}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            data-theme-switcher="true"
            data-active={isActive}
            title={label}
            onClick={() => setTheme(themeType)}
            className={`cursor-pointer w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
              isActive
                ? 'bg-gray-700 text-white'
                : 'hover:bg-gray-200 text-gray-800 dark:hover:bg-gray-700 dark:text-white'
            }`}
          >
            {themeIcons[themeType]}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggler;
