import React, { useCallback, useRef, useState } from 'react';
import { Hotspot, HotspotCoordinates } from '../lib/interfaces';

interface IProps {
  hotspot: Hotspot;
  isSelected: boolean;
  isEditMode: boolean;
  scale: number;
  imageWidth: number;
  imageHeight: number;
  color: string;
  onSelect: () => void;
  onUpdate: (coordinates: HotspotCoordinates) => void;
  onDelete: () => void;
}

type DragMode = 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br' | 'resize-t' | 'resize-b' | 'resize-l' | 'resize-r' | null;

const HANDLE_SIZE = 8;

const HotspotRect: React.FC<IProps> = ({
  hotspot,
  isSelected,
  isEditMode,
  scale,
  imageWidth,
  imageHeight,
  color,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  const [_dragMode, setDragMode] = useState<DragMode>(null);
  const dragStart = useRef<{ x: number; y: number; coords: HotspotCoordinates }>({ x: 0, y: 0, coords: { x: 0, y: 0, width: 0, height: 0 } });

  const { x, y, width, height } = hotspot.coordinates;

  const pixelX = x * imageWidth * scale;
  const pixelY = y * imageHeight * scale;
  const pixelW = width * imageWidth * scale;
  const pixelH = height * imageHeight * scale;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, mode: DragMode) => {
      e.stopPropagation();
      if (!isEditMode) return;

      setDragMode(mode);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        coords: { ...hotspot.coordinates },
      };

      const handleMouseMove = (e: MouseEvent) => {
        const dx = (e.clientX - dragStart.current.x);
        const dy = (e.clientY - dragStart.current.y);

        const dPercentX = dx / (imageWidth * scale);
        const dPercentY = dy / (imageHeight * scale);

        const original = dragStart.current.coords;
        let newCoords = { ...original };

        switch (mode) {
          case 'move':
            newCoords = {
              x: Math.max(0, Math.min(1 - original.width, original.x + dPercentX)),
              y: Math.max(0, Math.min(1 - original.height, original.y + dPercentY)),
              width: original.width,
              height: original.height,
            };
            break;
          case 'resize-tl':
            newCoords = {
              x: Math.max(0, Math.min(original.x + original.width - 0.01, original.x + dPercentX)),
              y: Math.max(0, Math.min(original.y + original.height - 0.01, original.y + dPercentY)),
              width: Math.max(0.01, original.width - dPercentX),
              height: Math.max(0.01, original.height - dPercentY),
            };
            break;
          case 'resize-tr':
            newCoords = {
              x: original.x,
              y: Math.max(0, Math.min(original.y + original.height - 0.01, original.y + dPercentY)),
              width: Math.max(0.01, original.width + dPercentX),
              height: Math.max(0.01, original.height - dPercentY),
            };
            break;
          case 'resize-bl':
            newCoords = {
              x: Math.max(0, Math.min(original.x + original.width - 0.01, original.x + dPercentX)),
              y: original.y,
              width: Math.max(0.01, original.width - dPercentX),
              height: Math.max(0.01, original.height + dPercentY),
            };
            break;
          case 'resize-br':
            newCoords = {
              x: original.x,
              y: original.y,
              width: Math.max(0.01, original.width + dPercentX),
              height: Math.max(0.01, original.height + dPercentY),
            };
            break;
          case 'resize-t':
            newCoords = {
              x: original.x,
              y: Math.max(0, Math.min(original.y + original.height - 0.01, original.y + dPercentY)),
              width: original.width,
              height: Math.max(0.01, original.height - dPercentY),
            };
            break;
          case 'resize-b':
            newCoords = {
              x: original.x,
              y: original.y,
              width: original.width,
              height: Math.max(0.01, original.height + dPercentY),
            };
            break;
          case 'resize-l':
            newCoords = {
              x: Math.max(0, Math.min(original.x + original.width - 0.01, original.x + dPercentX)),
              y: original.y,
              width: Math.max(0.01, original.width - dPercentX),
              height: original.height,
            };
            break;
          case 'resize-r':
            newCoords = {
              x: original.x,
              y: original.y,
              width: Math.max(0.01, original.width + dPercentX),
              height: original.height,
            };
            break;
        }
        if (
          newCoords.x !== hotspot.coordinates.x ||
          newCoords.y !== hotspot.coordinates.y ||
          newCoords.width !== hotspot.coordinates.width ||
          newCoords.height !== hotspot.coordinates.height
        ) {
          onUpdate(newCoords);
        }
      };

      const handleMouseUp = () => {
        setDragMode(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [isEditMode, hotspot.coordinates, imageWidth, imageHeight, scale, onUpdate],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete();
    },
    [onDelete],
  );

  return (
    <div
      className="absolute group"
      style={{
        left: pixelX,
        top: pixelY,
        width: pixelW,
        height: pixelH,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Main rectangle */}
      <div
        className={`absolute inset-0 rounded transition-colors ${isEditMode ? 'cursor-move' : 'cursor-pointer'}`}
        style={{
          backgroundColor: isSelected ? color : 'transparent',
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? '#3b82f6' : '#3b82f680',
          borderStyle: 'solid',
        }}
        onMouseDown={(e) => handleMouseDown(e, 'move')}
      />

      {/* Hotspot title label */}
      {hotspot.title && (
        <div className="absolute -top-6 left-0 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded truncate max-w-full pointer-events-none">
          {hotspot.title}
        </div>
      )}

      {/* Delete button */}
      {isSelected && isEditMode && (
        <button
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 z-10 shadow"
          onClick={handleDelete}
        >
          ×
        </button>
      )}

      {/* Resize handles */}
      {isEditMode && isSelected && (
        <>
          {/* Corners */}
          <div
            className="absolute w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-nw-resize z-10"
            style={{ left: -HANDLE_SIZE / 2, top: -HANDLE_SIZE / 2 }}
            onMouseDown={(e) => handleMouseDown(e, 'resize-tl')}
          />
          <div
            className="absolute w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-ne-resize z-10"
            style={{ right: -HANDLE_SIZE / 2, top: -HANDLE_SIZE / 2 }}
            onMouseDown={(e) => handleMouseDown(e, 'resize-tr')}
          />
          <div
            className="absolute w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-sw-resize z-10"
            style={{ left: -HANDLE_SIZE / 2, bottom: -HANDLE_SIZE / 2 }}
            onMouseDown={(e) => handleMouseDown(e, 'resize-bl')}
          />
          <div
            className="absolute w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-se-resize z-10"
            style={{ right: -HANDLE_SIZE / 2, bottom: -HANDLE_SIZE / 2 }}
            onMouseDown={(e) => handleMouseDown(e, 'resize-br')}
          />

          {/* Edges */}
          <div
            className="absolute h-2 w-full cursor-n-resize z-10"
            style={{ top: -HANDLE_SIZE / 2, left: 0 }}
            onMouseDown={(e) => handleMouseDown(e, 'resize-t')}
          />
          <div
            className="absolute h-2 w-full cursor-s-resize z-10"
            style={{ bottom: -HANDLE_SIZE / 2, left: 0 }}
            onMouseDown={(e) => handleMouseDown(e, 'resize-b')}
          />
          <div
            className="absolute w-2 h-full cursor-w-resize z-10"
            style={{ left: -HANDLE_SIZE / 2, top: 0 }}
            onMouseDown={(e) => handleMouseDown(e, 'resize-l')}
          />
          <div
            className="absolute w-2 h-full cursor-e-resize z-10"
            style={{ right: -HANDLE_SIZE / 2, top: 0 }}
            onMouseDown={(e) => handleMouseDown(e, 'resize-r')}
          />
        </>
      )}
    </div>
  );
};

export default HotspotRect;
