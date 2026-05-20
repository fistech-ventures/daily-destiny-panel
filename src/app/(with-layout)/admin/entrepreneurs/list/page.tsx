'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import EntrepreneursFilter from '@modules/entrepreneurs/components/EntrepreneursFilter';
import EntrepreneursForm from '@modules/entrepreneurs/components/EntrepreneursForm';
import EntrepreneursList from '@modules/entrepreneurs/components/EntrepreneursList';
import { EntrepreneursHooks } from '@modules/entrepreneurs/lib/hooks';
import { IEntrepreneursFilter } from '@modules/entrepreneurs/lib/interfaces';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const EntrepreneursPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const {
    page = 1,
    limit = 10,
    ...rest
  } = Toolbox.parseQueryParams<IEntrepreneursFilter>(`?${searchParams.toString()}`);

  const entrepreneursQuery = EntrepreneursHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const entrepreneurCreateFn = EntrepreneursHooks.useCreate({
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
        title="Entrepreneurs"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {entrepreneursQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['entrepreneurs:write']}>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Create
            </Button>
          </Authorization>
        }
      />
      <EntrepreneursFilter
        initialValues={Toolbox.toCleanObject(Object.fromEntries(searchParams.entries()))}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), ...values });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
      />
      <EntrepreneursList
        isLoading={entrepreneursQuery.isLoading}
        data={entrepreneursQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: entrepreneursQuery.data?.meta?.total,
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer width={640} title="Create a new entrepreneur" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <EntrepreneursForm
          form={formInstance}
          initialValues={{ isActive: true }}
          isLoading={entrepreneurCreateFn.isPending}
          onFinish={(values) => entrepreneurCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(EntrepreneursPage, { allowedAccess: ['entrepreneurs:read'] });
