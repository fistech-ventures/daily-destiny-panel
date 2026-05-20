import { IBaseEntity, IBaseFilter, IBaseResponse } from '@base/interfaces';
import { ILayoutCreate } from '@modules/layout/lib/interfaces';

export interface IPagesFilter extends IBaseFilter {}

export interface IPage extends IBaseEntity {
  title: string;
  slug: string;
  layouts: ILayoutCreate;
}

export interface IPagesResponse extends IBaseResponse {
  data: IPage[];
}

export interface IPageCreate {
  title: string;
  slug: string;
  layouts: ILayoutCreate;
  isActive: boolean;
}
