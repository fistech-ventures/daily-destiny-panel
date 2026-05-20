'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import PagesFilter from '@modules/pages/components/PagesFilter';
import PagesForm from '@modules/pages/components/PagesForm';
import PagesList from '@modules/pages/components/PagesList';
import { PagesHooks } from '@modules/pages/lib/hooks';
import { IPagesFilter } from '@modules/pages/lib/interfaces';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const PagesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<IPagesFilter>(`?${searchParams.toString()}`);

  const pagesQuery = PagesHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const pageCreateFn = PagesHooks.useUpsert({
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
        title="Pages"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {pagesQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['cms-pages:write']}>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Create
            </Button>
          </Authorization>
        }
      />
      <PagesFilter
        initialValues={Toolbox.toCleanObject(Object.fromEntries(searchParams.entries()))}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), ...values });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
      />
      <PagesList
        isLoading={pagesQuery.isLoading}
        data={pagesQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: pagesQuery.data?.meta?.total,
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer width={640} title="Create a new page" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <PagesForm
          form={formInstance}
          initialValues={{ isActive: true }}
          isLoading={pageCreateFn.isPending}
          onFinish={(values) => pageCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(PagesPage, { allowedAccess: ['cms-pages:read'] });
