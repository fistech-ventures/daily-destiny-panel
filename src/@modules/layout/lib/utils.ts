import {
  ENUM_LAYOUT_BLOCK_WRAPPER_VIEW_TYPE,
  ENUM_LAYOUT_NODE_TYPE,
  TLayoutBlockEntityType,
  TLayoutBlockWrapperViewType,
} from './enums';
import { IColumnNode, IComponentNode, IRowNode } from './interfaces';

export const arrToObjFn = (arr: Array<{ key: string; value: any }>): Record<string, any> => {
  const parsePrimitive = (val: any): any => {
    if (typeof val !== 'string') return val;

    const lower = val.toLowerCase();

    if (lower === 'true') return true;
    if (lower === 'false') return false;
    if (lower === 'null') return null;
    if (!isNaN(Number(val))) return Number(val);

    return val;
  };

  const parseValue = (val: any): any => {
    if (typeof val !== 'string') return val;

    // Try number/boolean/null first
    const primitive = parsePrimitive(val);
    if (primitive !== val) return primitive;

    // Try object-like string
    if (val.trim().startsWith('{') && val.trim().endsWith('}')) {
      try {
        const toJson = (str: string): any => {
          // Quote keys
          str = str.replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":');
          // Replace single quotes with double
          str = str.replace(/'/g, '"');
          // Quote bare values like #fff or words without quotes
          str = str.replace(/:\s*([#a-zA-Z0-9_-]+)/g, ': "$1"');

          return JSON.parse(str, (k, v) => parsePrimitive(v));
        };
        return toJson(val);
      } catch {
        return val;
      }
    }

    return val;
  };

  return arr
    ? arr.reduce(
        (obj, { key, value }) => {
          obj[key] = parseValue(value);
          return obj;
        },
        {} as Record<string, any>,
      )
    : {};
};

export const objToArrayFn = (obj: Record<string, string>): Array<{ key: string; value: string }> => {
  const stringifyValue = (val: any): string => {
    if (typeof val === 'object' && val !== null) {
      return (
        '{' +
        Object.entries(val)
          .map(([k, v]) => `${k}:${stringifyValue(v)}`)
          .join(',') +
        '}'
      );
    }
    return String(val);
  };

  return obj
    ? Object.entries(obj).map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return { key, value: stringifyValue(value) };
        }
        return { key, value };
      })
    : [];
};

export const clampFn = (num: number, min: number, max: number) => Math.max(min, Math.min(max, num));

export const cleanColumnPropertiesIfNoBlocks = (column: IColumnNode): IColumnNode => {
  // Check if column has any blocks (components)
  const hasBlocks = column.children.some((child) => (child as IComponentNode).type === ENUM_LAYOUT_NODE_TYPE.COMPONENT);

  // If no blocks remain, reset the column's wrapper properties
  if (!hasBlocks) {
    return {
      ...column,
      title: null,
      viewAllUrl: null,
      options: null,
      view: ENUM_LAYOUT_BLOCK_WRAPPER_VIEW_TYPE.NON_SLIDER,
      viewOptions: null,
      styles: null,
    };
  }

  return column;
};

export const setColumnPropertiesFromBlock = (
  column: IColumnNode,
  blockData: {
    title?: string;
    viewAllUrl?: string;
    wrapperOptions?: Record<string, any>;
    wrapperView?: TLayoutBlockWrapperViewType;
    wrapperViewOptions?: Record<string, string>;
    wrapperViewStyles?: Record<string, string>;
  },
): IColumnNode => {
  return {
    ...column,
    title: blockData.title,
    viewAllUrl: blockData.viewAllUrl,
    options: blockData.wrapperOptions,
    view: blockData.wrapperView,
    viewOptions: blockData.wrapperViewOptions,
    styles: blockData.wrapperViewStyles,
  };
};

const takeFromFn = (columns: IColumnNode[], idx: number, amount: number) => {
  if (idx < 0) return 0;

  const canGive = columns[idx].span - 1;
  const give = Math.min(amount, Math.max(0, canGive));
  columns[idx].span -= give;

  return give;
};

export const handleRowFn = (row: IRowNode): IRowNode => {
  const total = row.columns.reduce((total, column) => total + column.span, 0);

  if (total === 24) return row;
  if (total <= 0) return { ...row, columns: [{ ...row.columns[0], span: 24, children: [] }] };

  const scale = 24 / total;
  let acc = 0;

  const columns = row.columns.map((column, idx) => {
    const scaled = idx === row.columns.length - 1 ? 24 - acc : Math.max(1, Math.round(column.span * scale));
    acc += scaled;
    return { ...column, span: scaled };
  });

  return { ...row, columns };
};

export const resizeColumnFn = (row: IRowNode, colIdx: number, newSpan: number): IRowNode => {
  const columns = row.columns.map((column) => ({ ...column }));

  const current = columns[colIdx];
  const target = clampFn(newSpan, 1, 23);
  const delta = target - current.span;

  if (delta === 0) return row;

  const rightIdx = colIdx + 1 < columns.length ? colIdx + 1 : -1;
  const leftIdx = colIdx - 1 >= 0 ? colIdx - 1 : -1;

  if (delta > 0) {
    let got = 0;

    if (rightIdx !== -1) got += takeFromFn(columns, rightIdx, delta - got);
    if (got < delta && leftIdx !== -1) got += takeFromFn(columns, leftIdx, delta - got);

    current.span += got;
  } else {
    const give = -delta;

    if (rightIdx !== -1) {
      columns[rightIdx].span += give;
      current.span -= give;
    } else if (leftIdx !== -1) {
      columns[leftIdx].span += give;
      current.span -= give;
    }
  }

  return handleRowFn({ ...row, columns });
};

export const updateNodeByIdFn = (
  layout: IRowNode[],
  id: string,
  updater: (node: IRowNode | IColumnNode | IComponentNode) => any,
): IRowNode[] => {
  const updateRowFn = (row: IRowNode): IRowNode => {
    if (row.uid === id) return updater(row);

    return {
      ...row,
      columns: row.columns.map(updateColumnFn),
    };
  };

  const updateColumnFn = (column: IColumnNode): IColumnNode => {
    if (column.uid === id) {
      const updated = updater(column);
      return cleanColumnPropertiesIfNoBlocks(updated);
    }

    const updated = {
      ...column,
      children: column.children.map(updateChildFn),
    };

    return cleanColumnPropertiesIfNoBlocks(updated);
  };

  const updateChildFn = (child: IRowNode | IComponentNode): any => {
    if (child.uid === id) return updater(child);
    if ((child as IRowNode).type === ENUM_LAYOUT_NODE_TYPE.ROW) {
      return updateRowFn(child as IRowNode);
    }

    return child;
  };

  return layout.map(updateRowFn);
};

export const deleteNodeByIdFn = (layout: IRowNode[], id: string): IRowNode[] => {
  const deleteFromRowFn = (row: IRowNode): IRowNode | null => {
    // If this row itself should be deleted
    if (row.uid === id) return null;

    // Filter columns, removing any that match the id
    const filteredColumns = row.columns.map(deleteFromColumnFn).filter((col): col is IColumnNode => col !== null);

    // If no columns left, return null to delete this row
    if (filteredColumns.length === 0) return null;

    return handleRowFn({
      ...row,
      columns: filteredColumns,
    });
  };

  const deleteFromColumnFn = (column: IColumnNode): IColumnNode | null => {
    // If this column itself should be deleted
    if (column.uid === id) return null;

    // Filter children, removing any that match the id
    const filteredChildren = column.children
      .map(deleteFromChildFn)
      .filter((child): child is IRowNode | IComponentNode => child !== null);

    const updatedColumn = {
      ...column,
      children: filteredChildren,
    };

    return cleanColumnPropertiesIfNoBlocks(updatedColumn);
  };

  const deleteFromChildFn = (child: IRowNode | IComponentNode): IRowNode | IComponentNode | null => {
    // If this child itself should be deleted
    if (child.uid === id) return null;

    // If it's a row, recursively delete from it
    if ((child as IRowNode).type === ENUM_LAYOUT_NODE_TYPE.ROW) {
      return deleteFromRowFn(child as IRowNode);
    }

    // If it's a component, return as is (already checked for deletion above)
    return child;
  };

  return layout.map(deleteFromRowFn).filter((row): row is IRowNode => row !== null);
};

export const getEndpointFn = (blockType: TLayoutBlockEntityType) => {
  if (!blockType) return '';

  const sanitized = blockType.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `${sanitized}s`;
};
