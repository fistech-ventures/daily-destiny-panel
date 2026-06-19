'use client';

import PageHeader from '@base/components/PageHeader';
import ArticlesForm from '@modules/articles/components/ArticlesForm';
import { ArticlesHooks } from '@modules/articles/lib/hooks';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import { Form, Skeleton, message } from 'antd';
import dayjs from 'dayjs';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const EditArticlePage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [backendError, setBackendError] = useState<string | null>(null);
  
  // Get the referring page from query params or default to list
  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const from = urlParams.get('from');
      if (from) {
        return `/admin/articles/${from}`;
      }
    }
    return '/admin/articles/list';
  };

  const articleQuery = ArticlesHooks.useFindById({
    id,
    config: {
      queryKey: [],
      enabled: !!id,
    },
  });

  const articleUpdateFn = ArticlesHooks.useUpdate({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          setBackendError(res.message);
          return;
        }

        setBackendError(null);
        formInstance.resetFields();
        messageApi.success(res.message);
        router.push(getRedirectUrl());
      },
    },
  });

  useEffect(() => {
    if (articleQuery.data?.data) {
      const data = articleQuery.data.data;
      formInstance.setFieldsValue({
        id: data.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        details: data.details,
        coverImage: data.coverImage,
        type: data.type,
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId,
        authorId: data.authorId,
        tags: data.tags,
        position: typeof data.position === 'string' ? parseInt(data.position, 10) : (data.position || 0),
        isFeatured: data.isFeatured,
        isExclusive: data.isExclusive,
        isActive: data.isActive,
        status: data.status,
        language: data.language,
        date: data.date ? dayjs(data.date) : null,
        metaTitle: data.metaTitle || data.seoMetaData?.title || data.title,
        metaDescription: data.metaDescription || data.seoMetaData?.description || data.excerpt,
        medias: data.medias,
        coverImageCredit: '', // Default empty string for create form
      });
    }
  }, [articleQuery.data?.data, formInstance]);

  return (
    <React.Fragment>
      {messageHolder}
      <PageHeader
        title={`Edit Article - ${articleQuery.data?.data?.title || 'Loading...'}`}
        onBack={() => router.push('/admin/articles/list')}
      />
      <div className="bg-white dark:bg-[#141414] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        {articleQuery.isLoading ? (
          <Skeleton active />
        ) : (
          <ArticlesForm
            formType="update"
            form={formInstance}
            initialValues={{
              ...articleQuery.data?.data,
              position: typeof articleQuery.data?.data?.position === 'string' 
                ? parseInt(articleQuery.data?.data?.position, 10) 
                : (articleQuery.data?.data?.position || 0),
              isActive: articleQuery.data?.data?.isActive,
              coverImageCredit: '', // Default empty string for create form
            }}
            isLoading={articleUpdateFn.isPending}
            onFinish={(values) => {
              setBackendError(null);
              articleUpdateFn.mutate({
                id,
                data: values,
              });
            }}
            backendError={backendError}
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default WithAuthorization(EditArticlePage, { allowedAccess: ['articles:update'] });
