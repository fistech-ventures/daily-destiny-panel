'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import EpapersBulkUploadForm from '@modules/epapers/components/EpapersBulkUploadForm';
import EpapersFilter from '@modules/epapers/components/EpapersFilter';
import EpapersForm from '@modules/epapers/components/EpapersForm';
import EpapersList from '@modules/epapers/components/EpapersList';
import { EpapersHooks } from '@modules/epapers/lib/hooks';
import { EpapersServices } from '@modules/epapers/lib/services';
import { IEpapersFilter } from '@modules/epapers/lib/interfaces';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import dayjs from 'dayjs';

const EpapersPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [bulkFormInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isBulkDrawerOpen, setBulkDrawerOpen] = useState(false);
  const [existingPagesCount, setExistingPagesCount] = useState(0);
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<IEpapersFilter>(`?${searchParams.toString()}`);

  const epapersQuery = EpapersHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
      publicationName: 'Daily Destiny',
    },
  });

  const epaperCreateFn = EpapersHooks.useCreate({
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

  const epaperBulkUploadFn = EpapersHooks.useBulkUpload({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        setBulkDrawerOpen(false);
        bulkFormInstance.resetFields();
        messageApi.success(res.message);
      },
    },
  });

  const epaperAddPagesFn = EpapersHooks.useAddPagesToExisting({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        setBulkDrawerOpen(false);
        bulkFormInstance.resetFields();
        setExistingPagesCount(0);
        messageApi.success(res.message);
      },
    },
  });

  const handleBulkDateChange = async (date: any) => {
    if (date) {
      try {
        const dateStr = dayjs(date).format('YYYY-MM-DD');
        const existingPages = await EpapersServices.findPagesByDate(dateStr, 'Daily Destiny');
        setExistingPagesCount(existingPages?.data?.length || 0);
      } catch {
        setExistingPagesCount(0);
      }
    } else {
      setExistingPagesCount(0);
    }
  };

  return (
    <React.Fragment>
      {messageHolder}
      <PageHeader
        title="E-Papers"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {epapersQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['epapers:write']}>
            <div className="flex gap-2">
              <Button onClick={() => setBulkDrawerOpen(true)}>Bulk Upload</Button>
              <Button type="primary" onClick={() => setDrawerOpen(true)}>
                Create
              </Button>
            </div>
          </Authorization>
        }
      />
      <EpapersFilter
        initialValues={Toolbox.toCleanObject(Object.fromEntries(searchParams.entries()))}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), ...values });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
      />
      <EpapersList
        isLoading={epapersQuery.isLoading}
        data={epapersQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: epapersQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer width={640} title="Create a new E-Paper" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <EpapersForm
          form={formInstance}
          initialValues={{ isActive: true, publicationName: 'Daily Destiny' }}
          isLoading={epaperCreateFn.isPending}
          onFinish={(values) => epaperCreateFn.mutate({
            ...values,
            date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : values.date,
          })}
        />
      </Drawer>
      <Drawer width={800} title="Bulk Upload E-Papers" open={isBulkDrawerOpen} onClose={() => {
        setBulkDrawerOpen(false);
        setExistingPagesCount(0);
        bulkFormInstance.resetFields();
      }}>
        <EpapersBulkUploadForm
          form={bulkFormInstance}
          isLoading={epaperBulkUploadFn.isPending || epaperAddPagesFn.isPending}
          onFinish={(values) => epaperBulkUploadFn.mutate(values)}
          onAddPages={(values) => epaperAddPagesFn.mutate(values)}
          existingPagesCount={existingPagesCount}
          onDateChange={handleBulkDateChange}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(EpapersPage, { allowedAccess: ['epapers:read'] });
