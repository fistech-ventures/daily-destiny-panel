import { IBaseEntity, IBaseFilter, IBaseResponse } from '@base/interfaces';

export interface IMarketPricesFilter extends IBaseFilter {}

export interface IMarketPrice extends IBaseEntity {
  title: string;
  titleBn: string;
  image: string;
  priceRange: string;
  position: number;
}

export interface IMarketPricesResponse extends IBaseResponse {
  data: IMarketPrice[];
}

export interface IMarketPriceCreate {
  title: string;
  titleBn: string;
  image: string;
  priceRange: string;
  position: number;
  isActive: boolean;
}
