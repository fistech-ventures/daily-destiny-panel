import ConfirmationDialog from '@base/components/ConfirmationDialog';
import CustomSwitch from '@base/components/CustomSwitch';
import { getAccess } from '@modules/auth/lib/utils/client';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Drawer, Form, Table, message } from 'antd';
import React, { useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { UsersHooks } from '../lib/hooks';
import { IUser } from '../lib/interfaces';
import UsersForm from './UsersForm';

interface IProps {
  isLoading: boolean;
  isRoles?: boolean;
  data: IUser[];
  pagination: PaginationProps;
}

const UsersList: React.FC<IProps> = ({ isLoading, isRoles = true, data, pagination }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<IUser>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: '', content: '', onConfirm: () => {} });

  const userUpdateFn = UsersHooks.useUpdate({
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
    name: elem?.fullName,
    phoneNumber: elem?.phoneNumber,
    email: elem?.email,
    isActive: elem?.isActive,
    createdAt: elem?.createdAt,
    createdBy: elem?.createdBy?.fullName,
    updatedAt: elem?.updatedAt,
    updatedBy: elem?.updatedBy?.fullName,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: 'name',
      dataIndex: 'name',
      title: 'Name',
    },
    {
      key: 'phoneNumber',
      dataIndex: 'phoneNumber',
      title: 'Phone',
      render: (phoneNumber) => phoneNumber || 'N/A',
    },
    {
      key: 'email',
      dataIndex: 'email',
      title: 'Email',
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
              getAccess(['users:update'], () => {
                const action = checked ? 'activate' : 'deactivate';
                setConfirmationDialog({
                  open: true,
                  title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
                  content: `Are you sure you want to ${action} user "${record.email}"?`,
                  onConfirm: () => {
                    userUpdateFn.mutate({
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
        <Button
          onClick={() => {
            getAccess(['users:update'], () => {
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
        title={`Update ${updateItem?.fullName}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
      >
        <UsersForm
          isRoles={isRoles}
          formType="update"
          form={formInstance}
          initialValues={{
            ...updateItem,
            roles: updateItem?.roles?.map((role) => ({ role: role?.id })),
            isActive: updateItem?.isActive,
          }}
          isLoading={userUpdateFn.isPending}
          onFinish={(values) =>
            userUpdateFn.mutate({
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

export default UsersList;
