import { IBaseResponse, TId } from '@base/interfaces';
import { AxiosSecureInstance } from '@lib/config';
import { Toolbox, responseHandlerFn } from '@lib/utils';
import { IBaseServices } from './interfaces';

export const baseServices = <Entity, FilterOptions, CreatePayload, UpdatePayload = CreatePayload>(
  END_POINT: string,
): IBaseServices<Entity, FilterOptions, CreatePayload, UpdatePayload> => {
  const findById = async (id: TId): Promise<IBaseResponse<Entity>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/${id}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  };

  const find = async (options: FilterOptions): Promise<IBaseResponse<Entity[]>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  };

  const create = async (payload: CreatePayload): Promise<IBaseResponse<Entity>> => {
    try {
      const res = await AxiosSecureInstance.post(END_POINT, payload);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  };

  const update = async (payload: { id: TId; data: Partial<UpdatePayload> }): Promise<IBaseResponse<Entity>> => {
    try {
      const res = await AxiosSecureInstance.patch(`${END_POINT}/${payload.id}`, payload.data);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  };

  const del = async (id: TId): Promise<IBaseResponse<Entity>> => {
    try {
      const res = await AxiosSecureInstance.delete(`${END_POINT}/${id}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  };

  return { END_POINT, findById, find, create, update, delete: del };
};
