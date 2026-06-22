import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Hotspot, HotspotCoordinates } from '../lib/interfaces';
import HotspotRect from './HotspotRect';
import HotspotSidePanel from './HotspotSidePanel';

interface IProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  hotspots: Hotspot[];
  isEditMode: boolean;
  onHotspotsChange: (hotspots: Hotspot[]) => void;
  selectedHotspotId: string | null;
  onSelectHotspot: (id: string | null) => void;
}

interface DrawingState {
  isDrawing: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

const HOTSPOT_COLORS = [
  'rgba(59, 130, 246, 0.3)', // blue
  'rgba(239, 68, 68, 0.3)',  // red
  'rgba(34, 197, 94, 0.3)',  // green
  'rgba(168, 85, 247, 0.3)', // purple
  'rgba(249, 115, 22, 0.3)', // orange
  'rgba(236, 72, 153, 0.3)', // pink
  'rgba(20, 184, 166, 0.3)', // teal
  'rgba(234, 179, 8, 0.3)',  // yellow
];

const HotspotEditor: React.FC<IProps> = ({
  imageUrl,
  imageWidth,
  imageHeight,
  hotspots,
  isEditMode,
  onHotspotsChange,
  selectedHotspotId,
  onSelectHotspot,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [drawing, setDrawing] = useState<DrawingState>({
    isDrawing: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });
  const [localHotspots, setLocalHotspots] = useState<Hotspot[]>(hotspots);

  // Sync local hotspots with props
  useEffect(() => {
    setLocalHotspots(hotspots);
  }, [hotspots]);

  // Get container width using ResizeObserver (handles sidebar open/close, not just window resize)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      setContainerWidth(container.clientWidth);
    };
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const scale = containerWidth > 0 ? containerWidth / imageWidth : 1;

  // Convert pixel coords to percentage coords
  const pixelToPercent = useCallback(
    (pixel: number, dimension: number) => {
      const percent = pixel / (dimension * scale);
      return Math.max(0, Math.min(1, percent));
    },
    [scale],
  );

  // Handle mouse down on the overlay (start drawing)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isEditMode) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setDrawing({
        isDrawing: true,
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
      });

      onSelectHotspot(null);
    },
    [isEditMode, onSelectHotspot],
  );

  // Handle mouse move (while drawing)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!drawing.isDrawing) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      setDrawing((prev) => ({
        ...prev,
        currentX: e.clientX - rect.left,
        currentY: e.clientY - rect.top,
      }));
    },
    [drawing.isDrawing],
  );

  // Handle mouse up (finish drawing)
  const handleMouseUp = useCallback(() => {
    if (!drawing.isDrawing) return;

    const x = Math.min(drawing.startX, drawing.currentX);
    const y = Math.min(drawing.startY, drawing.currentY);
    const w = Math.abs(drawing.currentX - drawing.startX);
    const h = Math.abs(drawing.currentY - drawing.startY);

    // Only create if the rectangle is large enough (minimum 10px)
    if (w > 10 && h > 10) {
      const newHotspot: Hotspot = {
        id: `new-${Date.now()}`,
        pageId: '',
        title: null,
        coordinates: {
          x: pixelToPercent(x, imageWidth),
          y: pixelToPercent(y, imageHeight),
          width: pixelToPercent(w, imageWidth),
          height: pixelToPercent(h, imageHeight),
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = [...localHotspots, newHotspot];
      setLocalHotspots(updated);
      onHotspotsChange(updated);
      onSelectHotspot(newHotspot.id);
    }

    setDrawing({ isDrawing: false, startX: 0, startY: 0, currentX: 0, currentY: 0 });
  }, [drawing, imageWidth, imageHeight, localHotspots, onHotspotsChange, onSelectHotspot, pixelToPercent]);

  // Handle hotspot coordinate update (from drag/resize)
  const handleHotspotUpdate = useCallback(
    (id: string, coordinates: HotspotCoordinates) => {
      const updated = localHotspots.map((h) =>
        h.id === id ? { ...h, coordinates } : h,
      );
      setLocalHotspots(updated);
      onHotspotsChange(updated);
    },
    [localHotspots, onHotspotsChange],
  );

  // Handle title change from side panel
  const handleTitleChange = useCallback(
    (title: string) => {
      if (!selectedHotspotId) return;
      const updated = localHotspots.map((h) =>
        h.id === selectedHotspotId ? { ...h, title: title || null } : h,
      );
      setLocalHotspots(updated);
      onHotspotsChange(updated);
    },
    [selectedHotspotId, localHotspots, onHotspotsChange],
  );

  // Handle delete hotspot
  const handleDeleteHotspot = useCallback(
    (id: string) => {
      const updated = localHotspots.filter((h) => h.id !== id);
      setLocalHotspots(updated);
      onHotspotsChange(updated);
      if (selectedHotspotId === id) {
        onSelectHotspot(null);
      }
    },
    [localHotspots, onHotspotsChange, selectedHotspotId, onSelectHotspot],
  );

  const selectedHotspot = localHotspots.find((h) => h.id === selectedHotspotId) || null;

  return (
    <div className="flex gap-4">
      <div className="flex-1 relative" ref={containerRef}>
        {/* The page image */}
        <img
          src={imageUrl}
          alt="ePaper Page"
          className="w-full h-auto select-none"
          draggable={false}
          style={{ display: 'block' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/not_found.jpg';
          }}
        />

        {/* Hotspot overlay */}
        <div
          className={`absolute inset-0 ${isEditMode ? 'cursor-crosshair' : 'cursor-default'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Existing hotspots */}
          {localHotspots.map((hotspot, index) => (
            <HotspotRect
              key={hotspot.id}
              hotspot={hotspot}
              isSelected={hotspot.id === selectedHotspotId}
              isEditMode={isEditMode}
              scale={scale}
              imageWidth={imageWidth}
              imageHeight={imageHeight}
              color={HOTSPOT_COLORS[index % HOTSPOT_COLORS.length]}
              onSelect={() => onSelectHotspot(hotspot.id)}
              onUpdate={(coords) => handleHotspotUpdate(hotspot.id, coords)}
              onDelete={() => handleDeleteHotspot(hotspot.id)}
            />
          ))}

          {/* Drawing preview rectangle */}
          {drawing.isDrawing && (
            <div
              className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
              style={{
                left: Math.min(drawing.startX, drawing.currentX),
                top: Math.min(drawing.startY, drawing.currentY),
                width: Math.abs(drawing.currentX - drawing.startX),
                height: Math.abs(drawing.currentY - drawing.startY),
              }}
            />
          )}
        </div>

        {/* View mode tooltips */}
        {!isEditMode &&
          localHotspots.map((hotspot, index) => (
            <div
              key={hotspot.id}
              className="absolute group cursor-pointer"
              style={{
                left: `${hotspot.coordinates.x * 100}%`,
                top: `${hotspot.coordinates.y * 100}%`,
                width: `${hotspot.coordinates.width * 100}%`,
                height: `${hotspot.coordinates.height * 100}%`,
              }}
              onClick={() => onSelectHotspot(hotspot.id === selectedHotspotId ? null : hotspot.id)}
            >
              <div
                className="w-full h-full border-2 border-blue-500/50 rounded transition-colors hover:border-blue-500"
                style={{
                  backgroundColor: selectedHotspotId === hotspot.id ? HOTSPOT_COLORS[index % HOTSPOT_COLORS.length] : 'transparent',
                }}
              />
              {/* Title tooltip */}
              {hotspot.title && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {hotspot.title}
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Side panel for editing */}
      {isEditMode && (
        <div className="w-64 flex-shrink-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <HotspotSidePanel
            hotspot={selectedHotspot}
            onTitleChange={handleTitleChange}
            onDelete={() => selectedHotspotId && handleDeleteHotspot(selectedHotspotId)}
            onClose={() => onSelectHotspot(null)}
          />
        </div>
      )}
    </div>
  );
};

export default HotspotEditor;
