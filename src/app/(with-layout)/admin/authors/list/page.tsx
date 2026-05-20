'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import AuthorsFilter from '@modules/authors/components/AuthorsFilter';
import AuthorsForm from '@modules/authors/components/AuthorsForm';
import AuthorsList from '@modules/authors/components/AuthorsList';
import { AuthorsHooks } from '@modules/authors/lib/hooks';
import { IAuthorsFilter } from '@modules/authors/lib/interfaces';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const AuthorsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<IAuthorsFilter>(`?${searchParams.toString()}`);

  const authorsQuery = AuthorsHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const authorCreateFn = AuthorsHooks.useCreate({
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

  return (
    <React.Fragment>
      {messageHolder}
      <PageHeader
        title="Authors"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {authorsQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['authors:write']}>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Create
            </Button>
          </Authorization>
        }
      />
      <AuthorsFilter
        initialValues={Toolbox.toCleanObject(Object.fromEntries(searchParams.entries()))}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), ...values });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
      />
      <AuthorsList
        isLoading={authorsQuery.isLoading}
        data={authorsQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: authorsQuery.data?.meta?.total,
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer width={640} title="Create a new author" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <AuthorsForm
          form={formInstance}
          initialValues={{ isActive: true }}
          isLoading={authorCreateFn.isPending}
          onFinish={(values) => authorCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(AuthorsPage, { allowedAccess: ['authors:read'] });
