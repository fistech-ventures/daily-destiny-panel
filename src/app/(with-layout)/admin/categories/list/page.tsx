'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import CategoriesFilter from '@modules/categories/components/CategoriesFilter';
import CategoriesForm from '@modules/categories/components/CategoriesForm';
import CategoriesList from '@modules/categories/components/CategoriesList';
import { CategoriesHooks } from '@modules/categories/lib/hooks';
import { ICategoriesFilter } from '@modules/categories/lib/interfaces';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const CategoriesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<ICategoriesFilter>(`?${searchParams.toString()}`);

  const categoriesQuery = CategoriesHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const categoryCreateFn = CategoriesHooks.useCreate({
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
        title="Categories"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {categoriesQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['categories:write']}>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Create
            </Button>
          </Authorization>
        }
      />
      <CategoriesFilter
        initialValues={Toolbox.toCleanObject(Object.fromEntries(searchParams.entries()))}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), ...values });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
      />
      <CategoriesList
        isLoading={categoriesQuery.isLoading}
        data={categoriesQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: categoriesQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
        meta={categoriesQuery.data?.meta}
      />
      <Drawer width={640} title="Create a new category" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <CategoriesForm
          form={formInstance}
          initialValues={{ isActive: true }}
          isLoading={categoryCreateFn.isPending}
          onFinish={(values) => categoryCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(CategoriesPage, { allowedAccess: ['categories:read'] });
