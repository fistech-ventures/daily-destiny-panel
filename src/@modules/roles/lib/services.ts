import { IBaseFilter, IBaseResponse, TId } from '@base/interfaces';
import { AxiosSecureInstance } from '@lib/config';
import { responseHandlerFn, Toolbox } from '@lib/utils';
import { IPermissionsResponse } from '../../permissions/lib/interfaces';
import { IRole, IRoleCreate, IRolesResponse } from './interfaces';

const END_POINT: string = '/roles';

export const RolesServices = {
  NAME: END_POINT,

  findById: async (id: TId): Promise<IBaseResponse<IRole>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/${id}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  find: async (options: IBaseFilter): Promise<IRolesResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  findSpecifics: async (payload: TId[]): Promise<IRolesResponse> => {
    try {
      const res = await AxiosSecureInstance.post(`${END_POINT}/bulk-by-ids`, { ids: payload });
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  create: async (payload: IRoleCreate): Promise<IRolesResponse> => {
    try {
      const res = await AxiosSecureInstance.post(`${END_POINT}`, payload);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  update: async (payload: { id: TId; data: Partial<IRoleCreate> }): Promise<IRolesResponse> => {
    try {
      const res = await AxiosSecureInstance.patch(`${END_POINT}/${payload.id}`, payload.data);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  findAvailablePermissionsById: async (id: TId): Promise<IPermissionsResponse> => {
    try {
      const res = await AxiosSecureInstance.get(
        `${END_POINT}/${id}/available-permissions?${Toolbox.queryNormalizer({ page: 1, limit: 300 })}`,
      );
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  addPermissionsById: async (payload: { id: TId; permissions: TId[] }): Promise<IPermissionsResponse> => {
    try {
      const res = await AxiosSecureInstance.post(`${END_POINT}/${payload.id}/add-permissions`, {
        permissions: payload.permissions,
      });
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  removePermissionsById: async (payload: { id: TId; permissions: TId[] }): Promise<IPermissionsResponse> => {
    try {
      const res = await AxiosSecureInstance.delete(`${END_POINT}/${payload.id}/remove-permissions`, {
        data: { permissions: payload.permissions },
      });
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};
