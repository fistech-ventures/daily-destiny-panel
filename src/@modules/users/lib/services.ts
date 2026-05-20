import { IBaseResponse, TId } from '@base/interfaces';
import { AxiosSecureInstance } from '@lib/config';
import { responseHandlerFn, Toolbox } from '@lib/utils';
import { IUser, IUserCreate, IUsersFilter, IUsersResponse } from './interfaces';

const END_POINT: string = '/users';

export const UsersServices = {
  NAME: END_POINT,

  findById: async (id: TId): Promise<IBaseResponse<IUser>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/${id}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  find: async (options: IUsersFilter): Promise<IUsersResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  create: async (payload: IUserCreate): Promise<IBaseResponse<IUser>> => {
    try {
      const res = await AxiosSecureInstance.post(END_POINT, Toolbox.toNullifyTraverse(payload));
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  update: async (payload: { id: TId; data: Partial<IUserCreate> }): Promise<IBaseResponse<IUser>> => {
    try {
      const res = await AxiosSecureInstance.patch(`${END_POINT}/${payload.id}`, {
        ...Toolbox.toNullifyTraverse(payload.data),
        password: payload.data.password,
      });
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  generateRegistrationLink: async (): Promise<IBaseResponse<{ hash: string }>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/generate-registration-link`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};
