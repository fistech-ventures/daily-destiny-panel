'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import SubCategoriesFilter from '@modules/sub-categories/components/SubCategoriesFilter';
import SubCategoriesForm from '@modules/sub-categories/components/SubCategoriesForm';
import SubCategoriesList from '@modules/sub-categories/components/SubCategoriesList';
import { SubCategoriesHooks } from '@modules/sub-categories/lib/hooks';
import { ISubCategoriesFilter } from '@modules/sub-categories/lib/interfaces';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const SubCategoriesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<ISubCategoriesFilter>(`?${searchParams.toString()}`);

  const subCategoriesQuery = SubCategoriesHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const subCategoryCreateFn = SubCategoriesHooks.useCreate({
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
        title="Sub Categories"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {subCategoriesQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['sub-categories:write']}>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Create
            </Button>
          </Authorization>
        }
      />
      <SubCategoriesFilter
        initialValues={Toolbox.toCleanObject(Object.fromEntries(searchParams.entries()))}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), ...values });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
      />
      <SubCategoriesList
        isLoading={subCategoriesQuery.isLoading}
        data={subCategoriesQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: subCategoriesQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
        meta={subCategoriesQuery.data?.meta}
      />
      <Drawer width={640} title="Create a new sub category" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <SubCategoriesForm
          form={formInstance}
          initialValues={{ isActive: true }}
          isLoading={subCategoryCreateFn.isPending}
          onFinish={(values) => subCategoryCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(SubCategoriesPage, { allowedAccess: ['sub-categories:read'] });
