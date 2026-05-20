import React, { useState } from 'react';
import { useDragDrop } from './DragDropContext';

interface IProps {
  onDrop: (position: number) => void;
  position: number;
  section: 'headlines' | 'reports';
  children: React.ReactNode;
  className?: string;
  isOver?: boolean;
}

const DropZone: React.FC<IProps> = ({
  onDrop,
  position,
  section,
  children,
  className = '',
}) => {
  const { draggedItem, handleDrop: handleContextDrop } = useDragDrop();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDropInternal = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (draggedItem) {
      handleContextDrop(section, position);
      onDrop(position);
    }
  };

  const shouldShowDropIndicator = isDragOver && draggedItem && 
    draggedItem.sourceSection === section && draggedItem.sourcePosition !== position;

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDropInternal}
      className={`relative transition-all duration-300 ease-in-out ${
        shouldShowDropIndicator 
          ? section === 'headlines' 
            ? 'ring-2 ring-orange-400 ring-opacity-60 bg-orange-50 scale-[1.02] shadow-lg' 
            : 'ring-2 ring-red-400 ring-opacity-60 bg-red-50 scale-[1.02] shadow-lg'
          : ''
      } ${className}`}
      style={{
        transform: shouldShowDropIndicator ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
      {shouldShowDropIndicator && (
        <div className={`absolute inset-0 pointer-events-none rounded-lg ${
          section === 'headlines' 
            ? 'bg-orange-100 bg-opacity-30 border-2 border-orange-400 border-dashed' 
            : 'bg-red-100 bg-opacity-30 border-2 border-red-400 border-dashed'
        }`} style={{
          animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-2xl font-bold ${
              section === 'headlines' ? 'text-orange-600' : 'text-red-600'
            }`} style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
              {position + 1}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropZone;
