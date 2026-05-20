import { IBaseEntity, IBaseFilter, IBaseResponse, TId } from '@base/interfaces';
import { TAdsType } from './enums';

export interface IAdsFilter extends IBaseFilter {}

export interface IAd extends IBaseEntity {
  type: TAdsType;
  title: string;
  imageUrl: string;
  videoUrl: string;
  scriptEmbedCode: string;
  redirectUrl: string;
  startDate: string;
  endDate: string;
  requestId: TId;
}

export interface IAdsResponse extends IBaseResponse {
  data: IAd[];
}

export interface IAdCreate {
  type: TAdsType;
  title: string;
  imageUrl: string;
  videoUrl: string;
  scriptEmbedCode: string;
  redirectUrl: string;
  startDate: string;
  endDate: string;
  requestId: TId;
  isActive: boolean;
}
