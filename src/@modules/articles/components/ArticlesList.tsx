import BaseModalWithoutClicker from '@base/components/BaseModalWithoutClicker';
import ConfirmationDialog from '@base/components/ConfirmationDialog';
import CustomSwitch from '@base/components/CustomSwitch';
import DragSortableTable from '@base/components/DragSortableTable';
import { getAccess } from '@modules/auth/lib/utils/client';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Form, Table, Tag, message, Dropdown, Image } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import { AiFillEdit, AiOutlineEye, AiFillDelete, AiOutlinePrinter, AiOutlineLink, AiOutlineX } from 'react-icons/ai';
import { BiDotsVerticalRounded } from 'react-icons/bi';
import { FaFacebook, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { ENUM_ARTICLES_STATUS_TYPES } from '../lib/enums';
import { ArticlesHooks } from '../lib/hooks';
import { IArticle } from '../lib/interfaces';
import ArticlesStatusForm from './ArticlesStatusForm';
import { useRouter } from 'next/navigation';
import { enrichArticleBodyWithCards } from '../lib/article-embeds';

const getArticleCategory = (article: IArticle) => {
  if (article?.categories?.length > 0) {
    return article.categories[0];
  }
  return article?.category;
};

const formatBdTime = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('bn-BD', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
};

interface ArticlePreviewProps {
  article?: IArticle | null;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({ article }) => {
  const [enrichedBody, setEnrichedBody] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setEnrichedBody(null);

    if (article?.details) {
      enrichArticleBodyWithCards(article.details)
        .then((html) => {
          if (!cancelled) setEnrichedBody(html);
        })
        .catch(() => {
          if (!cancelled) setEnrichedBody(article.details);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [article]);

  if (!article) return null;

  const category = getArticleCategory(article);

  const handleShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
    x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`,
  };

  return (
    <div className="w-full">
      {/* Print header */}
      <div className="hidden print:flex print-header justify-center border-b border-gray-200 pb-2 mb-0">
        <img
          width={200}
          height={200}
          src="/images/logo.png"
          alt="Daily Destiny"
          className="w-24 h-16 object-contain"
        />
      </div>

      <div id="article-content" className="px-2 lg:px-4 print:px-0 py-8 bg-background rounded-md">
        <h1 className="text-sm md:text-base font-bold text-blue-700 leading-tight mb-2 lg:mb-6">
          {article.shoulder}
        </h1>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-2 lg:mb-6">
          {article.title}
        </h1>

        <div className="flex print:flex-row print:justify-between flex-col gap-2 border-b border-gray-200 pb-4 mb-6">
          <div className="flex items-center gap-2 text-gray-600 text-sm md:text-base">
            <span className="font-semibold text-primary">
              {article.author?.nameBn ?? article.author?.name ?? ''}
            </span>
            <span>|</span>
            <span>
              {category?.titleBn ?? category?.title ?? ''}
            </span>
          </div>
          <div className="text-gray-500 text-sm">
            {formatBdTime(article.date)}
          </div>
        </div>

        {/* Cover image */}
        {article?.coverImage && (
          <>
            <div className="relative w-full aspect-video object-contain rounded-lg overflow-hidden mb-4 print:max-h-87.5">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-contain"
              />
            </div>
            {article.coverImageCredit && (
              <p className="text-sm text-gray-500 mb-2 lg:mb-6">{article.coverImageCredit}</p>
            )}
          </>
        )}

        <hr className="print:block hidden print:mb-4" />

        {/* Social Share */}
        <div className="print:hidden">
          <div className="flex items-center gap-4 mb-4 py-4 border-y border-gray-100">
            {/* Facebook */}
            <button
              onClick={() => handleShare(shareLinks.facebook)}
              className="p-2 lg:p-3 rounded-full bg-brand-light text-brand hover-bg-brand transition-all cursor-pointer"
              title="Share on Facebook"
            >
              <FaFacebook size={20} />
            </button>

            {/* X (Twitter) */}
            <button
              onClick={() => handleShare(shareLinks.x)}
              className="p-2 lg:p-3 rounded-full bg-brand-light text-brand hover-bg-brand transition-all cursor-pointer"
              title="Share on X"
            >
              <AiOutlineX size={16} />
            </button>

            {/* LinkedIn */}
            <button
              onClick={() => handleShare(shareLinks.linkedin)}
              className="p-2 lg:p-3 rounded-full bg-brand-light text-brand hover-bg-brand transition-all cursor-pointer"
              title="Share on LinkedIn"
            >
              <FaLinkedin size={20} />
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => handleShare(shareLinks.whatsapp)}
              className="p-2 lg:p-3 rounded-full bg-brand-light text-brand hover-bg-brand transition-all cursor-pointer"
              title="Share on WhatsApp"
            >
              <FaWhatsapp size={20} />
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="p-2 lg:p-3 rounded-full bg-brand-light text-brand hover-bg-brand transition-all cursor-pointer"
              title="Print Article"
            >
              <AiOutlinePrinter size={20} />
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="p-2 lg:p-3 rounded-full bg-brand-light text-brand hover-bg-brand transition-all cursor-pointer"
              title="Copy Link"
            >
              <AiOutlineLink size={20} />
            </button>
          </div>
        </div>

        {/* Article body */}
        {article?.details && article.type !== 'photo' && (
          <article
            className="prose article-body text-xl prose-xl max-w-none text-gray-800 leading-normal whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: enrichedBody ?? article.details }}
          />
        )}

        {/* Tags */}
        {article?.tags && article.tags.length > 0 && (
          <div className="no-print flex flex-wrap items-center gap-2 pt-3 lg:pt-6">
            {article.tags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="text-sm font-semibold text-white shrink-0 bg-[#D22331] px-3 py-1 rounded-md inline-block"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Print footer */}
        <div className="hidden print:flex justify-center py-2 border-y mt-10">
          <img src="/images/logo.png" alt="Daily Destiny" className="w-24 h-16 object-contain" />
        </div>
        <div className="hidden print:flex justify-between items-center py-2">
          <p className="text-sm text-gray-500">{article.author?.nameBn ?? article.author?.name ?? ''}</p>
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Daily Destiny</p>
        </div>
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
      const newPosition = (meta.page - 1) * meta.limit + draggedIndex;

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
      width: 150,
      render: (categories, record) => {
        const cats = categories?.length ? categories : (record?.category ? [record.category] : []);
        return (
          <div className="flex flex-col gap-1">
            {cats?.map((cat) => (
              <Tag key={cat?.id} className="mr-1! mb-1!">
                {cat?.title || cat?.titleBn}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      key: 'position',
      dataIndex: 'position',
      title: 'Position',
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
