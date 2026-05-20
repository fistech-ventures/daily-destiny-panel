'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import AdsFilter from '@modules/ads/components/AdsFilter';
import AdsForm from '@modules/ads/components/AdsForm';
import AdsList from '@modules/ads/components/AdsList';
import { ENUM_ADS_TYPES } from '@modules/ads/lib/enums';
import { AdsHooks } from '@modules/ads/lib/hooks';
import { IAdsFilter } from '@modules/ads/lib/interfaces';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const AdsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<IAdsFilter>(`?${searchParams.toString()}`);

  const adsQuery = AdsHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const adCreateFn = AdsHooks.useCreate({
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
        title="Ads"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {adsQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['ads:write']}>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Create
            </Button>
          </Authorization>
        }
      />
      <AdsFilter
        initialValues={Toolbox.toCleanObject(Object.fromEntries(searchParams.entries()))}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), ...values });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
      />
      <AdsList
        isLoading={adsQuery.isLoading}
        data={adsQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: adsQuery.data?.meta?.total,
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer width={640} title="Create a new ad" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <AdsForm
          form={formInstance}
          initialValues={{ type: ENUM_ADS_TYPES.IMAGE, isActive: true }}
          isLoading={adCreateFn.isPending}
          onFinish={(values) => adCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(AdsPage, { allowedAccess: ['ads:read'] });
