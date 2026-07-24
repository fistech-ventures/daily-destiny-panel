export enum ENUM_ADS_TYPES {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  EMBEDDED = 'EMBEDDED',
  ANIMATION = 'ANIMATION',
}

export type TAdsType = keyof typeof ENUM_ADS_TYPES;
export const adsTypes = Object.values(ENUM_ADS_TYPES);
