'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import ArticlesList from '@modules/articles/components/ArticlesList';
import { ArticlesHooks } from '@modules/articles/lib/hooks';
import { IArticlesFilter } from '@modules/articles/lib/interfaces';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import { Form, message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

const ArticlesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const {
    page = 1,
    limit = 10,
    status = 'Drafted',
  } = Toolbox.parseQueryParams<IArticlesFilter>(`?${searchParams.toString()}`);

  const articlesQuery = ArticlesHooks.useFind({
    options: {
      status,
      page,
      limit,
    },
  });

  console.warn('messageApi', messageApi);
  console.warn('formInstance', formInstance);

  return (
    <React.Fragment>
      {messageHolder}
      <PageHeader
        title="Drafted Articles"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {articlesQuery.data?.meta?.total || 0}</Tag>]}
      />
      <ArticlesList
        isLoading={articlesQuery.isLoading}
        data={articlesQuery.data?.data}
        pageType="drafted"
        pagination={{
          current: page,
          pageSize: limit,
          total: articlesQuery.data?.meta?.total,
          onChange: (page, limit) => {
            const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), page, limit });
            const queryString = new URLSearchParams(params).toString();
            router.push(`?${queryString}`);
          },
        }}
      />
    </React.Fragment>
  );
};

export default WithAuthorization(ArticlesPage, { allowedAccess: ['articles:read'] });
