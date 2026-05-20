import React, { useState } from 'react';
import { IArticle } from '@modules/articles/lib/interfaces';
import { useDragDrop } from './DragDropContext';

interface IProps {
  article: IArticle;
  position: number;
  section: 'headlines' | 'reports';
  children: React.ReactNode;
  className?: string;
}

const DraggableArticle: React.FC<IProps> = ({
  article,
  position,
  section,
  children,
  className = '',
}) => {
  const { handleDragStart, handleDragEnd, isDragging } = useDragDrop();
  const [isDragStarted, setIsDragStarted] = useState(false);

  const handleDragStartInternal = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
    
    // Create custom drag image
    const dragImage = new Image();
    dragImage.src = article.coverImage;
    dragImage.style.width = '150px';
    dragImage.style.height = '100px';
    dragImage.style.objectFit = 'cover';
    dragImage.style.borderRadius = '8px';
    dragImage.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    
    setTimeout(() => {
      e.dataTransfer.setDragImage(dragImage, 75, 50);
    }, 0);
    
    setIsDragStarted(true);
    
    handleDragStart({
      id: article.id.toString(),
      article,
      sourceSection: section,
      sourcePosition: position,
    });
  };

  const handleDragEndInternal = () => {
    setIsDragStarted(false);
    handleDragEnd();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStartInternal}
      onDragEnd={handleDragEndInternal}
      className={`relative cursor-move transition-all duration-300 ease-out ${
        isDragging 
          ? 'opacity-40 scale-95 rotate-2 z-50' 
          : 'hover:scale-[1.02] hover:shadow-xl hover:z-10'
      } ${isDragStarted ? 'scale-95' : ''} ${className}`}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        transform: isDragging ? 'rotate(2deg) scale(0.95)' : 'rotate(0deg) scale(1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isDragging 
          ? '0 20px 40px rgba(0,0,0,0.4)' 
          : '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      {/* Drag handle indicator */}
      <div className={`absolute top-2 right-2 z-10 transition-all duration-200 ${
        isDragging ? 'opacity-100' : 'opacity-0 hover:opacity-100'
      }`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
          section === 'headlines' 
            ? 'bg-orange-500 hover:bg-orange-600' 
            : 'bg-red-500 hover:bg-red-600'
        }`} style={{
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}>
          ☰
        </div>
      </div>
      
      {/* Position badge */}
      <div className={`absolute top-2 left-2 z-10 transition-all duration-200 ${
        isDragging ? 'opacity-100 scale-110' : 'opacity-70 hover:opacity-100'
      }`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
          section === 'headlines' 
            ? 'bg-red-600' 
            : 'bg-red-600'
        }`} style={{
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}>
          {position + 1}
        </div>
      </div>
      
      {children}
      
      {/* Dragging overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-white bg-opacity-20 rounded-lg pointer-events-none" 
             style={{
               backdropFilter: 'blur(2px)',
             }} 
        />
      )}
    </div>
  );
};

export default DraggableArticle;
