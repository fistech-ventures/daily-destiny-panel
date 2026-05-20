import { IBaseEntity, IBaseFilter, IBaseResponse } from '@base/interfaces';

export interface ITag extends IBaseEntity {
  title: string;
}

export interface ITagsResponse extends IBaseResponse {
  data: ITag[];
}

export interface ITagsFilter extends IBaseFilter {
  searchTerm?: string;
}

export interface ITagCreate {
  title: string;
  isActive: boolean;
}

export interface ITagUpdate {
  title?: string;
  isActive?: boolean;
}
