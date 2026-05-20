import { IBaseResponse, TId } from '@base/interfaces';
import {
  ENUM_LAYOUT_NODE_TYPE,
  TLayoutBlockEntityType,
  TLayoutBlockModeType,
  TLayoutBlockViewType,
  TLayoutBlockWrapperViewType,
} from './enums';

export interface IRowNode {
  uid: TId;
  type: ENUM_LAYOUT_NODE_TYPE.ROW;
  columns: IColumnNode[];
}

export interface IColumnNode {
  uid: TId;
  title: string;
  viewAllUrl: string;
  type: ENUM_LAYOUT_NODE_TYPE.COLUMN;
  span: number;
  options: Record<string, string>;
  view: TLayoutBlockWrapperViewType;
  viewOptions: Record<string, string>;
  styles: Record<string, string>;
  children: (IRowNode | IComponentNode)[];
}

export interface IComponentNode {
  uid: TId;
  type: ENUM_LAYOUT_NODE_TYPE.COMPONENT;
  mode: TLayoutBlockModeType;
  view: TLayoutBlockViewType;
  viewOptions: Record<string, string>;
  entity: TLayoutBlockEntityType;
  entityId: TId;
  entityOptions: Record<string, string>;
  entityResponse: IBaseResponse;
  styles: Record<string, string>;
}

export type ILayoutCreate = IRowNode[];
