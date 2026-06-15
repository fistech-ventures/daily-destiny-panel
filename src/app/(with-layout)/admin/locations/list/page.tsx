'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import LocationsFilter from '@modules/locations/components/LocationsFilter';
import LocationsForm from '@modules/locations/components/LocationsForm';
import LocationsList from '@modules/locations/components/LocationsList';
import { LocationsHooks } from '@modules/locations/lib/hooks';
import { ILocationsFilter } from '@modules/locations/lib/interfaces';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const LocationsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<ILocationsFilter>(`?${searchParams.toString()}`);

  const locationsQuery = LocationsHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const locationCreateFn = LocationsHooks.useCreate({
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
        title="Locations"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {locationsQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['locations:write']}>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Create
            </Button>
          </Authorization>
        }
      />
      <LocationsFilter
        initialValues={Toolbox.toCleanObject(Object.fromEntries(searchParams.entries()))}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), ...values });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
      />
      <LocationsList
        isLoading={locationsQuery.isLoading}
        data={locationsQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: locationsQuery.data?.meta?.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
        meta={locationsQuery.data?.meta}
      />
      <Drawer width={640} title="Create a new location" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <LocationsForm
          form={formInstance}
          initialValues={{ isActive: true, position: 0 }}
          isLoading={locationCreateFn.isPending}
          onFinish={(values) => locationCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(LocationsPage, { allowedAccess: ['locations:read'] });
