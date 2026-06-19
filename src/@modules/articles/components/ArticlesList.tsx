import BaseModalWithoutClicker from '@base/components/BaseModalWithoutClicker';
import ConfirmationDialog from '@base/components/ConfirmationDialog';
import CustomSwitch from '@base/components/CustomSwitch';
import DragSortableTable, { handleBulkPurifiedDataFn, handleNewOrderedDataFn } from '@base/components/DragSortableTable';
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

interface ArticlePreviewProps {
  article?: IArticle | null;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({ article }) => {
  if (!article) return null;

  return (
    <div className="w-full">
      {/* Print header */}
      <div className="hidden print:flex print-header items-center justify-between border-b-2 border-red-600 pb-2 mb-3">
        <div className="flex items-center">
          <img width={200} height={200} src="/images/logo.png" alt="Prime TV" className="w-16 h-16 object-contain" />
        </div>
        <div className="text-right text-xs text-gray-500 flex flex-col justify-center">
          <p>{new Date(article.date).toLocaleDateString('bn-BD')}</p>
          <p>{article.category.titleBn}</p>
        </div>
      </div>

      <div id="article-content" className="px-4 py-8 bg-background rounded-md">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-6">{article.title}</h1>

        <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-2 text-gray-600 text-sm md:text-base">
            <span className="font-semibold text-primary">{article.author.nameBn}</span>
            <span>|</span>
            <span>{article.category.titleBn}</span>
          </div>
          <div className="text-gray-500 text-sm">
            {new Date(article.date).toLocaleDateString('bn-BD', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
            ,{' '}
            {new Date(article.date).toLocaleTimeString('bn-BD', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        <div className="relative w-full aspect-video object-cover rounded-lg overflow-hidden mb-4 print:max-h-87.5">
          <img src={article.coverImage} alt={article.title} className="w-full object-cover" />
        </div>
        <p className="text-sm text-gray-500 mb-6">
          {article.category.titleBn} | {article.author.nameBn}
        </p>

        <article
          className="prose article-body text-lg prose-lg max-w-none text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.details }}
        />
      </div>
    </div>
  );
};

interface IProps {
  isLoading: boolean;
  data: IArticle[];
  pagination: PaginationProps;
  pageType?: 'featured' | 'exclusive' | 'default' | 'drafted' | 'archived';
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
  const isBulkUpdateRef = useRef(false);
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
        // Only show message if not doing bulk update
        if (!isBulkUpdateRef.current) {
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

  const handleDragEnd = (newData: any[], oldData: any[]) => {
    if (!meta) {
      messageApi.warning('Pagination metadata is required for drag and drop functionality');
      return;
    }

    getAccess(['articles:update'], () => {
      const orderedData = handleNewOrderedDataFn(newData, meta);
      const bulkUpdateData = handleBulkPurifiedDataFn(orderedData, oldData);
      
      if (bulkUpdateData.length === 0) {
        messageApi.info('No position changes detected');
        return;
      }

      isBulkUpdateRef.current = true;

      // Make multiple individual update calls
      const updatePromises = bulkUpdateData.map(item => 
        articleUpdateFn.mutateAsync({
          id: item.id,
          data: { position: item.data.order_priority }
        })
      );

      // Execute all updates
      Promise.all(updatePromises)
        .then(() => {
          messageApi.success(`Successfully updated ${bulkUpdateData.length} article positions`);
        })
        .catch((error) => {
          messageApi.error('Failed to update some article positions');
          console.error('Bulk update error:', error);
        })
        .finally(() => {
          isBulkUpdateRef.current = false;
        });
    });
  };

  const dataSource = data?.map((elem) => ({
    key: elem?.id,
    id: elem?.id,
    coverImage: elem?.coverImage,
    title: elem?.title,
    code: elem?.code,
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
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: 'coverImage',
      dataIndex: 'coverImage',
      title: 'Cover Image',
      width: 80,
      render: (coverImage) => (
        <Image
          src={coverImage}
          alt="Cover"
          width={100}
          height={60}
          preview
          style={{ objectFit: 'contain', borderRadius: '4px' }}
        />
      ),
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
      key: 'category',
      dataIndex: 'category',
      title: 'Category',
      render: (category) => (
        <div className="flex flex-col gap-1">
          <span>{category?.title}</span>
          <span>{category?.titleBn}</span>
        </div>
      ),
    },
    {
      key: 'Modified',
      dataIndex: 'modified',
      title: 'Modified',
      render: (modified) => (
        <div className="flex flex-col gap-1">
          <span>
            A: <b>{modified?.author}</b>
          </span>
          <span>
            C: <b>{modified?.createdBy}</b>
          </span>
          <span>
            P: <b>{modified?.publishedBy}</b>
          </span>
        </div>
      ),
    },
    {
      key: 'date',
      dataIndex: 'date',
      title: 'Date',
      render: (date) => (
        <div className="flex flex-col gap-1">
          <span>{dayjs(date).format('DD.MM.YYYY')}</span>
          <span>{dayjs(date).format('HH:mm a')}</span>
        </div>
      ),
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
