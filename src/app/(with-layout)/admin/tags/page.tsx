'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import TagsFilter from '@modules/tags/components/TagsFilter';
import TagsForm from '@modules/tags/components/TagsForm';
import TagsList from '@modules/tags/components/TagsList';
import { TagsHooks } from '@modules/tags/lib/hooks';
import { ITagsFilter } from '@modules/tags/lib/interfaces';
import { Button, Drawer, Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const TagsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<ITagsFilter>(`?${searchParams.toString()}`);

  const tagsQuery = TagsHooks.useFind({
    options: {
      ...rest,
      page,
      limit,
    },
  });

  const tagCreateFn = TagsHooks.useCreate({
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
        title="Tags"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {tagsQuery.data?.meta?.total || 0}</Tag>]}
        extra={
          <Authorization allowedAccess={['tags:write']}>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Create
            </Button>
          </Authorization>
        }
      />
      <TagsFilter
        initialValues={Toolbox.toCleanObject(Object.fromEntries(searchParams.entries()))}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), ...values });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
      />
      <TagsList
        isLoading={tagsQuery.isLoading}
        data={tagsQuery.data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: tagsQuery.data?.meta?.total,
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
      <Drawer width={640} title="Create a new tag" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <TagsForm
          form={formInstance}
          initialValues={{ isActive: true }}
          isLoading={tagCreateFn.isPending}
          onFinish={(values) => tagCreateFn.mutate(values as any)}
        />
      </Drawer>
    </React.Fragment>
  );
};

export default WithAuthorization(TagsPage, { allowedAccess: ['tags:read'] });
