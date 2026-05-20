export enum ENUM_LAYOUT_NODE_TYPE {
  ROW = 'ROW',
  COLUMN = 'COLUMN',
  COMPONENT = 'COMPONENT',
}

export type TLayoutNodeType = keyof typeof ENUM_LAYOUT_NODE_TYPE;
export const layoutNodeTypes = Object.values(ENUM_LAYOUT_NODE_TYPE);

export enum ENUM_LAYOUT_BLOCK_MODE_TYPE {
  SINGLE = 'SINGLE',
  MULTIPLE = 'MULTIPLE',
}

export type TLayoutBlockModeType = keyof typeof ENUM_LAYOUT_BLOCK_MODE_TYPE;
export const layoutBlockModeTypes = Object.values(ENUM_LAYOUT_BLOCK_MODE_TYPE);

export enum ENUM_LAYOUT_BLOCK_WRAPPER_VIEW_TYPE {
  NON_SLIDER = 'NON_SLIDER',
  SLIDER = 'SLIDER',
}

export type TLayoutBlockWrapperViewType = keyof typeof ENUM_LAYOUT_BLOCK_WRAPPER_VIEW_TYPE;
export const layoutBlockWrapperViewTypes = Object.values(ENUM_LAYOUT_BLOCK_WRAPPER_VIEW_TYPE);

export enum ENUM_LAYOUT_BLOCK_VIEW_TYPE {
  RECTANGULAR = 'RECTANGULAR',
  SQUARE = 'SQUARE',
}

export type TLayoutBlockViewType = keyof typeof ENUM_LAYOUT_BLOCK_VIEW_TYPE;
export const layoutBlockViewTypes = Object.values(ENUM_LAYOUT_BLOCK_VIEW_TYPE);

export enum ENUM_LAYOUT_BLOCK_ENTITY_TYPE {
  ARTICLE = 'ARTICLE',
  AD = 'AD',
}

export type TLayoutBlockEntityType = keyof typeof ENUM_LAYOUT_BLOCK_ENTITY_TYPE;
export const layoutBlockEntityTypes = Object.values(ENUM_LAYOUT_BLOCK_ENTITY_TYPE);
