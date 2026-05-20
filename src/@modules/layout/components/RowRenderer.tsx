import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Button, Col, Row, Tooltip } from 'antd';
import { nanoid } from 'nanoid';
import React, { useMemo } from 'react';
import { ENUM_LAYOUT_BLOCK_WRAPPER_VIEW_TYPE, ENUM_LAYOUT_NODE_TYPE } from '../lib/enums';
import { IColumnNode, IComponentNode, IRowNode } from '../lib/interfaces';
import {
  cleanColumnPropertiesIfNoBlocks,
  deleteNodeByIdFn,
  handleRowFn,
  resizeColumnFn,
  updateNodeByIdFn,
} from '../lib/utils';
import ColumnRenderer from './ColumnRenderer';

interface IProps {
  node: IRowNode;
  layout: IRowNode[];
  setLayout: (updater: (prev: IRowNode[]) => IRowNode[]) => void;
  rowIdx: number;
  onDeleteRow?: (rowIdx: number) => void;
  isRowDraggable?: boolean;
  parentColumnId?: string; // for nested rows
  onDeleteNestedRow?: (rowId: string) => void; // for deleting nested rows
  onEditBlock?: (block: IComponentNode, column: IColumnNode, blockIndex: number) => void;
}

import { TId } from '@base/interfaces';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaTrash } from 'react-icons/fa';

const RowRenderer: React.FC<IProps> = ({
  node,
  layout,
  setLayout,
  rowIdx,
  onDeleteRow,
  isRowDraggable = false,
  parentColumnId: _parentColumnId,
  onDeleteNestedRow: _onDeleteNestedRow,
  onEditBlock,
}) => {
  const row = node;

  const ids = useMemo(() => row.columns.map((column) => column.uid), [row.columns]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onResize = (columnIdx: number, span: number) => {
    setLayout((prev) => updateNodeByIdFn(prev, String(row.uid), (r: IRowNode) => resizeColumnFn(r, columnIdx, span)));
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setLayout((prev) =>
      updateNodeByIdFn(prev, String(row.uid), (r: IRowNode) => {
        const oldIdx = r.columns.findIndex((column) => column.uid === active.id);
        const newIdx = r.columns.findIndex((column) => column.uid === over.id);
        return {
          ...r,
          columns: arrayMove(r.columns, oldIdx, newIdx),
        };
      }),
    );
  };

  const addColumnFn = () => {
    setLayout((prev) =>
      updateNodeByIdFn(prev, String(row.uid), (r: IRowNode) => {
        const columns: IColumnNode[] = [
          ...r.columns,
          {
            uid: nanoid(),
            type: ENUM_LAYOUT_NODE_TYPE.COLUMN,
            span: 6,
            options: null,
            styles: null,
            view: ENUM_LAYOUT_BLOCK_WRAPPER_VIEW_TYPE.NON_SLIDER,
            viewOptions: null,
            title: null,
            viewAllUrl: null,
            children: [],
          },
        ];
        return handleRowFn({ ...r, columns });
      }),
    );
  };

  const deleteColumnFn = (columnId: TId) => {
    setLayout((prev) =>
      updateNodeByIdFn(prev, String(row.uid), (r: IRowNode) => {
        const columns = r.columns.filter((column) => column.uid !== columnId);
        return handleRowFn({
          ...r,
          columns: columns.length
            ? columns
            : [
                {
                  uid: nanoid(),
                  type: ENUM_LAYOUT_NODE_TYPE.COLUMN,
                  span: 24,
                  options: null,
                  styles: null,
                  view: ENUM_LAYOUT_BLOCK_WRAPPER_VIEW_TYPE.NON_SLIDER,
                  viewOptions: null,
                  title: null,
                  viewAllUrl: null,
                  children: [],
                },
              ],
        });
      }),
    );
  };

  const addChildRowFn = (columnId: string) => {
    setLayout((prev) =>
      updateNodeByIdFn(prev, columnId, (c: IColumnNode) => ({
        ...c,
        children: [
          ...c.children,
          {
            uid: nanoid(),
            type: ENUM_LAYOUT_NODE_TYPE.ROW,
            columns: [
              {
                uid: nanoid(),
                type: ENUM_LAYOUT_NODE_TYPE.COLUMN,
                span: 12,
                options: null,
                styles: null,
                view: ENUM_LAYOUT_BLOCK_WRAPPER_VIEW_TYPE.NON_SLIDER,
                viewOptions: null,
                title: null,
                viewAllUrl: null,
                children: [],
              },
              {
                uid: nanoid(),
                type: ENUM_LAYOUT_NODE_TYPE.COLUMN,
                span: 12,
                options: null,
                className: null,
                styles: null,
                view: ENUM_LAYOUT_BLOCK_WRAPPER_VIEW_TYPE.NON_SLIDER,
                viewOptions: null,
                title: null,
                viewAllUrl: null,
                children: [],
              },
            ],
          } as IRowNode,
        ],
      })),
    );
  };

  const addBlockFn = (columnId: string) => {
    setLayout((prev) =>
      updateNodeByIdFn(prev, columnId, (c: IColumnNode) => ({
        ...c,
        children: [
          ...c.children,
          {
            uid: nanoid(),
            type: ENUM_LAYOUT_NODE_TYPE.COMPONENT,
          } as IComponentNode,
        ],
      })),
    );
  };

  const deleteNestedRowFn = (rowId: string) => {
    setLayout((prev) => deleteNodeByIdFn(prev, rowId));
  };

  const deleteBlockFn = (blockId: string) => {
    setLayout((prev) => deleteNodeByIdFn(prev, blockId));
  };

  const updateBlockFn = (columnId: string, idx: number, updatedBlock: IComponentNode) => {
    setLayout((prev) =>
      updateNodeByIdFn(prev, columnId, (c: IColumnNode) => {
        const children = [...c.children];
        children[idx] = updatedBlock;
        return cleanColumnPropertiesIfNoBlocks({ ...c, children });
      }),
    );
  };

  // Row drag logic
  const {
    attributes: rowAttributes,
    listeners: rowListeners,
    setNodeRef: setRowNodeRef,
    transform: rowTransform,
    transition: rowTransition,
    isDragging: isRowDragging,
  } = useSortable({ id: node.uid });
  const rowStyle = isRowDraggable
    ? {
        transform: CSS.Transform.toString(rowTransform),
        transition: rowTransition,
      }
    : {};

  return (
    <div
      ref={isRowDraggable ? setRowNodeRef : undefined}
      style={rowStyle}
      className={'border border-dashed rounded-lg p-2 my-2 bg-gray-50' + (isRowDragging ? ' opacity-70' : '')}
    >
      <div className="flex items-center gap-2 mb-2">
        {isRowDraggable && (
          <span
            {...rowAttributes}
            {...rowListeners}
            className="text-xs px-2 py-1 rounded bg-blue-400 text-white cursor-grab"
            title="Drag to reorder row"
          >
            ⠿ Row
          </span>
        )}
        {!isRowDraggable && <span className="text-xs px-2 py-1 rounded bg-gray-200">Row</span>}
        <Button size="small" onClick={addColumnFn}>
          + Column
        </Button>
        <Tooltip title="Delete Row">
          <Button
            size="small"
            type="text"
            danger
            disabled={!onDeleteRow}
            onClick={() => onDeleteRow && onDeleteRow(rowIdx)}
          >
            <FaTrash />
          </Button>
        </Tooltip>
      </div>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <Row gutter={16}>
          <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
            {row.columns.map((column, idx) => (
              <Col key={column.uid} span={column.span} className="mb-2">
                <ColumnRenderer
                  idx={idx}
                  column={column}
                  onResize={onResize}
                  onDeleteColumn={row.columns.length > 1 ? deleteColumnFn : undefined}
                  onAddChildRow={addChildRowFn}
                  onAddBlock={addBlockFn}
                  onUpdateBlock={updateBlockFn}
                  onDeleteNestedRow={deleteNestedRowFn}
                  onDeleteBlock={deleteBlockFn}
                  onEditBlock={onEditBlock}
                  layout={layout}
                  setLayout={setLayout}
                />
              </Col>
            ))}
          </SortableContext>
        </Row>
      </DndContext>

      {/* Render nested rows placed within columns */}
      {/* NodeRenderer is responsible for recursively rendering Row children inside ColumnItem */}
      <div className="hidden" />
    </div>
  );
};

export default RowRenderer;
