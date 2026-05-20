'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import MenusFilter from '@modules/menus/components/MenusFilter';
import MenusForm from '@modules/menus/components/MenusForm';
import MenusList from '@modules/menus/components/MenusList';
import { MenusHooks } from '@modules/menus/lib/hooks';
import { IMenusFilter } from '@modules/menus/lib/interfaces';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const MenusPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<IMenusFilter>(`?${searchParams.toString()}`);

  const menusQuery = MenusHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const menuCreateFn = MenusHooks.useCreate({
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
        title="Menus"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {menusQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['cms-menus:write']}>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Create
            </Button>
          </Authorization>
        }
      />
      <MenusFilter
        initialValues={Toolbox.toCleanObject(Object.fromEntries(searchParams.entries()))}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), ...values });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
      />
      <MenusList
        isLoading={menusQuery.isLoading}
        data={menusQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: menusQuery.data?.meta?.total,
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer width={640} title="Create a new menu" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <MenusForm
          form={formInstance}
          initialValues={{ isActive: true }}
          isLoading={menuCreateFn.isPending}
          onFinish={(values) => menuCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(MenusPage, { allowedAccess: ['cms-menus:read'] });
