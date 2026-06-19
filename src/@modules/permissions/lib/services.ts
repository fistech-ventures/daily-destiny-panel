import { IBaseResponse, TId } from '@base/interfaces';
import { AxiosSecureInstance } from '@lib/config';
import { TPermission } from '@lib/constant';
import { responseHandlerFn, Toolbox } from '@lib/utils';
import { IPermissionCreate, IPermissionsFilter, IPermissionsResponse } from './interfaces';

const END_POINT: string = '/permissions';

export const PermissionsServices = {
  NAME: END_POINT,

  find: async (options: IPermissionsFilter): Promise<IPermissionsResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  create: async (payload: IPermissionCreate): Promise<IPermissionsResponse> => {
    try {
      const res = await AxiosSecureInstance.post(`${END_POINT}`, payload);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  update: async (payload: { id: TId; data: Partial<IPermissionCreate> }): Promise<IPermissionsResponse> => {
    try {
      const res = await AxiosSecureInstance.patch(`${END_POINT}/${payload.id}`, payload.data);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  bulkSync: async (payload: { permissions: TPermission[] }): Promise<IPermissionsResponse> => {
    try {
      const res = await AxiosSecureInstance.post(`${END_POINT}/bulk-sync`, payload);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  delete: async (id: TId): Promise<IBaseResponse<null>> => {
    try {
      const res = await AxiosSecureInstance.delete(`${END_POINT}/${id}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};
