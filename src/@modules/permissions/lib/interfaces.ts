import { IBaseEntity, IBaseFilter, IBaseResponse, TId } from '@base/interfaces';
import { IPermissionType } from '@modules/permission-types/lib/interfaces';

export interface IPermissionsFilter extends IBaseFilter {
  permissionTypeId?: TId;
}

export interface IPermission extends IBaseEntity {
  title: string;
  isAlreadyAdded: boolean;
  permissionType: IPermissionType;
}

export interface IPermissionsResponse extends IBaseResponse {
  data: IPermission[];
}

export interface IPermissionCreate {
  title: string;
  permissionTypeId: TId;
  isActive: boolean;
}
