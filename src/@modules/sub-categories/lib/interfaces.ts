import { IBaseEntity, IBaseFilter, IBaseResponse, TId } from '@base/interfaces';
import { ICategory } from '@modules/categories/lib/interfaces';

export interface ISubCategoriesFilter extends IBaseFilter {
  categoryId?: string | string[];
  categoryIds?: string[];
}

export interface ISubCategory extends IBaseEntity {
  title: string;
  titleBn: string;
  slug: string;
  position: string;
  categoryId: TId;
  category: ICategory;
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
}
