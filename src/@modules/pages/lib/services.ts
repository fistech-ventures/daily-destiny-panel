import { IBaseResponse, TId } from '@base/interfaces';
import { AxiosSecureInstance } from '@lib/config';
import { responseHandlerFn, Toolbox } from '@lib/utils';
import { IPage, IPageCreate, IPagesFilter, IPagesResponse } from './interfaces';

const END_POINT: string = '/pages';

export const PagesServices = {
  NAME: END_POINT,

  findById: async (id: TId): Promise<IBaseResponse<IPage>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/${id}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  findBySlug: async (slug: string): Promise<IBaseResponse<IPage>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/by-slug/${encodeURIComponent(slug)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  find: async (options: IPagesFilter): Promise<IPagesResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  upsert: async (payload: Partial<IPageCreate>): Promise<IBaseResponse<IPage>> => {
    try {
      const res = await AxiosSecureInstance.post(END_POINT, payload);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  update: async (payload: { id: TId; data: Partial<IPageCreate> }): Promise<IBaseResponse<IPage>> => {
    try {
      const res = await AxiosSecureInstance.patch(`${END_POINT}/${payload.id}`, payload.data);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};
