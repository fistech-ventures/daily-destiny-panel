import { IBaseResponse, TId } from '@base/interfaces';
import { AxiosSecureInstance } from '@lib/config';
import { responseHandlerFn, Toolbox } from '@lib/utils';
import {
  ICategoriesFilter,
  ICategoriesResponse,
  ICategory,
  ICategoryCreate,
  ITagsFilter,
  ITagsResponse,
} from './interfaces';

const END_POINT: string = '/categories';
const TAG_ENDPOINT: string = '/tags';

export const CategoriesServices = {
  NAME: END_POINT,
  TAG_NAME: TAG_ENDPOINT,

  findById: async (id: TId): Promise<IBaseResponse<ICategory>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/${id}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  find: async (options: ICategoriesFilter): Promise<ICategoriesResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  create: async (payload: ICategoryCreate): Promise<IBaseResponse<ICategory>> => {
    try {
      const res = await AxiosSecureInstance.post(END_POINT, Toolbox.toNullifyTraverse(payload));
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  update: async (payload: { id: TId; data: Partial<ICategoryCreate> }): Promise<IBaseResponse<ICategory>> => {
    try {
      const res = await AxiosSecureInstance.patch(`${END_POINT}/${payload.id}`, payload.data);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  findTags: async (options: ITagsFilter): Promise<ITagsResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${TAG_ENDPOINT}?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};
