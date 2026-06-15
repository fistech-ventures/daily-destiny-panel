import { IBaseEntity, IBaseFilter, IBaseResponse, TId } from '@base/interfaces';

export interface ILocation extends IBaseEntity {
  name: string;
  nameBn: string;
  slug: string;
  type: string;
  position: number;
  parentId?: TId;
  parent?: ILocation;
}

export interface ILocationsFilter extends IBaseFilter {
  type?: string;
  parentId?: TId;
}

export interface ILocationsResponse extends IBaseResponse {
  data: ILocation[];
}

export interface ILocationCreate {
  name: string;
  nameBn: string;
  slug: string;
  type: string;
  parentId?: TId;
  position: number;
  isActive: boolean;
}

export interface ILocationUpdate {
  name?: string;
  nameBn?: string;
  slug?: string;
  type?: string;
  parentId?: TId;
  position?: number;
  isActive?: boolean;
}

export interface ILocationSeedItem extends Partial<ILocationCreate> {
  parentSlug?: string;
}

export interface ILocationSeedPayload {
  locations: Array<ILocationSeedItem>;
}
