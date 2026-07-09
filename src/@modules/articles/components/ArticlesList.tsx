import BaseModalWithoutClicker from '@base/components/BaseModalWithoutClicker';
import ConfirmationDialog from '@base/components/ConfirmationDialog';
import CustomSwitch from '@base/components/CustomSwitch';
import DragSortableTable from '@base/components/DragSortableTable';
import { getAccess } from '@modules/auth/lib/utils/client';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Form, Table, Tag, message, Dropdown, Image } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import { AiFillEdit, AiOutlineEye, AiFillDelete } from 'react-icons/ai';
import { BiDotsVerticalRounded } from 'react-icons/bi';
import { ENUM_ARTICLES_STATUS_TYPES } from '../lib/enums';
import { ArticlesHooks } from '../lib/hooks';
import { IArticle } from '../lib/interfaces';
import ArticlesStatusForm from './ArticlesStatusForm';
import { useRouter } from 'next/navigation';

const getYouTubeEmbedUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    let videoId = '';
    if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v') || '';
    } else if (urlObj.hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.slice(1);
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
};

interface ArticlePreviewProps {
  article?: IArticle | null;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({ article }) => {
  if (!article) return null;

  const mediaUrl = article?.medias?.[0]?.url;
  const mediaSource = article?.medias?.[0]?.source;
  const embedUrl = mediaSource === 'youtube' && mediaUrl ? getYouTubeEmbedUrl(mediaUrl) : null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return (
        <>
          <span>{d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span>, {d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</span>
        </>
      );
    } catch {
      return null;
    }
  };

  return (
    <div className="w-full">
      {/* Print header */}
      <div className="hidden print:flex print-header items-center justify-between border-b-2 border-red-600 pb-2 mb-3">
        <div className="flex items-center">
          <img width={200} height={200} src="/images/logo.png" alt="Prime TV" className="w-16 h-16 object-contain" />
        </div>
        <div className="text-right text-xs text-gray-500 flex flex-col justify-center">
          {article?.date && (
            <p>{new Date(article.date).toLocaleDateString('bn-BD')}</p>
          )}
          <p>{article?.category?.titleBn || ''}</p>
        </div>
      </div>

      <div id="article-content" className="px-4 py-8 bg-background rounded-md">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-6">{article.title}</h1>

        {(article?.author || article?.category) && (
          <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600 text-sm md:text-base">
              {article?.author?.nameBn && (
                <span className="font-semibold text-primary">{article.author.nameBn}</span>
              )}
              {article?.author?.nameBn && (article?.categories?.length || article?.category) && <span>|</span>}
              {(article?.categories?.length > 0) && (
                <span>{article.categories.map((c) => c?.titleBn || c?.title).join(', ')}</span>
              )}
              {!article?.categories?.length && article?.category?.titleBn && (
                <span>{article.category.titleBn}</span>
              )}
            </div>
            {article?.date && (
              <div className="text-gray-500 text-sm">
                {formatDate(article.date)}
              </div>
            )}
          </div>
        )}

        {/* Video player */}
        {article.type !== 'photo' && embedUrl && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
            <iframe
              src={embedUrl}
              title={article.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
        {article.type !== 'photo' && mediaSource === 'do-space' && mediaUrl && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4 bg-black">
            <video
              src={mediaUrl}
              controls
              className="w-full h-full"
              poster={article?.coverImage || undefined}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Photo gallery for photo articles */}
        {article.type === 'photo' && article?.medias?.length > 0 && (
          <div className="space-y-8 mb-6">
            {article.medias.map((media, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className="relative w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={media.url}
                    alt={media.caption || `Photo ${idx + 1}`}
                    className="w-full h-auto object-contain max-h-[500px]"
                    loading="lazy"
                  />
                </div>
                {media.caption && (
                  <p className="text-sm text-gray-500 italic text-center">{media.caption}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Fallback cover image when no video */}
        {article.type !== 'photo' && !embedUrl && mediaSource !== 'do-space' && article?.coverImage && (
          <div className="relative w-full aspect-video object-cover rounded-lg overflow-hidden mb-4 print:max-h-87.5">
            <img src={article.coverImage} alt={article.title} className="w-full object-cover" />
          </div>
        )}

        {(article?.categories?.length || article?.category?.titleBn || article?.author?.nameBn) && !embedUrl && mediaSource !== 'do-space' && article.type !== 'photo' && (
          <p className="text-sm text-gray-500 mb-6">
            {[
              article?.categories?.length
                ? article.categories.map((c) => c?.titleBn || c?.title).join(', ')
                : article?.category?.titleBn,
              article?.author?.nameBn
            ].filter(Boolean).join(' | ')}
          </p>
        )}

        {article?.details && article.type !== 'photo' && (
          <article
            className="prose article-body text-lg prose-lg max-w-none text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.details }}
          />
        )}
      </div>
    </div>
  );
};

interface IProps {
  isLoading: boolean;
  data: IArticle[];
  pagination: PaginationProps;
  pageType?: 'featured' | 'exclusive' | 'default' | 'drafted' | 'archived' | 'video' | 'photo';
  meta?: {
    page: number;
    limit: number;
    total: number;
    skip: number;
  };
}

const ArticlesList: React.FC<IProps> = ({ isLoading, data, pagination, pageType = 'default', meta }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const router = useRouter();
  const [updateStatusItem, setUpdateStatusItem] = useState<IArticle>(null);
  const [previewItem, setPreviewItem] = useState<IArticle>(null);
  const isUpdatingRef = useRef(false);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: '', content: '', onConfirm: () => {} });

  const articleUpdateFn = ArticlesHooks.useUpdate({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        setUpdateStatusItem(null);
        if (!isUpdatingRef.current) {
          messageApi.success(res.message);
        }
      },
    },
  });

  const articleDeleteFn = ArticlesHooks.useDelete({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }
        messageApi.success(res.message);
      },
    },
  });

  const handleDragEnd = (newData: any[], oldData: any[], activeId?: any) => {
    if (!meta) {
      messageApi.warning('Pagination metadata is required for drag and drop functionality');
      return;
    }

    getAccess(['articles:update'], () => {
      if (!activeId) {
        messageApi.warning('Could not identify the dragged article');
        return;
      }

      // Find the dragged article in the new data
      const draggedIndex = newData.findIndex((item: any) => item.id === activeId);
      if (draggedIndex === -1) {
        messageApi.warning('Could not find the dragged article in the list');
        return;
      }

      // Calculate the new position (1-based global position across pages)
      const newPosition = (meta.page - 1) * meta.limit + draggedIndex + 1;

      isUpdatingRef.current = true;

      // Single API call - only update the dragged article's position
      articleUpdateFn.mutateAsync({
        id: activeId,
        data: { position: newPosition },
      })
        .then((res) => {
          if (res.success) {
            messageApi.success('Position updated successfully');
          } else {
            messageApi.error(res.message || 'Failed to update position');
          }
        })
        .catch((error) => {
          messageApi.error('Failed to update position');
          console.error('Position update error:', error);
        })
        .finally(() => {
          isUpdatingRef.current = false;
        });
    });
  };

  const dataSource = data?.map((elem) => ({
    key: elem?.id,
    id: elem?.id,
    coverImage: elem?.coverImage,
    title: elem?.title,
    code: elem?.code,
    categories: elem?.categories,
    category: elem?.category,
    modified: {
      author: elem?.author?.name,
      createdBy: elem?.createdBy?.fullName,
      updatedBy: elem?.updatedBy?.fullName,
      publishedBy: elem?.publishedBy?.fullName,
    },
    status: elem?.status,
    date: elem?.date,
    isActive: elem?.isActive,
    isFeatured: elem?.isFeatured,
    isExclusive: elem?.isExclusive,
    position: elem?.position,
    createdAt: elem?.createdAt,
    updatedAt: elem?.updatedAt,
    medias: elem?.medias,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: 'coverImage',
      dataIndex: 'coverImage',
      title: 'Cover Image',
      width: 100,
      render: (coverImage, record) => {
        let src = coverImage || '/images/placeholder.svg';

        if (pageType === 'video') {
          const medias = record?.medias;
          const videoSource = medias?.[0]?.source;
          const videoUrl = medias?.[0]?.url;

          if (videoSource === 'youtube' && videoUrl) {
            try {
              const urlObj = new URL(videoUrl);
              let videoId = '';
              if (urlObj.hostname.includes('youtube.com')) {
                videoId = urlObj.searchParams.get('v') || '';
              } else if (urlObj.hostname.includes('youtu.be')) {
                videoId = urlObj.pathname.slice(1);
              }
              if (videoId) {
                src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }
            } catch (e) {
              console.error(e);
            }
          } else if (videoSource === 'do-space') {
            src = coverImage || '/images/placeholder.svg';
          } else {
            src = '/images/placeholder.svg';
          }
        } else if (pageType === 'photo') {
          const photoUrl = record?.medias?.[0]?.url;
          src = photoUrl || coverImage || '/images/placeholder.svg';
        }

        return (
          <Image
            src={src}
            alt="Cover"
            width={100}
            height={60}
            preview
            style={{ objectFit: 'contain', borderRadius: '4px' }}
            fallback="/images/placeholder.svg"
          />
        );
      },
    },
    {
      key: 'title',
      dataIndex: 'title',
      title: 'Title',
      width: 300,
    },
    {
      key: 'code',
      dataIndex: 'code',
      title: 'Code',
    },
    {
      key: 'categories',
      dataIndex: 'categories',
      title: 'Categories',
      width: 200,
      render: (categories, record) => {
        const cats = categories?.length ? categories : (record?.category ? [record.category] : []);
        return (
          <div className="flex flex-col gap-1">
            {cats?.map((cat) => (
              <Tag key={cat?.id} className="!mr-1 !mb-1">
                {cat?.title || cat?.titleBn}
              </Tag>
            ))}
          </div>
        );
      },
    },
    // {
    //   key: 'Modified',
    //   dataIndex: 'modified',
    //   title: 'Modified',
    //   width: 170,
    //   render: (modified) => (
    //     <div className="flex flex-col gap-1">
    //       <span>
    //         A: <b>{modified?.author}</b>
    //       </span>
    //       <span>
    //         C: <b>{modified?.createdBy}</b>
    //       </span>
    //       <span>
    //         P: <b>{modified?.publishedBy}</b>
    //       </span>
    //     </div>
    //   ),
    // },
    {
      key: 'date',
      dataIndex: 'date',
      title: pageType === 'video' ? 'Video URL' : pageType === 'photo' ? 'Photo URL' : 'Date',
      render: (date, record) => {
        if (pageType === 'video' || pageType === 'photo') {
          const mediaUrl = record?.medias?.[0]?.url;
          return mediaUrl ? (
            <a
              href={mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all"
            >
              {mediaUrl.length > 50
                ? `${mediaUrl.substring(0, 50)}...`
                : mediaUrl}
            </a>
          ) : (
            <span className="text-gray-400">—</span>
          );
        }
        return (
          <div className="flex flex-col gap-1">
            <span>{dayjs(date).format('DD.MM.YYYY')}</span>
            <span>{dayjs(date).format('HH:mm a')}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      dataIndex: 'status',
      title: 'Status',
      render: (status) => {
        const statusColorMap = {
          [ENUM_ARTICLES_STATUS_TYPES.Published]: 'success',
          [ENUM_ARTICLES_STATUS_TYPES.Drafted]: 'default',
          [ENUM_ARTICLES_STATUS_TYPES.Archived]: 'processing',
        };

        const color = statusColorMap[status] || 'default';

        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      key: 'isActive',
      dataIndex: 'isActive',
      title: 'Active',
      render: (isActive, record) => {
        return (
          <CustomSwitch
            checked={isActive}
            onChange={(checked) => {
              getAccess(['articles:update'], () => {
                const action = checked ? 'activate' : 'deactivate';
                setConfirmationDialog({
                  open: true,
                  title: `${action.charAt(0).toUpperCase() + action.slice(1)} Article`,
                  content: `Are you sure you want to ${action} "${record.title}"?`,
                  onConfirm: () => {
                    articleUpdateFn.mutate({
                      id: record?.id,
                      data: {
                        isActive: checked,
                      },
                    });
                    setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} });
                  },
                });
              });
            }}
          />
        );
      },
    },
    ...(pageType === 'featured' || pageType === 'default' ? [{
      key: 'isFeatured',
      dataIndex: 'isFeatured',
      title: 'Featured',
      render: (isFeatured, record) => {
        return (
          <CustomSwitch
            checked={isFeatured}
            onChange={(checked) => {
              getAccess(['articles:update'], () => {
                const action = checked ? 'feature' : 'unfeature';
                setConfirmationDialog({
                  open: true,
                  title: `${action.charAt(0).toUpperCase() + action.slice(1)} Article`,
                  content: `Are you sure you want to ${action} "${record.title}"?`,
                  onConfirm: () => {
                    articleUpdateFn.mutate({
                      id: record?.id,
                      data: {
                        isFeatured: checked,
                        position: checked ? (typeof record.position === 'string' ? parseInt(record.position, 10) : (record.position || 0)) : 0,
                      },
                    });
                    setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} });
                  },
                });
              });
            }}
          />
        );
      },
    }] : []),
    ...(pageType === 'exclusive' || pageType === 'default' ? [{
      key: 'isExclusive',
      dataIndex: 'isExclusive',
      title: 'Lead',
      render: (isExclusive, record) => {
        return (
          <CustomSwitch
            checked={isExclusive}
            onChange={(checked) => {
              getAccess(['articles:update'], () => {
                const action = checked ? 'mark as Lead' : 'remove from lead';
                setConfirmationDialog({
                  open: true,
                  title: `${action.charAt(0).toUpperCase() + action.slice(1)} Article`,
                  content: `Are you sure you want to ${action} "${record.title}"?`,
                  onConfirm: () => {
                    articleUpdateFn.mutate({
                      id: record?.id,
                      data: {
                        isExclusive: checked,
                        position: checked ? (typeof record.position === 'string' ? parseInt(record.position, 10) : (record.position || 0)) : 0,
                      },
                    });
                    setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} });
                  },
                });
              });
            }}
          />
        );
      },
    }] : []),
    {
      key: 'id',
      dataIndex: 'id',
      title: 'Action',
      align: 'center',
      width: 100,
      render: (id) => {
        const item = data?.find((item) => item.id === id);

        const menuItems = [
          {
            key: 'edit',
            label: 'Edit',
            icon: <AiFillEdit />,
            onClick: () => {
              getAccess(['articles:update'], () => {
                const fromParam = pageType !== 'default' ? `?from=${pageType}` : '';
                router.push(`/admin/articles/edit/${item.id}${fromParam}`);
              });
            },
          },
          {
            key: 'preview',
            label: 'Preview',
            icon: <AiOutlineEye />,
            onClick: () => {
              setPreviewItem(item);
            },
          },
          {
            key: 'status',
            label: 'Change Status',
            onClick: () => {
              getAccess(['articles:change-status'], () => {
                setUpdateStatusItem(item);
              });
            },
          },
          {
            key: 'delete',
            label: 'Delete',
            icon: <AiFillDelete />,
            onClick: () => {
              getAccess(['articles:delete'], () => {
                if (item.status === ENUM_ARTICLES_STATUS_TYPES.Published) {
                  messageApi.warning('Published article can\'t be deleted. Make it drafted or archived to delete.');
                  return;
                }
                setConfirmationDialog({
                  open: true,
                  title: 'Delete Article',
                  content: `Are you sure you want to delete "${item.title}"?`,
                  onConfirm: () => {
                    articleDeleteFn.mutate(item.id);
                    setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} });
                  },
                });
              });
            },
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<BiDotsVerticalRounded className="text-lg" />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <React.Fragment>
      {messageHolder}
      {meta ? (
        <DragSortableTable
          loading={isLoading}
          dataSource={dataSource}
          columns={columns}
          pagination={pagination}
          scroll={{ x: true }}
          onDragEnd={handleDragEnd}
        />
      ) : (
        <Table
          loading={isLoading}
          dataSource={dataSource}
          columns={columns}
          pagination={pagination}
          scroll={{ x: true }}
        />
      )}
      <BaseModalWithoutClicker
        width={640}
        title={`Update ${updateStatusItem?.title}`}
        open={!!updateStatusItem?.id}
        onCancel={() => setUpdateStatusItem(null)}
        footer={null}
      >
        <ArticlesStatusForm
          form={formInstance}
          initialValues={{
            status: updateStatusItem?.status,
            date: updateStatusItem?.date,
          }}
          isLoading={articleUpdateFn.isPending}
          onFinish={(values) =>
            articleUpdateFn.mutate({
              id: updateStatusItem?.id,
              data: values,
            })
          }
        />
      </BaseModalWithoutClicker>
      <BaseModalWithoutClicker
        width={900}
        title={`Preview - ${previewItem?.title}`}
        open={!!previewItem?.id}
        onCancel={() => setPreviewItem(null)}
        footer={null}
      >
        <ArticlePreview article={previewItem} />
      </BaseModalWithoutClicker>
      <ConfirmationDialog
        open={confirmationDialog.open}
        title={confirmationDialog.title}
        content={confirmationDialog.content}
        onConfirm={confirmationDialog.onConfirm}
        onCancel={() => setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} })}
      />
    </React.Fragment>
  );
};

export default ArticlesList;
