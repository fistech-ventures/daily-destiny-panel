import { IBaseEntity, IBaseFilter, IBaseResponse, TId } from '@base/interfaces';
import { IAuthor } from '@modules/authors/lib/interfaces';
import { TPollsStatusType } from './enums';

export interface IPollOption extends IBaseEntity {
  title: string;
  position: number;
  voteCount: number;
  votePercentage: string;
}

export interface IPollOptionCreate {
  id?: TId;
  title: string;
  position: number;
}

export interface IPollsFilter extends IBaseFilter {}

export interface IPoll extends IBaseEntity {
  slug: string;
  coverImage: string;
  statement: string;
  position: string;
  details: string;
  language: string;
  status: TPollsStatusType;
  date: string;
  authorId: TId;
  author: IAuthor;
  options: IPollOption[];
}

export interface IPollsResponse extends IBaseResponse {
  data: IPoll[];
}

export interface IPollCreate {
  slug: string;
  coverImage: string;
  statement: string;
  position: string;
  details: string;
  language: string;
  status: TPollsStatusType;
  date: string;
  authorId: TId;
  options: IPollOptionCreate[];
  isActive: boolean;
}
