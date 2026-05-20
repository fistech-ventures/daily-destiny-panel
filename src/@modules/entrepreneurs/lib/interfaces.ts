import { IBaseEntity, IBaseFilter, IBaseResponse } from '@base/interfaces';

export interface IEntrepreneursFilter extends IBaseFilter {}

export interface IEntrepreneur extends IBaseEntity {
  name: string;
  image: string;
  designation: string;
}

export interface IEntrepreneursResponse extends IBaseResponse {
  data: IEntrepreneur[];
}

export interface IEntrepreneurCreate {
  name: string;
  image: string;
  designation: string;
  isActive: boolean;
}
