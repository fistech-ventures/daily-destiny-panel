import ConfirmationDialog from '@base/components/ConfirmationDialog';
import { getAccess } from '@modules/auth/lib/utils/client';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Table, Tag, message } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { AiFillDelete, AiFillEye } from 'react-icons/ai';
import { MdPublish } from 'react-icons/md';
import { Paths } from '@lib/constant';
import { EpaperVisualHooks } from '../lib/hooks';
import { Edition } from '../lib/interfaces';

dayjs.extend(relativeTime);

interface IProps {
  isLoading: boolean;
  data: Edition[];
  pagination: PaginationProps;
}

const EditionsList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const router = useRouter();
  const [messageApi, messageHolder] = message.useMessage();
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: '', content: '', onConfirm: () => {} });

  const publishEditionFn = EpaperVisualHooks.usePublishEdition({
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

  const deleteEditionFn = EpaperVisualHooks.useDeleteEdition({
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

  const dataSource = data?.map((elem) => ({
    key: elem?.id,
    id: elem?.id,
    publishDate: elem?.publishDate,
    pages: elem?.pages || [],
    status: elem?.status,
    createdAt: elem?.createdAt,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: 'publishDate',
      dataIndex: 'publishDate',
      title: 'Date',
      width: 160,
      render: (date) => dayjs(date).format('DD MMMM YYYY'),
    },
    {
      key: 'pages',
      dataIndex: 'pages',
      title: 'Pages',
      width: 100,
      render: (pages) => `${pages.length} pages`,
    },
    {
      key: 'status',
      dataIndex: 'status',
      title: 'Status',
      width: 120,
      render: (status: string) => (
        <Tag color={status === 'published' ? 'green' : status === 'draft' ? 'orange' : 'default'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      key: 'createdAt',
      dataIndex: 'createdAt',
      title: 'Created',
      width: 140,
      render: (date) => dayjs(date).fromNow(),
    },
    {
      key: 'id',
      dataIndex: 'id',
      title: 'Actions',
      align: 'center',
      width: 180,
      render: (id, record) => (
        <div className="flex gap-2 justify-center">
          <Button
            type="primary"
            ghost
            onClick={() => router.push(Paths.admin.epaperVisual.toId(id))}
          >
            <AiFillEye />
          </Button>
          {record.status === 'draft' && (
            <Button
              type="primary"
              loading={publishEditionFn.isPending}
              onClick={() => {
                getAccess(['epaper-visual:update'], () => {
                  setConfirmationDialog({
                    open: true,
                    title: 'Publish Edition',
                    content: `Are you sure you want to publish the edition for ${dayjs(record.publishDate).format('DD MMMM YYYY')}?`,
                    onConfirm: () => {
                      publishEditionFn.mutate(id);
                      setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} });
                    },
                  });
                });
              }}
            >
              <MdPublish />
            </Button>
          )}
          <Button
            danger
            onClick={() => {
              getAccess(['epaper-visual:delete'], () => {
                setConfirmationDialog({
                  open: true,
                  title: 'Delete Edition',
                  content: `Are you sure you want to delete the edition for ${dayjs(record.publishDate).format('DD MMMM YYYY')}? This will also delete all pages and hotspots.`,
                  onConfirm: () => {
                    deleteEditionFn.mutate(id);
                    setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} });
                  },
                });
              });
            }}
          >
            <AiFillDelete />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <React.Fragment>
      {messageHolder}
      <Table
        loading={isLoading}
        dataSource={dataSource}
        columns={columns}
        pagination={pagination}
        scroll={{ x: true }}
      />
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

export default EditionsList;
