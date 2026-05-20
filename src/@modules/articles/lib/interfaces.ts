import { IBaseEntity, IBaseFilter, IBaseResponse, TId } from '@base/interfaces';
import { IAuthor } from '@modules/authors/lib/interfaces';
import { ICategory } from '@modules/categories/lib/interfaces';
import { ISubCategory } from '@modules/sub-categories/lib/interfaces';
import { TArticlesStatusType } from './enums';
import { IUser } from '@modules/users/lib/interfaces';

export interface IArticlesFilter extends IBaseFilter {
  isExclusive?: boolean;
  type?: string;
  status?: string;
  isFeatured?: boolean;
  categoryId?: TId;
  authorId?: TId;
  createdById?: TId;
  updatedById?: TId;
  publishedById?: TId;
  subCategoryId?: TId;
}

export interface IMedia {
  title?: string;
  caption?: string;
  credit?: string;
  altText?: string;
  url?: string;
  key?: string;
  source?: string;
  mimetype?: string;
  extension?: string;
}

export interface ISeoMetaData {
  title: string;
  description: string;
  keywords: string[];
  image: string;
}
export interface IArticle extends IBaseEntity {
  slug: string;
  coverImage: string;
  type: string;
  title: string;
  code: string;
  position: string;
  excerpt: string;
  details: string;
  language: string;
  status: TArticlesStatusType;
  date: string;
  isExclusive: boolean;
  isFeatured: boolean;
  authorId: TId;
  author: IAuthor;
  categoryId: TId;
  category: ICategory;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  subCategoryId?: TId;
  subCategory?: ISubCategory;
  medias?: IMedia[];
  publishedBy: IUser;
  createdBy: IUser;
  updatedBy: IUser;
  seoMetaData: ISeoMetaData;
}

export interface IArticlesResponse extends IBaseResponse {
  data: IArticle[];
}

export interface IArticleCreate {
  slug: string;
  coverImage: string;
  type: string;
  title: string;
  excerpt: string;
  details: string;
  language: string;
  status: TArticlesStatusType;
  position: number;
  date: string;
  isExclusive: boolean;
  isFeatured: boolean;
  authorId: TId;
  categoryId: TId;
  subCategoryId?: TId;
  isActive: boolean;
  medias?: IMedia[];
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  coverImageCredit: string;
  seoMetaData: ISeoMetaData;
}
