import { IBaseEntity, IBaseFilter, IBaseResponse, TId } from '@base/interfaces';
import { IArticle } from '@modules/articles/lib/interfaces';

export interface ISpecialEvent extends IBaseEntity {
  title: string;
  slug: string;
  bannerImage?: string;
  articles: IArticle[];
}

export interface ISpecialEventsFilter extends IBaseFilter {
  title?: string;
}

export interface ISpecialEventsResponse extends IBaseResponse {
  data: ISpecialEvent[];
}

export interface ISpecialEventCreate {
  title: string;
  slug?: string;
  bannerImage?: string;
  isActive?: boolean;
  articleIds?: TId[];
}

export type ISpecialEventUpdate = Partial<ISpecialEventCreate>;
