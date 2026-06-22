import { Button, message, Spin } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Hotspot } from '../lib/interfaces';
import { EpaperVisualHooks } from '../lib/hooks';
import HotspotEditor from './HotspotEditor';

interface PageItem {
  id: string;
  pageNumber: number;
  imageUrl: string;
  hotspots: Hotspot[];
}

interface IProps {
  page: PageItem;
}

const EpaperViewer: React.FC<IProps> = ({ page }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [isEditMode, setIsEditMode] = useState(false);
  const [hotspots, setHotspots] = useState<Hotspot[]>(page.hotspots || []);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const saveHotspotsFn = EpaperVisualHooks.useSaveHotspots({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }
        messageApi.success('Hotspots saved successfully');
        setHasUnsavedChanges(false);
      },
      onError: () => {
        messageApi.error('Failed to save hotspots');
      },
    },
  });

  // Sync hotspots when page changes
  useEffect(() => {
    setHotspots(page.hotspots || []);
    setSelectedHotspotId(null);
    setHasUnsavedChanges(false);
    setIsEditMode(false);
  }, [page.id, page.hotspots]);

  // Get image natural dimensions on load
  useEffect(() => {
    if (imgRef.current) {
      const updateDimensions = () => {
        if (imgRef.current) {
          setImageDimensions({
            width: imgRef.current.naturalWidth,
            height: imgRef.current.naturalHeight,
          });
        }
      };

      if (imgRef.current.complete) {
        updateDimensions();
      } else {
        imgRef.current.onload = updateDimensions;
      }
    }
  }, [page.imageUrl]);

  const handleHotspotsChange = useCallback((updatedHotspots: Hotspot[]) => {
    setHotspots(updatedHotspots);
    setHasUnsavedChanges(true);
  }, []);

  const handleSaveHotspots = useCallback(() => {
    const payload = {
      pageId: page.id,
      hotspots: hotspots.map((h) => ({
        title: h.title || undefined,
        coordinates: h.coordinates,
      })),
    };
    saveHotspotsFn.mutate(payload);
  }, [page.id, hotspots, saveHotspotsFn]);

  const handleToggleMode = useCallback(() => {
    if (isEditMode) {
      // Switching to view mode - check for unsaved changes
      if (hasUnsavedChanges) {
        // Discard changes by reverting
        setHotspots(page.hotspots || []);
        setHasUnsavedChanges(false);
      }
      setSelectedHotspotId(null);
    }
    setIsEditMode((prev) => !prev);
  }, [isEditMode, hasUnsavedChanges, page.hotspots]);

  if (!page.imageUrl) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No page selected or image not available
      </div>
    );
  }

  return (
    <React.Fragment>
      {messageHolder}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Page {page.pageNumber}</span>
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type={isEditMode ? 'default' : 'primary'}
            onClick={handleToggleMode}
          >
            {isEditMode ? 'View Mode' : 'Edit Hotspots'}
          </Button>
          {isEditMode && (
            <>
              <Button
                type="primary"
                loading={saveHotspotsFn.isPending}
                onClick={handleSaveHotspots}
                disabled={!hasUnsavedChanges}
              >
                Save Hotspots
              </Button>
              {hasUnsavedChanges && (
                <Button onClick={() => {
                  setHotspots(page.hotspots || []);
                  setHasUnsavedChanges(false);
                  setSelectedHotspotId(null);
                }}>
                  Discard
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Editor */}
      {imageDimensions.width > 0 ? (
        <HotspotEditor
          imageUrl={page.imageUrl}
          imageWidth={imageDimensions.width}
          imageHeight={imageDimensions.height}
          hotspots={hotspots}
          isEditMode={isEditMode}
          onHotspotsChange={handleHotspotsChange}
          selectedHotspotId={selectedHotspotId}
          onSelectHotspot={setSelectedHotspotId}
        />
      ) : (
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      )}

      {/* Hidden image to get natural dimensions */}
      <img
        ref={imgRef}
        src={page.imageUrl}
        alt=""
        className="hidden"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/images/not_found.jpg';
        }}
      />
    </React.Fragment>
  );
};

export default EpaperViewer;
