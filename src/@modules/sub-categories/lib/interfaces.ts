import { IBaseEntity, IBaseFilter, IBaseResponse, ISEOMetaData, TId } from '@base/interfaces';
import { ICategory } from '@modules/categories/lib/interfaces';

export interface ISubCategoriesFilter extends IBaseFilter {
  categoryId?: string;
}

export interface ISubCategory extends IBaseEntity {
  title: string;
  titleBn: string;
  slug: string;
  position: string;
  categoryId: TId;
  category: ICategory;
  seoMetaData: ISEOMetaData;
}

export interface ISubCategoriesResponse extends IBaseResponse {
  data: ISubCategory[];
}

export interface ISubCategoryCreate {
  title: string;
  titleBn: string;
  slug: string;
  position: string;
  categoryId: TId;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  metaImage: string;
}
