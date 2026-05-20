'use client';

import WithAuthorization from '@modules/auth/components/WithAuthorization';
import SettingsIdentityForm from '@modules/settings/components/SettingsIdentityForm';
import SettingsScriptsForm from '@modules/settings/components/SettingsScriptsForm';
import SettingsTrackingCodesForm from '@modules/settings/components/SettingsTrackingCodesForm';
import { SettingsHooks } from '@modules/settings/lib/hooks';
import { Form, message, Spin, Tabs, TabsProps } from 'antd';
import { useRouter } from 'next/navigation';
import React from 'react';

const SettingsPage = () => {
  const router = useRouter();
  const [messageApi, messageHolder] = message.useMessage();
  const [identityFormInstance] = Form.useForm();
  const [trackingCodesFormInstance] = Form.useForm();
  const [scriptsFormInstance] = Form.useForm();

  const settingsQuery = SettingsHooks.useFind();

  const settingsUpdateFn = SettingsHooks.useUpdate({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        messageApi.success(res.message);
        router.refresh();
      },
    },
  });

  const items: TabsProps['items'] = [
    {
      key: 'identity',
      label: 'Identity',
      children: (
        <SettingsIdentityForm
          formType="update"
          form={identityFormInstance}
          isLoading={settingsQuery.isLoading}
          initialValues={settingsQuery.data?.data?.identity}
          onFinish={(values) => settingsUpdateFn.mutate({ identity: values })}
        />
      ),
    },
    {
      key: 'tracking-codes',
      label: 'Tracking Codes',
      children: (
        <SettingsTrackingCodesForm
          formType="update"
          form={trackingCodesFormInstance}
          isLoading={settingsQuery.isLoading}
          initialValues={settingsQuery.data?.data?.trackingCodes}
          onFinish={(values) =>
            settingsUpdateFn.mutate({
              trackingCodes: values,
            })
          }
        />
      ),
    },
    {
      key: 'scripts',
      label: 'Scripts',
      children: (
        <SettingsScriptsForm
          formType="update"
          form={scriptsFormInstance}
          isLoading={settingsQuery.isLoading}
          initialValues={{ scripts: settingsQuery.data?.data?.trackingScripts }}
          onFinish={(values) =>
            settingsUpdateFn.mutate({
              trackingScripts: values?.scripts,
            })
          }
        />
      ),
    },
  ];

  return (
    <React.Fragment>
      {messageHolder}
      {settingsQuery.isLoading ? <Spin /> : <Tabs defaultActiveKey={items[0].key} items={items} />}
    </React.Fragment>
  );
};

export default WithAuthorization(SettingsPage, { allowedAccess: ['settings:read'] });
