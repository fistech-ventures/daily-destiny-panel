import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { States } from '@lib/constant';
import useSessionState from '@lib/hooks/useSessionState';
import { Card, Empty } from 'antd';
import { IColumnNode, IComponentNode, IRowNode } from '../lib/interfaces';
import RowRenderer from './RowRenderer';

interface IProps {
  className?: string;
  cardWrapperClassName?: string;
  cardProps?: React.ComponentProps<typeof Card>;
  onEditBlock?: (block: IComponentNode, column: IColumnNode, blockIndex: number) => void;
}

const Builder: React.FC<IProps> = ({ className, cardWrapperClassName, cardProps, onEditBlock }) => {
  const [layout, setLayout] = useSessionState<IRowNode[]>(States.layout);

  const deleteRowFn = (rowIdx: number) => {
    setLayout((prev) => prev.filter((_, idx) => idx !== rowIdx));
  };

  // Sensors for row drag
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // Row drag end handler
  const onRowDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setLayout((prev) => {
      const oldIdx = prev.findIndex((row) => row.uid === active.id);
      const newIdx = prev.findIndex((row) => row.uid === over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
  };

  return (
    <div className={className}>
      <DndContext sensors={sensors} onDragEnd={onRowDragEnd}>
        <SortableContext items={layout.map((row) => row.uid)} strategy={verticalListSortingStrategy}>
          {layout.map((row, idx) => (
            <RowRenderer
              key={row.uid}
              node={row}
              layout={layout}
              setLayout={setLayout}
              rowIdx={idx}
              onDeleteRow={deleteRowFn}
              isRowDraggable
              onEditBlock={onEditBlock}
            />
          ))}
        </SortableContext>
      </DndContext>
      {layout ? (
        layout?.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No rows found" />
        ) : (
          <div className={cardWrapperClassName}>
            <Card {...cardProps}>
              Tips: drag “Row” handle to reorder rows; drag “span N” to reorder columns; drag right edge to resize.
              Spans always sum to 24 per row.
            </Card>
          </div>
        )
      ) : null}
    </div>
  );
};

export default Builder;
