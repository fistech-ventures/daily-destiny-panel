import { IBaseEntity, IBaseFilter, IBaseResponse, ISEOMetaData } from '@base/interfaces';

export interface ICategoriesFilter extends IBaseFilter {}

export interface ICategory extends IBaseEntity {
  title: string;
  titleBn: string;
  slug: string;
  position: number;
  seoMetaData: ISEOMetaData;
}

export interface ICategoriesResponse extends IBaseResponse {
  data: ICategory[];
}

export interface ICategoryCreate {
  title: string;
  titleBn: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  metaImage: string;
  slug: string;
  isActive: boolean;
  position?: number;
}

export interface Itag extends IBaseEntity {
  title: string;
}

export interface ITagsResponse extends IBaseResponse {
  data: Itag[];
}

export interface ITagsFilter extends IBaseFilter {}
