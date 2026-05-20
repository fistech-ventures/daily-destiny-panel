import React, { useState } from 'react';
import { Spin } from 'antd';
import { IArticle } from '@modules/articles/lib/interfaces';
import DraggableArticle from './DraggableArticle';
import DropZone from './DropZone';
import { useDragDrop } from './DragDropContext';

interface IProps {
  isLoading: boolean;
  data: IArticle[];
}

const SpecialReports: React.FC<IProps> = ({ isLoading, data }) => {
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);
  const { draggedItem } = useDragDrop();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  const handleDrop = () => {
    setDragOverPosition(null);
  };

  const mainArticle = data && data.length > 0 && typeof data[0] === 'object' ? data[0] : null;
  const sideArticles = data && data.length > 1 ? data.slice(1, 10).filter(article => typeof article === 'object') : [];

  return (
    <div className="mb-12 rounded-xl p-2" style={{ backgroundColor: '#eebbb9' }}>
      <div className="flex items-center mb-3 px-2">
        <div className="w-1.5 h-7 bg-red-600 mr-3 rounded-sm"></div>
        <h2 className="text-xl font-bold text-gray-900">বিশেষ প্রতিবেদন</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Main Article (Left with overlay) */}
        {mainArticle && (
          <DropZone
            position={0}
            section="reports"
            onDrop={handleDrop}
            isOver={draggedItem?.sourceSection !== 'reports' && dragOverPosition === 0}
            className="lg:col-span-5"
          >
            <DraggableArticle
              article={mainArticle}
              position={0}
              section="reports"
              className="rounded-lg shadow-sm border-2 border-red-500"
            >
              <img
                src={mainArticle.coverImage}
                alt={mainArticle.title}
                className="w-full! aspect-video! object-contain"
              />
              <div
                className="p-2 md:p-3"
                style={{ backgroundColor: 'rgba(195, 0, 22, 0.9)' }}
              >
                <h3 className="text-lg md:text-xl font-bold text-white mb-1 leading-snug line-clamp-3">
                  {mainArticle.title}
                </h3>
                <p className="text-white/90 text-sm line-clamp-4">{mainArticle.excerpt}</p>
              </div>
            </DraggableArticle>
          </DropZone>
        )}

        {/* Side List (Right) */}
        <div className="lg:col-span-7 flex flex-col gap-5 justify-between">
          {sideArticles.map((article, index) => (
            <DropZone
              key={article.id}
              position={index + 1}
              section="reports"
              onDrop={handleDrop}
              isOver={draggedItem?.sourceSection !== 'reports' && dragOverPosition === index + 1}
            >
              <DraggableArticle
                article={article}
                position={index + 1}
                section="reports"
                className="flex flex-row gap-4"
              >
                <div className="flex-shrink-0 w-28 h-18 md:w-32 md:h-20 overflow-hidden rounded-md shadow-sm">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-contain"
                    style={{ height: 80 }}
                  />
                </div>
                <div className="flex flex-col flex-grow justify-center">
                  <h3 className="text-base font-bold text-gray-900 mb-1 leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-700 text-xs md:text-sm line-clamp-2">{article.excerpt}</p>
                </div>
              </DraggableArticle>
            </DropZone>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecialReports;
