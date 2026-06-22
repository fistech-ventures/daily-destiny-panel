import { Button, Input } from 'antd';
import React from 'react';
import { Hotspot } from '../lib/interfaces';

interface IProps {
  hotspot: Hotspot | null;
  onTitleChange: (title: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

const HotspotSidePanel: React.FC<IProps> = ({ hotspot, onTitleChange, onDelete, onClose }) => {
  if (!hotspot) {
    return (
      <div className="p-4 text-gray-400 text-sm text-center">
        Select a hotspot to edit its details
      </div>
    );
  }

  const { x, y, width, height } = hotspot.coordinates;

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Hotspot Details</h3>
        <Button size="small" type="text" onClick={onClose}>
          ✕
        </Button>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Title</label>
        <Input
          value={hotspot.title || ''}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter title..."
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">X (%)</label>
          <div className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {(x * 100).toFixed(1)}%
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Y (%)</label>
          <div className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {(y * 100).toFixed(1)}%
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Width (%)</label>
          <div className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {(width * 100).toFixed(1)}%
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Height (%)</label>
          <div className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {(height * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <Button danger block onClick={onDelete}>
        Delete Hotspot
      </Button>
    </div>
  );
};

export default HotspotSidePanel;
