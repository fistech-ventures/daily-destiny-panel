import { IBaseResponse, TId } from '@base/interfaces';
import { AxiosSecureInstance } from '@lib/config';
import { responseHandlerFn, Toolbox } from '@lib/utils';
import {
  IEpaper,
  IEpaperBulkUploadPayload,
  IEpaperCreate,
  IEpaperDateRangeResponse,
  IEpaperDatesResponse,
  IEpaperPublicationsResponse,
  IEpaperUpdate,
  IEpapersFilter,
  IEpapersResponse,
} from './interfaces';

const END_POINT: string = '/epapers';

export const EpapersServices = {
  NAME: END_POINT,

  findById: async (id: TId): Promise<IBaseResponse<IEpaper>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/${id}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  find: async (options: IEpapersFilter): Promise<IEpapersResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  create: async (payload: IEpaperCreate): Promise<IBaseResponse<IEpaper>> => {
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
      data: Partial<IEpaperUpdate>;
    },
  ): Promise<IBaseResponse<IEpaper>> => {
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

  findByDateRange: async (
    dateFrom: string,
    dateTo: string,
    publicationName: string,
  ): Promise<IEpaperDateRangeResponse> => {
    try {
      const res = await AxiosSecureInstance.get(
        `${END_POINT}/date-range?dateFrom=${dateFrom}&dateTo=${dateTo}&publicationName=${publicationName}`,
      );
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  findDates: async (publicationName: string): Promise<IEpaperDatesResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/dates?publicationName=${publicationName}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  findPagesByDate: async (date: string, publicationName: string): Promise<IEpapersResponse> => {
    try {
      const res = await AxiosSecureInstance.get(
        `${END_POINT}/pages/${date}?publicationName=${publicationName}`,
      );
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  getPublications: async (): Promise<IEpaperPublicationsResponse> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/publications`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  bulkUpload: async (payload: IEpaperBulkUploadPayload): Promise<IBaseResponse<null>> => {
    try {
      const res = await AxiosSecureInstance.post(`${END_POINT}/bulk-upload`, Toolbox.toNullifyTraverse(payload));
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};
