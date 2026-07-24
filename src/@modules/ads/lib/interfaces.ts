import { IBaseEntity, IBaseFilter, IBaseResponse } from '@base/interfaces';
import { TAdsType } from './enums';

export interface IAdsFilter extends IBaseFilter {
  pageType?: string;
  position?: string;
  categoryId?: string;
}

export interface IAd extends IBaseEntity {
  type: TAdsType;
  title: string;
  imageUrl: string;
  videoUrl: string;
  scriptEmbedCode: string;
  redirectUrl: string;
  startDate: string;
  endDate: string;
  pageType?: string;
  position?: string;
  isActive: boolean;
}

export interface IAdsResponse extends IBaseResponse {
  data: IAd[];
}

export interface IAdCreate {
  type: TAdsType;
  title: string;
  imageUrl?: string;
  videoUrl?: string;
  scriptEmbedCode?: string;
  redirectUrl?: string;
  startDate: string;
  endDate: string;
  pageType?: string;
  position?: string;
  categories?: string[];
  isActive: boolean;
}
