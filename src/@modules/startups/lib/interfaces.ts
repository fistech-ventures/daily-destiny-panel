import { IBaseEntity, IBaseFilter, IBaseResponse, TId } from '@base/interfaces';

export interface IStartupFounder extends IBaseEntity {
  founderId: TId;
  designation: string;
  joined: string;
}

export interface IStartupFounderCreate {
  id?: TId;
  founderId: TId;
  designation: string;
  joined: string;
}

export interface IStartupsFilter extends IBaseFilter {}

export interface IStartup extends IBaseEntity {
  logo: string;
  name: string;
  brief: string;
  website: string;
  email: string;
  phoneNumber: string;
  address: string;
  founders: IStartupFounder[];
  established: string;
}

export interface IStartupsResponse extends IBaseResponse {
  data: IStartup[];
}

export interface IStartupCreate {
  logo: string;
  name: string;
  brief: string;
  website: string;
  email: string;
  phoneNumber: string;
  address: string;
  founders: IStartupFounderCreate[];
  established: string;
  isActive: boolean;
}
