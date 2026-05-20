import { IBaseEntity, IBaseResponse } from '@base/interfaces';

export interface IPermissionType extends IBaseEntity {
  title: string;
}

export interface IPermissionTypesResponse extends IBaseResponse {
  data: IPermissionType[];
}

export interface IPermissionTypeCreate {
  title: string;
  isActive: boolean;
}
