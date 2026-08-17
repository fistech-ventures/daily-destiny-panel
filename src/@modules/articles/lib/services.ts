import { IBaseResponse, TId } from '@base/interfaces';
import { AxiosSecureInstance, AxiosInstance } from '@lib/config';
import { ENUM_API_SCOPE_TYPES } from '@lib/interfaces/apiScope.interface';
import { responseHandlerFn, Toolbox } from '@lib/utils';
import { IArticle, IArticleCreate, IArticlesFilter, IArticlesResponse } from './interfaces';

const END_POINT: string = '/articles';

export const ArticlesServices = {
  NAME: END_POINT,

  findById: async (id: TId): Promise<IBaseResponse<IArticle>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/${id}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  // Fetch an article by its numeric code via the public web API. Used to
  // resolve embedded article links in the article body preview.
  findByCode: async (code: string): Promise<IBaseResponse<IArticle>> => {
    try {
      const res = await AxiosInstance.get(`${END_POINT}/by-code/${code}`, {
        scope: ENUM_API_SCOPE_TYPES.WEB,
      });
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  find: async (options: IArticlesFilter): Promise<IArticlesResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  create: async (payload: IArticleCreate): Promise<IBaseResponse<IArticle>> => {
    try {
      const res = await AxiosSecureInstance.post(END_POINT, Toolbox.toNullifyTraverse(payload));
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  update: async (payload: { id: TId; data: Partial<IArticleCreate> }): Promise<IBaseResponse<IArticle>> => {
    try {
      const res = await AxiosSecureInstance.patch(`${END_POINT}/${payload.id}`, payload.data);
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
