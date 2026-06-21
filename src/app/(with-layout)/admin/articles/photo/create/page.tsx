'use client';

import PageHeader from '@base/components/PageHeader';
import ArticlesForm from '@modules/articles/components/ArticlesForm';
import { ArticlesHooks } from '@modules/articles/lib/hooks';
import WithAuthorization from '@modules/auth/components/WithAuthorization';
import { Form, message } from 'antd';
import { useRouter } from 'next/navigation';
import React, { useState, useMemo } from 'react';

const CreatePhotoArticlePage = () => {
  const router = useRouter();
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [shouldReset, setShouldReset] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  const initialValues = useMemo(() => ({
    type: 'photo',
    isActive: true,
  }), []);

  const articleCreateFn = ArticlesHooks.useCreate({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          setBackendError(res.message);
          setShouldReset(false);
          return;
        }

        setBackendError(null);
        formInstance.resetFields();
        messageApi.success(res.message);
        setShouldReset(true);
        router.push('/admin/articles/photo/list');
      },
    },
  });

  return (
    <React.Fragment>
      {messageHolder}
      <PageHeader
        title="Create Photo Article"
        onBack={() => router.push('/admin/articles/photo/list')}
      />
      <div className="bg-white dark:bg-[#141414] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <ArticlesForm
          formType="create"
          form={formInstance}
          initialValues={initialValues}
          isLoading={articleCreateFn.isPending}
          onFinish={(values) => {
            setBackendError(null);
            articleCreateFn.mutate(values);
          }}
          shouldReset={shouldReset}
          backendError={backendError}
        />
      </div>
    </React.Fragment>
  );
};

export default WithAuthorization(CreatePhotoArticlePage, { allowedAccess: ['articles:write'] });
