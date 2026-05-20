export enum ENUM_POLLS_STATUS_TYPES {
  Drafted = 'Drafted',
  Published = 'Published',
  Archived = 'Archived',
}

export type TPollsStatusType = keyof typeof ENUM_POLLS_STATUS_TYPES;
export const pollsStatusTypes = Object.values(ENUM_POLLS_STATUS_TYPES);
