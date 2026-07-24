import { IBaseResponse, TId } from '@base/interfaces';
import { AxiosSecureInstance, AxiosInstance } from '@lib/config';
import { ENUM_API_SCOPE_TYPES } from '@lib/interfaces/apiScope.interface';
import { responseHandlerFn, Toolbox } from '@lib/utils';
import { IAd, IAdCreate, IAdsFilter, IAdsResponse } from './interfaces';

const INTERNAL_END_POINT: string = '/ads';
const WEB_END_POINT: string = '/ads';

export const AdsServices = {
  NAME: INTERNAL_END_POINT,

  findById: async (id: TId): Promise<IBaseResponse<IAd>> => {
    try {
      const res = await AxiosSecureInstance.get(`${INTERNAL_END_POINT}/${id}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  find: async (options: IAdsFilter): Promise<IAdsResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${INTERNAL_END_POINT}?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  create: async (payload: IAdCreate): Promise<IBaseResponse<IAd>> => {
    try {
      const res = await AxiosSecureInstance.post(INTERNAL_END_POINT, Toolbox.toNullifyTraverse(payload));
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  update: async (payload: { id: TId; data: Partial<IAdCreate> }): Promise<IBaseResponse<IAd>> => {
    try {
      const res = await AxiosSecureInstance.patch(`${INTERNAL_END_POINT}/${payload.id}`, payload.data);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  delete: async (id: TId): Promise<IBaseResponse<null>> => {
    try {
      const res = await AxiosSecureInstance.delete(`${INTERNAL_END_POINT}/${id}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};

export const WebAdsServices = {
  NAME: WEB_END_POINT,

  find: async (options: IAdsFilter): Promise<IAdsResponse> => {
    try {
      const res = await AxiosInstance.get(WEB_END_POINT, {
        params: options,
        scope: ENUM_API_SCOPE_TYPES.WEB,
      });
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  findById: async (id: TId): Promise<IBaseResponse<IAd>> => {
    try {
      const res = await AxiosInstance.get(`${WEB_END_POINT}/${id}`, {
        scope: ENUM_API_SCOPE_TYPES.WEB,
      });
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};
