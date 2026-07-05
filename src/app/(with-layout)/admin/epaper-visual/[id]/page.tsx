'use client';

import PageHeader from '@base/components/PageHeader';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import EpaperViewer from '@modules/epaper-visual/components/EpaperViewer';
import PageList from '@modules/epaper-visual/components/PageList';
import { EpaperVisualHooks } from '@modules/epaper-visual/lib/hooks';
import { message, Spin } from 'antd';
import dayjs from 'dayjs';
import { useParams, useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';


const EditionDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [messageApi, messageHolder] = message.useMessage();
  const [activePageId, setActivePageId] = useState<string | null>(null);

  const editionQuery = EpaperVisualHooks.useFindEditionById({
    id,
    config: {
      enabled: !!id,
    },
  });

  const addPageFn = EpaperVisualHooks.useAddPage({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }
        messageApi.success('Page added successfully');
      },
    },
  });

  const edition = editionQuery.data?.data;

  // Sort pages by pageNumber
  const sortedPages = useMemo(
    () => (edition?.pages ? [...edition.pages].sort((a, b) => a.pageNumber - b.pageNumber) : []),
    [edition?.pages],
  );

  // Set active page when pages load
  React.useEffect(() => {
    if (sortedPages.length > 0 && !activePageId) {
      setActivePageId(sortedPages[0].id);
    }
  }, [sortedPages, activePageId]);

  // Handle page not found scenario
  React.useEffect(() => {
    if (activePageId && !sortedPages.find((p) => p.id === activePageId)) {
      setActivePageId(sortedPages[0]?.id || null);
    }
  }, [activePageId, sortedPages]);

  const activePage = sortedPages.find((p) => p.id === activePageId) || null;

  const handleAddPage = (payload: { pageNumber: number; imageUrl: string }) => {
    addPageFn.mutate({
      editionId: id,
      data: payload,
    });
  };

  return (
    <React.Fragment>
      {messageHolder}
      <PageHeader
        title={
          edition
            ? `Edition - ${dayjs(edition.publishDate).format('DD MMMM YYYY')}`
            : 'Loading...'
        }
        subTitle={
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back to Editions
          </button>
        }
        tags={
          edition
            ? [
                <span
                  key="status"
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    edition.status === 'published'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}
                >
                  {edition.status?.toUpperCase()}
                </span>,
                <span key="pages" className="text-xs text-gray-500">
                  {sortedPages.length} {sortedPages.length === 1 ? 'page' : 'pages'}
                </span>,
              ]
            : []
        }
      />

      {editionQuery.isLoading ? (
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      ) : edition ? (
        <div className="flex gap-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
          {/* Left sidebar - Page thumbnails */}
          <div className="w-56 shrink-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <PageList
              pages={sortedPages}
              activePageId={activePageId}
              onSelectPage={setActivePageId}
              onAddPage={handleAddPage}
              isAddingPage={addPageFn.isPending}
              editionDate={edition?.publishDate}
            />
          </div>

          {/* Right main area - Epaper viewer */}
          <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-hidden">
            {activePage ? (
              <EpaperViewer key={activePage.id} page={activePage} />
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-400">
                <div className="text-center">
                  <p className="text-lg mb-2">No pages yet</p>
                  <p className="text-sm">Click "Add Page" in the sidebar to add your first page</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-96 text-gray-400">
          Edition not found
        </div>
      )}
    </React.Fragment>
  );
};

export default WithAuthorization(EditionDetailPage, { allowedAccess: ['epaper-visual:read'] });
