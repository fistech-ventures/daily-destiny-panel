'use client';

import BaseSearch from '@base/components/BaseSearch';
import PageHeader from '@base/components/PageHeader';
import { Toolbox } from '@lib/utils';
import ArticlesFilter from '@modules/articles/components/ArticlesFilter';
import ArticlesList from '@modules/articles/components/ArticlesList';
import { ArticlesHooks } from '@modules/articles/lib/hooks';
import { IArticlesFilter } from '@modules/articles/lib/interfaces';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import { message, Tag } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

const PhotoArticlesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, messageHolder] = message.useMessage();
  const { page = 1, limit = 10, ...rest } = Toolbox.parseQueryParams<IArticlesFilter>(`?${searchParams.toString()}`);

  const articlesQuery = ArticlesHooks.useFind({
    options: {
      ...rest,
      type: 'photo',
      page,
      limit,
    },
  });

  return (
    <React.Fragment>
      {messageHolder}
      <PageHeader
        title="Photo Articles"
        subTitle={<BaseSearch />}
        tags={[<Tag key={1}>Total: {articlesQuery.data?.meta?.total || 0}</Tag>]}
      />
      <ArticlesFilter
        initialValues={Toolbox.toCleanObject(Object.fromEntries(searchParams.entries()))}
        onChange={(values) => {
          const params = Toolbox.toCleanObject({ ...Object.fromEntries(searchParams.entries()), ...values });
          const queryString = new URLSearchParams(params).toString();
          router.push(`?${queryString}`);
        }}
      />
      <ArticlesList
        pageType="photo"
        isLoading={articlesQuery.isLoading}
        data={articlesQuery.data?.data}
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

export default WithAuthorization(PhotoArticlesPage, { allowedAccess: ['articles:read'] });
