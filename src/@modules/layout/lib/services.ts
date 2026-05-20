import { IBaseResponse, TId } from '@base/interfaces';
import { AxiosSecureInstance } from '@lib/config';
import { responseHandlerFn, Toolbox } from '@lib/utils';

const END_POINT: string = '/layouts';

export const LayoutServices = {
  NAME: END_POINT,

  findById: async (endPoint: string, id: TId): Promise<IBaseResponse<Record<string, any>>> => {
    try {
      const res = await AxiosSecureInstance.get(`/${endPoint}/${id}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  find: async (endPoint: string, options: Record<string, any>): Promise<IBaseResponse<Record<string, any>[]>> => {
    try {
      const res = await AxiosSecureInstance.get(`/${endPoint}?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};
