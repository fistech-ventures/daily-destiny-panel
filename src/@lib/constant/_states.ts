import { ENUM_THEME_TYPES } from '@lib/enums/theme.enum';

interface IStates {
  [name: string]: {
    key: string;
    initialValue: any;
  };
}

export const States: IStates = {
  theme: {
    key: 'theme',
    initialValue: ENUM_THEME_TYPES.LIGHT,
  },
  headerHeight: {
    key: 'headerHeight',
    initialValue: 0,
  },
  layout: {
    key: 'layout',
    initialValue: [],
  },
  menu: {
    key: 'menu',
    initialValue: {
      openMenuKeys: [],
    },
  },
};
