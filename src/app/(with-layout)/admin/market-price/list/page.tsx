'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import MarketPricesFilter from '@modules/market-prices/components/MarketPricesFilter';
import MarketPricesForm from '@modules/market-prices/components/MarketPricesForm';
import MarketPricesList from '@modules/market-prices/components/MarketPricesList';
import { MarketPricesHooks } from '@modules/market-prices/lib/hooks';
import { IMarketPricesFilter } from '@modules/market-prices/lib/interfaces';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const MarketPricesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const {
    page = 1,
    limit = 10,
    ...rest
  } = Toolbox.parseQueryParams<IMarketPricesFilter>(`?${searchParams.toString()}`);

  const marketPricesQuery = MarketPricesHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const createMutation = MarketPricesHooks.useCreate({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        setDrawerOpen(false);
        messageApi.success(res.message);
      },
      onError: (error: any) => {
        messageApi.error(error?.message || 'Failed to create market price');
      },
    },
  });

  return (
    <React.Fragment>
      {messageHolder}
      <PageHeader
        title="Market Prices"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {marketPricesQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['market-prices:write']}>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Create
            </Button>
          </Authorization>
        }
      />
      <MarketPricesFilter
        initialValues={Toolbox.toCleanObject(Object.fromEntries(searchParams.entries()))}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), ...values });
          const queryString = new URLSearchParams(params as any).toString();
          router.push(`?${queryString}`);
        }}
      />
      <MarketPricesList
        isLoading={marketPricesQuery.isLoading}
        data={marketPricesQuery.data?.data || []}
        pagination={{
          current: page,
          pageSize: limit,
          total: marketPricesQuery.data?.meta?.total,
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params as any).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer
        width={640}
        title="Create a new market price tracker"
        open={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <MarketPricesForm
          form={formInstance}
          initialValues={{ isActive: true, position: 1 }}
          isLoading={createMutation.isPending}
          onFinish={(values) => createMutation.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(MarketPricesPage, { allowedAccess: ['market-prices:read'] });
