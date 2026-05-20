'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import PollsFilter from '@modules/polls/components/PollsFilter';
import PollsForm from '@modules/polls/components/PollsForm';
import PollsList from '@modules/polls/components/PollsList';
import { PollsHooks } from '@modules/polls/lib/hooks';
import { IPollsFilter } from '@modules/polls/lib/interfaces';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const PollsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<IPollsFilter>(`?${searchParams.toString()}`);

  const pollsQuery = PollsHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const pollCreateFn = PollsHooks.useCreate({
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
        title="Polls"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {pollsQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['polls:write']}>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Create
            </Button>
          </Authorization>
        }
      />
      <PollsFilter
        initialValues={Toolbox.toCleanObject(Object.fromEntries(searchParams.entries()))}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), ...values });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
      />
      <PollsList
        isLoading={pollsQuery.isLoading}
        data={pollsQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: pollsQuery.data?.meta?.total,
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer width={640} title="Create a new poll" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <PollsForm
          form={formInstance}
          initialValues={{ isActive: true }}
          isLoading={pollCreateFn.isPending}
          onFinish={(values) => pollCreateFn.mutate(values)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(PollsPage, { allowedAccess: ['polls:read'] });
