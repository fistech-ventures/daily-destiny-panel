'use client';

import { Env } from '.environments';
import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Paths } from '@lib/constant';
import useCopyClipboard from '@lib/hooks/useCopyClipboard';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import { AuthHooks } from '@modules/auth/lib/hooks';
import UsersFilter from '@modules/users/components/UsersFilter';
import UsersForm from '@modules/users/components/UsersForm';
import UsersList from '@modules/users/components/UsersList';
import { UsersHooks } from '@modules/users/lib/hooks';
import { IUsersFilter } from '@modules/users/lib/interfaces';
import { Button, Drawer, Form, Input, message, Modal, Popover, Space, Tag, Tooltip } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { FaCopy, FaMagic } from 'react-icons/fa';

const UsersPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [registrationHashFormInstance] = Form.useForm();
  const { isCopied, copyToClipboard } = useCopyClipboard();
  const [magicLink, setMagicLink] = useState(null);
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<IUsersFilter>(`?${searchParams.toString()}`);

  const usersQuery = UsersHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const userCreateFn = UsersHooks.useCreate({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        setDrawerOpen(false);
        formInstance.resetFields();
        messageApi.success(res.message);
      },
    },
  });

  const profileGenerateRegistrationLinkFn = UsersHooks.useGenerateRegistrationLink({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        setMagicLink(res.data?.hash);
      },
    },
  });

  const sendRegistrationLinkFn = AuthHooks.useSendRegistrationLink({
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

  return (
    <React.Fragment>
      {messageHolder}
      <PageHeader
        title="Users"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {usersQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['users:write']}>
            <Space>
              <Popover content="Generate Registration Link">
                <Button
                  type="dashed"
                  onClick={profileGenerateRegistrationLinkFn.mutate}
                  loading={profileGenerateRegistrationLinkFn.isPending}
                >
                  <FaMagic />
                </Button>
              </Popover>
              <Button type="primary" onClick={() => setDrawerOpen(true)}>
                Create
              </Button>
            </Space>
          </Authorization>
        }
      />
      <UsersFilter
        initialValues={Toolbox.toCleanObject(Object.fromEntries(searchParams.entries()))}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), ...values });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
      />
      <UsersList
        isLoading={usersQuery.isLoading}
        data={usersQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: usersQuery.data?.meta?.total,
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer width={640} title="Create a new user" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <UsersForm
          form={formInstance}
          initialValues={{ isActive: true }}
          isLoading={userCreateFn.isPending}
          onFinish={(values) => userCreateFn.mutate(values)}
        />
      </Drawer>
      <Modal
        destroyOnHidden
        width={420}
        title="Registration Link"
        footer={null}
        open={!!magicLink}
        onCancel={() => {
          setMagicLink(null);
          registrationHashFormInstance.resetFields();
        }}
      >
        <div className="mb-4 flex items-center justify-between rounded-lg border p-2">
          <p className="truncate">{`${Env.webHostUrl}${Paths.auth.register}?hash=${magicLink}`}</p>
          <Tooltip title={isCopied ? 'Copied!' : 'Copy'}>
            <Button
              className="shrink-0"
              type="text"
              icon={<FaCopy />}
              onClick={() => copyToClipboard(`${Env.webHostUrl}${Paths.auth.register}?hash=${magicLink}`)}
            />
          </Tooltip>
        </div>
        <Form
          size="large"
          layout="vertical"
          form={registrationHashFormInstance}
          onFinish={(values) =>
            sendRegistrationLinkFn.mutate({
              email: values?.email,
              registrationLink: `${Env.webHostUrl}${Paths.auth.register}?hash=${magicLink}`,
            })
          }
        >
          <Space.Compact className="w-full">
            <Form.Item
              name="email"
              rules={[
                {
                  type: 'email',
                  message: 'Provide valid email!',
                },
                {
                  required: true,
                  message: 'Email is required!',
                },
              ]}
              className="mb-0! w-full"
            >
              <Input placeholder="Email" />
            </Form.Item>
            <Form.Item className="mb-0!">
              <Button loading={sendRegistrationLinkFn.isPending} type="primary" htmlType="submit">
                Send
              </Button>
            </Form.Item>
          </Space.Compact>
        </Form>
      </Modal>
    </React.Fragment>
  );
};

export default WithAuthorization(UsersPage, { allowedAccess: ['users:read'] });
