import { IMetaResponse, TId } from '@base/interfaces';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Table, type TableProps } from 'antd';
import React from 'react';
import { TbMenuOrder } from 'react-icons/tb';

interface IRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

interface IProps<D = any> extends TableProps<D> {
  dataSource: D[];
  onDragEnd?: (data: D[], oldData: D[]) => void;
}

const DragSortableTable = <D extends { key: TId }>({
  columns = [],
  dataSource = [],
  onDragEnd,
  ...rest
}: IProps<D>) => {
  const Row = ({ children, ...props }: IRowProps) => {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
      id: props['data-row-key'],
    });

    const styles: React.CSSProperties = {
      ...props.style,
      transition,
      transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
      ...(isDragging ? { position: 'relative', zIndex: dataSource?.length ? 99999 : 'unset' } : {}),
    };

    return (
      <tr {...props} ref={setNodeRef} style={styles} {...attributes}>
        {React.Children.map(children, (cbChildren) => {
          if ((cbChildren as React.ReactElement).key === 'sort') {
            return (
              <td
                ref={setActivatorNodeRef}
                style={{ touchAction: 'none', cursor: 'move', width: 50 }}
                {...listeners}
              >
                <Button
                  type="text"
                  size="small"
                >
                  <TbMenuOrder className="text-xl" />
                </Button>
              </td>
            );
          }

          return cbChildren;
        })}
      </tr>
    );
  };

  const handleDragEndFn = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const activeIdx = dataSource.findIndex((i) => i.key === active.id);
      const overIdx = dataSource.findIndex((i) => i.key === over?.id);
      const movedData = arrayMove(dataSource, activeIdx, overIdx);

      onDragEnd?.(movedData, dataSource);
    }
  };

  return (
    <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEndFn}>
      <SortableContext items={dataSource?.map((i) => i?.key)} strategy={verticalListSortingStrategy}>
        <Table
          {...rest}
          dataSource={dataSource}
          columns={[
            {
              key: 'sort',
              width: 50,
            },
            ...columns,
          ]}
          components={{
            body: {
              row: Row,
            },
          }}
          rowKey="key"
        />
      </SortableContext>
    </DndContext>
  );
};

export default DragSortableTable;

export const handleNewOrderedDataFn = <D = any,>(draggedData: D[], meta: IMetaResponse): D[] => {
  return draggedData?.map((elem, idx) => ({
    ...elem,
    order_priority: meta.page * meta.limit - (meta.limit - draggedData.length) - draggedData.length + idx + 1,
  }));
};

export const handleBulkPurifiedDataFn = <D extends { id: TId; order_priority: number }>(
  newData: D[],
  oldData: D[],
): { id: TId; data: Pick<D, 'order_priority'> }[] => {
  const purifiedOrderedData = newData?.filter(
    (item) => oldData?.find((x) => x.id === item.id)?.order_priority !== item.order_priority,
  );

  return purifiedOrderedData?.map((item) => ({
    id: item?.id,
    data: { order_priority: item?.order_priority },
  }));
};
