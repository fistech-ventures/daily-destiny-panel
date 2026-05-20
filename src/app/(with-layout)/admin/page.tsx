'use client';

import React, { useState } from 'react';
import { ArticlesHooks } from '@modules/articles/lib/hooks';
import TodayHeadlines from './components/TodayHeadlines';
import SpecialReports from './components/SpecialReports';
import { DragDropProvider } from './components/DragDropContext';
import { IArticle } from '@modules/articles/lib/interfaces';

const DashboardPage = () => {
  const [headlinesData, setHeadlinesData] = useState<IArticle[]>([]);
  const [reportsData, setReportsData] = useState<IArticle[]>([]);

  const todayHeadlinesQuery = ArticlesHooks.useFind({
    options: {
      page: 1,
      limit: 3,
      isExclusive: true,
      sortBy: "position",
      sortOrder: 'ASC',
    },
  });

  const specialReportsQuery = ArticlesHooks.useFind({
    options: {
      page: 1,
      limit: 10,
      isFeatured: true,
      sortBy: 'position',
      sortOrder: 'ASC',
    },
  });

  // Update local state when query data changes (but not after local updates)
  React.useEffect(() => {
    if (todayHeadlinesQuery.data?.data) {
      setHeadlinesData(todayHeadlinesQuery.data.data);
    }
  }, [todayHeadlinesQuery.data?.data]);

  React.useEffect(() => {
    if (specialReportsQuery.data?.data) {
      setReportsData(specialReportsQuery.data.data);
    }
  }, [specialReportsQuery.data?.data]);

  return (
    <DragDropProvider
      headlinesData={headlinesData}
      reportsData={reportsData}
      onHeadlinesUpdate={setHeadlinesData}
      onReportsUpdate={setReportsData}
    >
      <div className="p-4 md:p-6 grid grid-cols-2 gap-4">
        <TodayHeadlines
          isLoading={todayHeadlinesQuery.isLoading}
          data={headlinesData}
        />
        <SpecialReports
          isLoading={specialReportsQuery.isLoading}
          data={reportsData}
        />
      </div>
    </DragDropProvider>
  );
};

export default DashboardPage;
