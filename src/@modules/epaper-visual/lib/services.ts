import { IBaseResponse, TId } from '@base/interfaces';
import { AxiosSecureInstance } from '@lib/config';
import { responseHandlerFn, Toolbox } from '@lib/utils';
import {
  Edition,
  IEpaperVisualPage,
  CreateEditionPayload,
  CreatePagePayload,
  SaveHotspotsPayload,
  IEditionsFilter,
} from './interfaces';

const END_POINT = 'epaper-visual';

export const EpaperVisualServices = {
  NAME: 'epaper-visual',

  // Editions
  findEditions: async (options: IEditionsFilter): Promise<IBaseResponse<Edition[]>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/editions?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  findEditionById: async (id: TId): Promise<IBaseResponse<Edition>> => {
    try {
      const res = await AxiosSecureInstance.get(`${END_POINT}/editions/${id}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  createEdition: async (payload: CreateEditionPayload): Promise<IBaseResponse<Edition>> => {
    try {
      const res = await AxiosSecureInstance.post(`${END_POINT}/editions`, payload);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  publishEdition: async (id: TId): Promise<IBaseResponse<Edition>> => {
    try {
      const res = await AxiosSecureInstance.patch(`${END_POINT}/editions/${id}/publish`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  deleteEdition: async (id: TId): Promise<IBaseResponse<null>> => {
    try {
      const res = await AxiosSecureInstance.delete(`${END_POINT}/editions/${id}`);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  // Pages
  addPage: async (payload: { editionId: TId; data: CreatePagePayload }): Promise<IBaseResponse<IEpaperVisualPage>> => {
    try {
      const res = await AxiosSecureInstance.post(`${END_POINT}/editions/${payload.editionId}/pages`, payload.data);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },

  // Hotspots
  saveHotspots: async (payload: SaveHotspotsPayload): Promise<IBaseResponse<any>> => {
    try {
      const res = await AxiosSecureInstance.post(`${END_POINT}/hotspots`, payload);
      return Promise.resolve(res?.data);
    } catch (error) {
      throw responseHandlerFn(error);
    }
  },
};
