import { IBaseEntity, IBaseFilter, IBaseResponse } from '@base/interfaces';

export interface IMenusFilter extends IBaseFilter {}

export interface IMenu extends IBaseEntity {
  slug: string;
  externalUrl: string;
  title: string;
  position: string;
  language: string;
}

export interface IMenusResponse extends IBaseResponse {
  data: IMenu[];
}

export interface IMenuCreate {
  slug: string;
  externalUrl: string;
  title: string;
  position: string;
  language: string;
  isActive: boolean;
}
