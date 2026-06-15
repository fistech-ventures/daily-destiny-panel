import { IBaseResponse, TId } from '@base/interfaces';
import { AxiosSecureInstance } from '@lib/config';
import { responseHandlerFn, Toolbox } from '@lib/utils';
import {
  ILocation,
  ILocationCreate,
  ILocationSeedPayload,
  ILocationUpdate,
  ILocationsFilter,
  ILocationsResponse,
} from './interfaces';

const END_POINT: string = '/locations';

export const LocationsServices = {
  NAME: END_POINT,

  findById: async (id: TId): Promise<IBaseResponse<ILocation>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/${id}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  find: async (options: ILocationsFilter): Promise<ILocationsResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  create: async (payload: ILocationCreate): Promise<IBaseResponse<ILocation>> => {
    try {
      const res = await AxiosSecureInstance.post(END_POINT, Toolbox.toNullifyTraverse(payload));
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  update: async (
    payload: {
      id: TId;
      data: Partial<ILocationUpdate>;
    },
  ): Promise<IBaseResponse<ILocation>> => {
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

  seed: async (payload: ILocationSeedPayload): Promise<IBaseResponse<null>> => {
    try {
      const res = await AxiosSecureInstance.post(`${END_POINT}/seed`, Toolbox.toNullifyTraverse(payload));
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};
