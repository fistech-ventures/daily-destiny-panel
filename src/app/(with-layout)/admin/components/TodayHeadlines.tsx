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

const TodayHeadlines: React.FC<IProps> = ({ isLoading, data }) => {
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

  const mainArticle = data[0];
  const sideArticles = data.slice(1, 3);

  return (
    <div className="mb-12">
      <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-3 border-b pb-3">
        আজকের শিরোনাম
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Article (Left Large) */}
        {mainArticle && (
          <DropZone
            position={0}
            section="headlines"
            onDrop={handleDrop}
            isOver={draggedItem?.sourceSection !== 'headlines' && dragOverPosition === 0}
            className="lg:col-span-8"
          >
            <DraggableArticle
              article={mainArticle}
              position={0}
              section="headlines"
              className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col"
            >
              <div className="relative w-full" style={{ paddingTop: '56%' }}>
                <img
                  src={mainArticle.coverImage}
                  alt={mainArticle.title}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
              <div className="p-4 md:p-6 flex flex-col flex-grow">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                  {mainArticle.title}
                </h3>
                <p className="text-gray-600 text-sm md:text-base line-clamp-2">{mainArticle.excerpt}</p>
              </div>
            </DraggableArticle>
          </DropZone>
        )}

        {/* Side Articles (Right Stack) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {sideArticles.map((article, index) => (
            <DropZone
              key={article.id}
              position={index + 1}
              section="headlines"
              onDrop={handleDrop}
              isOver={draggedItem?.sourceSection !== 'headlines' && dragOverPosition === index + 1}
            >
              <DraggableArticle
                article={article}
                position={index + 1}
                section="headlines"
                className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col flex-grow"
              >
                <div className="relative w-full" style={{ paddingTop: '56%' }}>
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{article.excerpt}</p>
                </div>
              </DraggableArticle>
            </DropZone>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodayHeadlines;
