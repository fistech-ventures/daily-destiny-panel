import React from 'react';
import { ENUM_LAYOUT_NODE_TYPE } from '../lib/enums';
import { IComponentNode, IRowNode } from '../lib/interfaces';
import BlockRenderer from './BlockRenderer';
import RowRenderer from './RowRenderer';

interface IProps {
  node: IRowNode | IComponentNode;
  layout: IRowNode[];
  setLayout: (updater: (prev: IRowNode[]) => IRowNode[]) => void;
  rowIdx?: number;
}

// A thin wrapper to decide which renderer to use.
// In this scaffold, ColumnItem renders its own BlockRenderer for better modal control,
// but NodeRenderer is handy for generic recursion use.
const NodeRenderer: React.FC<IProps> = ({ node, layout, setLayout, rowIdx }) => {
  if (node.type === ENUM_LAYOUT_NODE_TYPE.ROW) {
    if (typeof rowIdx === 'number') {
      return <RowRenderer node={node as IRowNode} layout={layout} setLayout={setLayout} rowIdx={rowIdx} />;
    }

    // If rowIdx is not provided, fallback to first row
    return null;
  }

  return <BlockRenderer node={node as IComponentNode} onEdit={() => {}} />;
};

export default NodeRenderer;
