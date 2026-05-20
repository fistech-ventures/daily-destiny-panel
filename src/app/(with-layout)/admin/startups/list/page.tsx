'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import StartupsFilter from '@modules/startups/components/StartupsFilter';
import StartupsForm from '@modules/startups/components/StartupsForm';
import StartupsList from '@modules/startups/components/StartupsList';
import { StartupsHooks } from '@modules/startups/lib/hooks';
import { IStartupsFilter } from '@modules/startups/lib/interfaces';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const StartupsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<IStartupsFilter>(`?${searchParams.toString()}`);

  const startupsQuery = StartupsHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const startupCreateFn = StartupsHooks.useCreate({
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
        title="Startups"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {startupsQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['startups:write']}>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Create
            </Button>
          </Authorization>
        }
      />
      <StartupsFilter
        initialValues={Toolbox.toCleanObject(Object.fromEntries(searchParams.entries()))}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), ...values });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
      />
      <StartupsList
        isLoading={startupsQuery.isLoading}
        data={startupsQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: startupsQuery.data?.meta?.total,
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer width={640} title="Create a new startup" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <StartupsForm
          form={formInstance}
          initialValues={{ isActive: true }}
          isLoading={startupCreateFn.isPending}
          onFinish={(values) => startupCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(StartupsPage, { allowedAccess: ['startups:read'] });
