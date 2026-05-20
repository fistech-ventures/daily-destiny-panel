import React, { createContext, useContext, useState, useCallback } from 'react';
import { message } from 'antd';
import { ArticlesHooks } from '@modules/articles/lib/hooks';
import { IArticle } from '@modules/articles/lib/interfaces';

interface DragItem {
  id: string;
  article: IArticle;
  sourceSection: 'headlines' | 'reports';
  sourcePosition: number;
}

interface DragDropContextType {
  draggedItem: DragItem | null;
  isDragging: boolean;
  handleDragStart: (item: DragItem) => void;
  handleDragEnd: () => void;
  handleDrop: (targetSection: 'headlines' | 'reports', targetPosition: number) => void;
}

const DragDropContext = createContext<DragDropContextType | null>(null);

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within DragDropProvider');
  }
  return context;
};

interface DragDropProviderProps {
  children: React.ReactNode;
  headlinesData: IArticle[];
  reportsData: IArticle[];
  onHeadlinesUpdate: (data: IArticle[]) => void;
  onReportsUpdate: (data: IArticle[]) => void;
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({
  children,
  headlinesData,
  reportsData,
  onHeadlinesUpdate,
  onReportsUpdate,
}) => {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [messageApi, messageHolder] = message.useMessage();
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);

  const articleUpdateFn = ArticlesHooks.useUpdate({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }
        messageApi.success('Position updated successfully');
      },
    },
  });

  const handleDragStart = useCallback((item: DragItem) => {
    setDraggedItem(item);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  const handleDrop = useCallback(async (
    targetSection: 'headlines' | 'reports',
    targetPosition: number
  ) => {
    if (!draggedItem) return;

    const { article, sourceSection, sourcePosition } = draggedItem;

    if (sourceSection !== targetSection) {
      handleDragEnd();
      return;
    }

    if (sourcePosition === targetPosition) {
      handleDragEnd();
      return;
    }

    // Get target article
    const targetData = targetSection === 'headlines' ? headlinesData : reportsData;
    const targetArticle = targetData[targetPosition];

    const now = Date.now();
    
    if (now - lastUpdateTime < 1000) {
      handleDragEnd();
      return;
    }

    try {
      const updates = [
        {
          id: article.id,
          data: {
            position: targetPosition + 1, 
          },
        },
      ];

      // Update target article if it exists
      if (targetArticle) {
        updates.push({
          id: targetArticle.id,
          data: {
            position: sourcePosition + 1,
          },
        });
      }

      if (targetSection === 'headlines') {
        const newHeadlines = [...headlinesData];
        const temp = newHeadlines[sourcePosition];
        newHeadlines[sourcePosition] = newHeadlines[targetPosition];
        newHeadlines[targetPosition] = temp;
        
        // Ensure all positions are unique and sequential
        const fixedHeadlines = newHeadlines.map((article, index) => ({
          ...article,
          position: (index + 1).toString() 
        }));
        
        onHeadlinesUpdate(fixedHeadlines);
      } else {
        const newReports = [...reportsData];
        const temp = newReports[sourcePosition];
        newReports[sourcePosition] = newReports[targetPosition];
        newReports[targetPosition] = temp;
        
        const fixedReports = newReports.map((article, index) => ({
          ...article,
          position: (index + 1).toString() 
        }));
        
        onReportsUpdate(fixedReports);
      }

      setLastUpdateTime(now);
      messageApi.success('Position updated successfully');
    } catch (error) {
      console.error('❌ Update Failed:', error);
      messageApi.error('Failed to update positions');
    }

    handleDragEnd();
  }, [draggedItem, headlinesData, reportsData, onHeadlinesUpdate, onReportsUpdate, handleDragEnd, articleUpdateFn, messageApi]);

  const value: DragDropContextType = {
    draggedItem,
    isDragging: !!draggedItem,
    handleDragStart,
    handleDragEnd,
    handleDrop,
  };

  return (
    <DragDropContext.Provider value={value}>
      {messageHolder}
      {children}
    </DragDropContext.Provider>
  );
};
