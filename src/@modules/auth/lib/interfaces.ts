import { IBaseResponse, TId } from '@base/interfaces';
import { TPermission, TRole } from '@lib/constant';

export interface IToken {
  user: {
    id: TId;
    fullName: string;
    email: string;
    phoneNumber: string;
    roles: TRole[];
  };
  iat: number;
  exp: number;
}

export interface IPermissionToken {
  permissions: TPermission[];
  iat: number;
  exp: number;
}

export interface ISignIn {
  identifier: string;
  password: string;
}

export interface ISignInSession {
  accessToken: string;
  permissionToken: string;
  refreshToken: string;
}

export interface ISignInResponse extends IBaseResponse {
  data: ISignInSession;
}

export interface ISession {
  isLoading: boolean;
  isAuthenticate: boolean;
  user: IToken['user'];
  token: string;
  permissionToken: string;
}
