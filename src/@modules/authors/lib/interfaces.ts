import { IBaseEntity, IBaseFilter, IBaseResponse } from '@base/interfaces';

export interface IAuthorsFilter extends IBaseFilter {}

export interface IAuthor extends IBaseEntity {
  name: string;
  nameBn: string;
  image: string;
  designation: string;
  designationBn: string;
}

export interface IAuthorsResponse extends IBaseResponse {
  data: IAuthor[];
}

export interface IAuthorCreate {
  name: string;
  nameBn: string;
  image: string;
  designation: string;
  designationBn: string;
  isActive: boolean;
}
