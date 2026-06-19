import BaseModalWithoutClicker from '@base/components/BaseModalWithoutClicker';
import ConfirmationDialog from '@base/components/ConfirmationDialog';
import CustomSwitch from '@base/components/CustomSwitch';
import { getAccess } from '@modules/auth/lib/utils/client';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Drawer, Form, Space, Table, Tag, message } from 'antd';
import React, { useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { ENUM_POLLS_STATUS_TYPES } from '../lib/enums';
import { PollsHooks } from '../lib/hooks';
import { IPoll } from '../lib/interfaces';
import PollsForm from './PollsForm';
import PollsStatusForm from './PollsStatusForm';

interface IProps {
  isLoading: boolean;
  data: IPoll[];
  pagination: PaginationProps;
}

const PollsList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<IPoll>(null);
  const [updateStatusItem, setUpdateStatusItem] = useState<IPoll>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: '', content: '', onConfirm: () => {} });

  const pollUpdateFn = PollsHooks.useUpdate({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        setUpdateItem(null);
        setUpdateStatusItem(null);
        messageApi.success(res.message);
      },
    },
  });

  const dataSource = data?.map((elem) => ({
    key: elem?.id,
    id: elem?.id,
    title: elem?.statement,
    author: elem?.author?.name,
    status: elem?.status,
    isActive: elem?.isActive,
    createdAt: elem?.createdAt,
    createdBy: elem?.createdBy?.fullName,
    updatedAt: elem?.updatedAt,
    updatedBy: elem?.updatedBy?.fullName,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: 'title',
      dataIndex: 'title',
      title: 'Title',
    },
    {
      key: 'author',
      dataIndex: 'author',
      title: 'Author',
    },
    {
      key: 'status',
      dataIndex: 'status',
      title: 'Status',
      render: (status) => {
        const statusColorMap = {
          [ENUM_POLLS_STATUS_TYPES.Published]: 'success',
          [ENUM_POLLS_STATUS_TYPES.Drafted]: 'default',
          [ENUM_POLLS_STATUS_TYPES.Archived]: 'processing',
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
              getAccess(['polls:update'], () => {
                const action = checked ? 'activate' : 'deactivate';
                setConfirmationDialog({
                  open: true,
                  title: `${action.charAt(0).toUpperCase() + action.slice(1)} Poll`,
                  content: `Are you sure you want to ${action} "${record.title}"?`,
                  onConfirm: () => {
                    pollUpdateFn.mutate({
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
    {
      key: 'id',
      dataIndex: 'id',
      title: 'Action',
      align: 'center',
      render: (id) => (
        <Space>
          <Button
            onClick={() => {
              getAccess(['polls:update'], () => {
                const item = data?.find((item) => item.id === id);
                setUpdateStatusItem(item);
              });
            }}
          >
            Change Status
          </Button>
          <Button
            onClick={() => {
              getAccess(['polls:update'], () => {
                const item = data?.find((item) => item.id === id);
                setUpdateItem(item);
              });
            }}
          >
            <AiFillEdit />
          </Button>
        </Space>
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
      <BaseModalWithoutClicker
        width={640}
        title={`Update ${updateStatusItem?.statement}`}
        open={!!updateStatusItem?.id}
        onCancel={() => setUpdateStatusItem(null)}
        footer={null}
      >
        <PollsStatusForm
          form={formInstance}
          initialValues={{
            status: updateStatusItem?.status,
            date: updateStatusItem?.date,
          }}
          isLoading={pollUpdateFn.isPending}
          onFinish={(values) =>
            pollUpdateFn.mutate({
              id: updateStatusItem?.id,
              data: values,
            })
          }
        />
      </BaseModalWithoutClicker>
      <Drawer
        width={640}
        title={`Update ${updateItem?.statement}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
      >
        <PollsForm
          formType="update"
          form={formInstance}
          initialValues={{
            ...updateItem,
            options: updateItem?.options.map((option) => ({
              id: option.id,
              title: option.title,
              position: option.position,
            })),
            isActive: updateItem?.isActive,
          }}
          isLoading={pollUpdateFn.isPending}
          onFinish={(values) =>
            pollUpdateFn.mutate({
              id: updateItem?.id,
              data: values,
            })
          }
        />
      </Drawer>
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

export default PollsList;
