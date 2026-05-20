import { Button, Card } from 'antd';
import React from 'react';
import { LayoutHooks } from '../lib/hooks';
import { IComponentNode } from '../lib/interfaces';
import { getEndpointFn } from '../lib/utils';

interface IProps {
  node: IComponentNode;
  onEdit: () => void;
}

const BlockRenderer: React.FC<IProps> = ({ node, onEdit }) => {
  const layoutQuery = LayoutHooks.useFindById({
    config: {
      queryKey: [node.entity, node.entityId],
      enabled: !!node.entity && !!node.entityId,
    },
    endPoint: getEndpointFn(node.entity),
    id: node.entityId,
  });

  if (!node.entity) {
    return (
      <Button size="small" onClick={onEdit}>
        ➕
      </Button>
    );
  }

  if (layoutQuery.isLoading) return <Card loading />;

  return (
    <Card
      style={{ width: '100%' }}
      title={`${node.entity.toUpperCase()} #${node.uid}`}
      extra={
        <Button size="small" onClick={onEdit} className="ml-1">
          Edit
        </Button>
      }
    >
      {(layoutQuery.data && layoutQuery.data?.data?.title) || <span className="text-gray-500">{node.mode}</span>}
    </Card>
  );
};

export default BlockRenderer;
