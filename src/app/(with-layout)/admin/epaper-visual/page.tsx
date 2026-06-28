'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import EditionForm from '@modules/epaper-visual/components/EditionForm';
import EditionsList from '@modules/epaper-visual/components/EditionsList';
import EpaperVisualFilter from '@modules/epaper-visual/components/EpaperVisualFilter';
import { EpaperVisualHooks } from '@modules/epaper-visual/lib/hooks';
import { IEditionsFilter } from '@modules/epaper-visual/lib/interfaces';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const EpaperVisualPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<IEditionsFilter>(`?${searchParams.toString()}`);

  const editionsQuery = EpaperVisualHooks.useFindEditions({
    options: { ...rest, page, limit },
  });

  const createEditionFn = EpaperVisualHooks.useCreateEdition({
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
        title="ePaper Visual"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {editionsQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['epaper-visual:write']}>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Create Edition
            </Button>
          </Authorization>
        }
      />
      <EpaperVisualFilter
        initialValues={Toolbox.toCleanObject(Object.fromEntries(searchParams.entries()))}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), ...values });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
      />
      <EditionsList
        isLoading={editionsQuery.isLoading}
        data={editionsQuery.data?.data || []}
        pagination={{
          current: page,
          pageSize: limit,
          total: editionsQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer
        width={480}
        title="Create Edition"
        open={isDrawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          formInstance.resetFields();
        }}
        destroyOnClose
      >
        <EditionForm
          form={formInstance}
          isLoading={createEditionFn.isPending}
          onFinish={(values) => createEditionFn.mutate(values)}
          onCancel={() => {
            setDrawerOpen(false);
            formInstance.resetFields();
          }}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(EpaperVisualPage, {
  allowedAccess: ['epaper-visual:read', 'epaper-visual:write', 'epaper-visual:update', 'epaper-visual:delete', 'epapers:read', 'epapers:write', 'epapers:update', 'epapers:delete'],
});
