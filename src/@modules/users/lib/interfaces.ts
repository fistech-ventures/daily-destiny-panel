import { IBaseEntity, IBaseFilter, IBaseResponse, TId } from '@base/interfaces';
import { IRole } from '@modules/roles/lib/interfaces';

export interface IUsersFilter extends IBaseFilter {}

export interface IUser extends IBaseEntity {
  avatar: string;
  username: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  roles: IRole[];
}

export interface IUsersResponse extends IBaseResponse {
  data: IUser[];
}

export interface IUserCreate {
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber: string;
  email: string;
  roles: { role?: TId; isDeleted?: boolean }[];
  isActive: boolean;
}
