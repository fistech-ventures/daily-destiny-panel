import { TId } from '@base/interfaces';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Tooltip } from 'antd';
import clsx from 'clsx';
import React, { useRef } from 'react';
import { FaTrash } from 'react-icons/fa';
import { ENUM_LAYOUT_NODE_TYPE } from '../lib/enums';
import { IColumnNode, IComponentNode } from '../lib/interfaces';
import BlockRenderer from './BlockRenderer';
import RowRenderer from './RowRenderer';

interface IProps {
  idx: number;
  column: IColumnNode;
  onResize: (columnIdx: number, newSpan: number) => void;
  onDeleteColumn: (columnId: TId) => void;
  onAddChildRow: (columnId: TId) => void;
  onAddBlock: (columnId: TId) => void;
  onUpdateBlock: (columnId: TId, blockIndex: number, updated: IComponentNode) => void;
  onDeleteNestedRow?: (rowId: string) => void;
  onDeleteBlock?: (blockId: string) => void;
  onEditBlock?: (block: IComponentNode, column: IColumnNode, blockIndex: number) => void;
  layout: any;
  setLayout: any;
}

const ColumnRenderer: React.FC<IProps> = ({
  idx,
  column,
  onResize,
  onDeleteColumn,
  onAddChildRow,
  onAddBlock,
  onUpdateBlock: _onUpdateBlock,
  onDeleteNestedRow,
  onDeleteBlock,
  onEditBlock,
  layout,
  setLayout,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: column.uid });
  const containerRef = useRef<HTMLDivElement>(null);
  const style = { transform: CSS.Transform.toString(transform), transition };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const elem = containerRef.current?.parentElement;
    if (!elem) return;

    const rowElem = elem.parentElement!;
    const rowWidth = rowElem.getBoundingClientRect().width;

    const moveFn = (ev: PointerEvent) => {
      const rowRect = rowElem.getBoundingClientRect();
      const x = Math.min(Math.max(ev.clientX - rowRect.left, 1), rowWidth - 1);
      const span = Math.min(Math.max(Math.round((x / rowWidth) * 24), 1), 23);

      onResize(idx, span);
    };

    const upFn = () => {
      window.removeEventListener('pointermove', moveFn);
      window.removeEventListener('pointerup', upFn);
    };

    window.addEventListener('pointermove', moveFn);
    window.addEventListener('pointerup', upFn);
  };

  return (
    <div ref={setNodeRef} style={style} className={clsx('h-full', isDragging && 'opacity-70')}>
      <div ref={containerRef} className="group border rounded-lg bg-white shadow-sm h-full relative">
        {/* drag handle shows span */}
        <div
          {...attributes}
          {...listeners}
          className="absolute left-1/2 top-2 z-10 text-xs px-2 py-1 rounded bg-gray-900/80 text-white cursor-grab"
        >
          ⠿ Span {column.span}
        </div>

        {/* Right resize handle */}
        <div
          onPointerDown={onPointerDown}
          className="absolute top-0 right-0 h-full w-2 cursor-col-resize bg-transparent group-hover:bg-gray-200/60"
          title="Drag to resize"
        />

        <div className="p-2 space-y-2">
          <div className="flex gap-2">
            <Tooltip title="Add nested Row">
              <Button size="small" onClick={() => onAddChildRow(column.uid)}>
                + Row
              </Button>
            </Tooltip>
            <Tooltip title="Add Block">
              <Button size="small" onClick={() => onAddBlock(column.uid)}>
                + Block
              </Button>
            </Tooltip>
            <div className="flex-1" />
            <Tooltip title={onDeleteColumn ? 'Delete Column' : 'Cannot delete the only column'}>
              <Button
                size="small"
                type="text"
                danger
                disabled={!onDeleteColumn}
                onClick={() => onDeleteColumn && onDeleteColumn(column.uid)}
              >
                <FaTrash />
              </Button>
            </Tooltip>
          </div>

          {/* children: recursive drag-and-drop for rows and blocks */}
          <DndContext
            onDragEnd={(e) => {
              const { active, over } = e;
              if (!over || active.id === over.id) return;
              function updateColumnRecursively(columns) {
                return columns.map((c: IColumnNode) => {
                  if (String(c.uid) === String(column.uid)) {
                    const oldIdx = c.children.findIndex((child) => child.uid === active.id);
                    const newIdx = c.children.findIndex((child) => child.uid === over.id);
                    if (oldIdx !== -1 && newIdx !== -1) {
                      const newChildren = arrayMove(c.children, oldIdx, newIdx);
                      return { ...c, children: newChildren };
                    }
                  }
                  // Recursively update nested columns
                  if (c.children && c.children.length > 0) {
                    return {
                      ...c,
                      children: c.children.map((child) => {
                        if (child.type === ENUM_LAYOUT_NODE_TYPE.ROW) {
                          return {
                            ...child,
                            columns: updateColumnRecursively(child.columns),
                          };
                        }
                        return child;
                      }),
                    };
                  }
                  return c;
                });
              }
              setLayout((prev) => {
                return prev.map((r) => ({
                  ...r,
                  columns: updateColumnRecursively(r.columns),
                }));
              });
            }}
          >
            <SortableContext items={column.children.map((child) => child.uid)} strategy={verticalListSortingStrategy}>
              {column.children.map((child, idx) => {
                if (child.type === ENUM_LAYOUT_NODE_TYPE.ROW) {
                  // Create a specific delete function for this nested row
                  const deleteThisNestedRow = onDeleteNestedRow
                    ? () => onDeleteNestedRow(String(child.uid))
                    : undefined;

                  // Recursively render RowRenderer, which will render its own columns and blocks
                  return (
                    <RowRenderer
                      key={child.uid}
                      node={child}
                      layout={layout}
                      setLayout={setLayout}
                      rowIdx={-1} // Not applicable for nested rows
                      isRowDraggable={true}
                      parentColumnId={String(column.uid)}
                      onDeleteRow={deleteThisNestedRow}
                      onDeleteNestedRow={onDeleteNestedRow}
                      onEditBlock={onEditBlock}
                    />
                  );
                }

                // Always use SortableBlock for blocks, even nested
                return (
                  <SortableBlock
                    key={child.uid}
                    child={child}
                    idx={idx}
                    column={column}
                    onDeleteBlock={onDeleteBlock}
                    onEditBlock={onEditBlock}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default ColumnRenderer;

const SortableBlock = ({ child, idx, column, onDeleteBlock, onEditBlock }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: child.uid });

  const blockStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: '2px dashed #22c55e',
    background: isDragging ? '#e6fffa' : '#f0fdf4',
    marginBottom: '8px',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    boxShadow: isDragging ? '0 0 8px #22c55e' : 'none',
  };

  const handleEdit = () => {
    if (onEditBlock) {
      onEditBlock(child, column, idx);
    }
  };

  return (
    <div key={child.uid} ref={setNodeRef} style={blockStyle}>
      <div className="flex items-center justify-between w-full">
        <span
          {...attributes}
          {...listeners}
          className="text-xs px-2 py-1 rounded bg-green-900/80 text-white cursor-grab"
          style={{ minWidth: 60, textAlign: 'center', fontWeight: 'bold' }}
          title="Drag to reorder block"
        >
          ⠿ Block
        </span>
        <Tooltip title={onDeleteBlock ? 'Delete Block' : 'Cannot delete the only block'}>
          <Button
            size="small"
            type="text"
            danger
            disabled={!onDeleteBlock}
            onClick={() => onDeleteBlock && onDeleteBlock(String(child.uid))}
          >
            <FaTrash />
          </Button>
        </Tooltip>
      </div>
      <BlockRenderer node={child as IComponentNode} onEdit={handleEdit} />
    </div>
  );
};
