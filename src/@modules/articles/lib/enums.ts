export enum ENUM_ARTICLES_STATUS_TYPES {
  Drafted = 'Drafted',
  Published = 'Published',
  Archived = 'Archived',
}

export type TArticlesStatusType = keyof typeof ENUM_ARTICLES_STATUS_TYPES;
export const articlesStatusTypes = Object.values(ENUM_ARTICLES_STATUS_TYPES);
