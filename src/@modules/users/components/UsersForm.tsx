import FloatInput from '@base/antd/components/FloatInput';
import FloatInputPassword from '@base/antd/components/FloatInputPassword';
import InfiniteScrollSelect from '@base/components/InfiniteScrollSelect';
import InputPhone from '@base/components/InputPhone';
import { TId } from '@base/interfaces';
import { Toolbox } from '@lib/utils';
import Authorization from '@modules/auth/components/Authorization';
import { hasAccessPermission } from '@modules/auth/lib/utils/client';
import { RolesHooks } from '@modules/roles/lib/hooks';
import { IRole } from '@modules/roles/lib/interfaces';
import { Button, Col, Form, FormInstance, message, Radio, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { IUserCreate } from '../lib/interfaces';

interface IProps {
  type?: 'Default' | 'Auth';
  isLoading: boolean;
  isRoles?: boolean;
  form: FormInstance;
  formType?: 'create' | 'update';
  initialValues?: Partial<IUserCreate>;
  onFinish: (values: IUserCreate) => void;
}

const UsersForm: React.FC<IProps> = ({
  type = 'Default',
  isLoading,
  isRoles = true,
  form,
  formType = 'create',
  initialValues,
  onFinish,
}) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [rolesForCreation, setRolesForCreation] = useState<string[]>([]);
  const [roleSearchTerm, setRoleSearchTerm] = useState(null);

  const rolesSpecificQuery = RolesHooks.useFindSpecifics({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }
      },
    },
  });

  const rolesQuery = RolesHooks.useFindInfinite({
    config: {
      queryKey: [],
      enabled: type === 'Default' && isRoles && hasAccessPermission(['role-manager-roles:read']),
    },
    options: {
      limit: 20,
      searchTerm: roleSearchTerm,
    },
  });

  const handleFinishFn = (values) => {
    let sanitizedRoles = null;

    if (type === 'Default' && formType === 'create') {
      sanitizedRoles = rolesForCreation;
    }

    if (type === 'Default' && formType === 'update' && isRoles && hasAccessPermission(['role-manager-roles:read'])) {
      const currentSanitizedRoles = values?.roles?.map((role: TId) => ({ role: role }));
      sanitizedRoles = Toolbox.computeArrayDiffs(initialValues?.roles, currentSanitizedRoles, 'role');
    }

    onFinish({ ...values, roles: sanitizedRoles });
  };

  useEffect(() => {
    form.resetFields();

    if (type === 'Default' && isRoles && hasAccessPermission(['role-manager-roles:read'])) {
      if (Toolbox.isNotEmpty(initialValues?.roles)) {
        const roles = initialValues?.roles?.map((role) => role?.role);
        rolesSpecificQuery.mutate(roles);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, initialValues]);

  return (
    <React.Fragment>
      {messageHolder}
      <Form
        autoComplete="off"
        size="large"
        layout="vertical"
        form={form}
        initialValues={{
          ...initialValues,
          roles: initialValues?.roles?.map((role) => role?.role),
        }}
        onFinish={handleFinishFn}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item
              name="fullName"
              rules={[
                {
                  required: true,
                  message: 'Full name is required!',
                },
              ]}
              className="!mb-0"
            >
              <FloatInput placeholder="Full Name" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="password"
              rules={[
                {
                  required: formType === 'create',
                  message: 'Password is required!',
                },
                {
                  min: 8,
                  message: 'Password must be at least 8 characters long!',
                },
              ]}
              className="!mb-0"
            >
              <FloatInputPassword placeholder="Password" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="phoneNumber"
              // rules={[
              //   {
              //     required: true,
              //     message: 'Phone number is required!',
              //   },
              // ]}
              className="!mb-0"
            >
              <InputPhone placeholder="Phone Number" size="large" />
            </Form.Item>
          </Col>
          {formType === 'create' && (
            <Col xs={24}>
              <Form.Item
                name="email"
                rules={[
                  {
                    type: 'email',
                    message: 'Email is not valid!',
                  },
                  {
                    required: true,
                    message: 'Email is required!',
                  },
                ]}
                className="!mb-0"
              >
                <FloatInput placeholder="Email" />
              </Form.Item>
            </Col>
          )}
          {type === 'Default' && isRoles && (
            <Authorization allowedAccess={['role-manager-roles:read']}>
              <Col xs={24} md={24}>
                <Form.Item
                  className="!mb-0"
                  rules={[
                    {
                      required: true,
                      message: 'Role is required!',
                    },
                  ]}
                  name="roles"
                >
                  <InfiniteScrollSelect<IRole>
                    isFloat
                    allowClear
                    showSearch
                    mode="multiple"
                    virtual={false}
                    placeholder="Roles"
                    initialOptions={rolesSpecificQuery.data?.data}
                    option={({ item: role }) => ({
                      key: role?.id,
                      label: role?.title,
                      value: role?.id,
                    })}
                    onChangeSearchTerm={(searchTerm) => setRoleSearchTerm(searchTerm)}
                    query={rolesQuery}
                    onChange={(_, option) => setRolesForCreation(option.map((op) => op.label))}
                  />
                </Form.Item>
              </Col>
            </Authorization>
          )}
          {type === 'Default' && (
            <Col xs={24}>
              <Form.Item name="isActive" className="!mb-0">
                <Radio.Group buttonStyle="solid" className="w-full text-center">
                  <Radio.Button className="w-1/2" value={true}>
                    Active
                  </Radio.Button>
                  <Radio.Button className="w-1/2" value={false}>
                    Inactive
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          )}
          <Col xs={24}>
            <Form.Item className="text-right !mb-0">
              <Button loading={isLoading} type="primary" htmlType="submit">
                {formType === 'create' ? 'Submit' : 'Update'}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </React.Fragment>
  );
};

export default UsersForm;
