import { IBaseEntity, IBaseFilter, IBaseResponse } from '@base/interfaces';

export interface IEpaper extends IBaseEntity {
  date: string;
  pageNumber: number;
  imageUrl: string;
  imageKey: string;
  publicationName: string;
  title: string;
  mimetype: string;
  extension: string;
  fileSize: number;
}

export interface IEpapersFilter extends IBaseFilter {
  publicationName?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

export interface IEpapersResponse extends IBaseResponse {
  data: IEpaper[];
}

export interface IEpaperCreate {
  date: string;
  pageNumber: number;
  imageUrl: string;
  imageKey: string;
  thumbnailUrl: string;
  thumbnailKey: string;
  publicationName: string;
  title: string;
  mimetype: string;
  extension: string;
  fileSize: number;
  isActive: boolean;
}

export interface IEpaperUpdate {
  date?: string;
  pageNumber?: number;
  imageUrl?: string;
  imageKey?: string;
  thumbnailUrl?: string;
  thumbnailKey?: string;
  publicationName?: string;
  title?: string;
  isActive?: boolean;
  fileSize?: number;
}

export interface IEpaperDateRangeResponse extends IBaseResponse {
  data: IEpaper[];
}

export interface IEpaperDatesResponse extends IBaseResponse {
  data: string[];
}

export interface IEpaperPublicationsResponse extends IBaseResponse {
  data: string[];
}

export interface IEpaperBulkUploadPage {
  pageNumber: number;
  imageUrl: string;
  imageKey: string;
  thumbnailUrl: string;
  thumbnailKey: string;
  title: string;
  mimetype: string;
  extension: string;
  fileSize: number;
}

export interface IEpaperBulkUploadPayload {
  date: string;
  publicationName: string;
  pages: IEpaperBulkUploadPage[];
}
