import { IBaseEntity, IBaseResponse } from '@base/interfaces';

export interface IRole extends IBaseEntity {
  title: string;
}

export interface IRolesResponse extends IBaseResponse {
  data: IRole[];
}

export interface IRoleCreate {
  title: string;
  isActive: boolean;
}
