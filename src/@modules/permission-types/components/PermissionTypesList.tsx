import CustomSwitch from '@base/components/CustomSwitch';
import { getAccess } from '@modules/auth/lib/utils/client';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Drawer, Form, message, Table } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { PermissionTypesHooks } from '../lib/hooks';
import { IPermissionType } from '../lib/interfaces';
import PermissionTypesForm from './PermissionTypesForm';

interface IProps {
  isLoading: boolean;
  data: IPermissionType[];
  pagination: PaginationProps;
}

const PermissionTypesList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<IPermissionType>(null);

  const permissionTypeUpdateFn = PermissionTypesHooks.useUpdate({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        setUpdateItem(null);
        messageApi.success(res.message);
      },
    },
  });

  const dataSource = data?.map((elem) => ({
    key: elem?.id,
    id: elem?.id,
    title: elem?.title,
    isActive: elem?.isActive,
    createdAt: elem?.createdAt,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: 'title',
      dataIndex: 'title',
      title: 'Title',
    },
    {
      key: 'createdAt',
      dataIndex: 'createdAt',
      title: 'Created At',
      render: (createdAt) => <p className="min-w-24">{dayjs(createdAt).format('DD-MM-YYYY')}</p>,
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
              getAccess(['role-manager-permission-types:update'], () => {
                permissionTypeUpdateFn.mutate({
                  id: record?.id,
                  data: {
                    isActive: checked,
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
      render: (id) => (
        <Button
          type="primary"
          onClick={() => {
            getAccess(['role-manager-permission-types:update'], () => {
              const item = data?.find((item) => item.id === id);
              setUpdateItem(item);
            });
          }}
        >
          <AiFillEdit />
        </Button>
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
      <Drawer
        width={450}
        title={`Update ${updateItem?.title}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
      >
        <PermissionTypesForm
          formType="update"
          form={formInstance}
          initialValues={{ ...updateItem, isActive: updateItem?.isActive }}
          isLoading={permissionTypeUpdateFn.isPending}
          onFinish={(values) =>
            permissionTypeUpdateFn.mutate({
              id: updateItem?.id,
              data: values,
            })
          }
        />
      </Drawer>
    </React.Fragment>
  );
};

export default PermissionTypesList;
