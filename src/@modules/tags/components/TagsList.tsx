import CustomSwitch from '@base/components/CustomSwitch';
import { getAccess } from '@modules/auth/lib/utils/client';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Drawer, Form, Table, message } from 'antd';
import React, { useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { TagsHooks } from '@modules/tags/lib/hooks';
import { ITag } from '@modules/tags/lib/interfaces';
import TagsForm from './TagsForm';
import { IUser } from '@modules/users/lib/interfaces';

interface IProps {
  isLoading: boolean;
  data: ITag[];
  pagination: PaginationProps;
}

const TagsList: React.FC<IProps> = ({ isLoading, data, pagination }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<ITag>(null);

  const tagUpdateFn = TagsHooks.useUpdate({
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
    createdBy: elem?.createdBy,
    updatedAt: elem?.updatedAt,
    updatedBy: elem?.updatedBy,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: 'title',
      dataIndex: 'title',
      title: 'Title',
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
              getAccess(['tags:update'], () => {
                tagUpdateFn.mutate({
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
      key: 'createdAt',
      dataIndex: 'createdAt',
      title: 'Created At',
      render: (date: string) => (
        <span>
          {new Date(date).toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          })}
        </span>
      ),
    },
    {
      key: 'createdBy',
      dataIndex: 'createdBy',
      title: 'Created By',
      render: (userData: IUser) => (
        <span>
          {userData?.fullName}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      title: 'Updated At',
      render: (date: string) => (
        <span>
          {new Date(date).toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          })}
        </span>
      ),
    },
    {
      key: 'updatedBy',
      dataIndex: 'updatedBy',
      title: 'Updated By',
      render: (userData: IUser) => (
        <span>
          {userData?.fullName}
        </span>
      ),
    },
    {
      key: 'id',
      dataIndex: 'id',
      title: 'Action',
      align: 'center',
      render: (id) => (
        <Button
          onClick={() => {
            getAccess(['tags:update'], () => {
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
        width={640}
        title={`Update ${updateItem?.title}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
      >
        <TagsForm
          formType="update"
          form={formInstance}
          initialValues={{
            ...updateItem,
            isActive: updateItem?.isActive,
          }}
          isLoading={tagUpdateFn.isPending}
          onFinish={(values) =>
            tagUpdateFn.mutate({
              id: updateItem?.id,
              data: values,
            })
          }
        />
      </Drawer>
    </React.Fragment>
  );
};

export default TagsList;
